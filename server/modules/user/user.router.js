const express = require("express");
const { get, post, update, postHistory } = require("./user.controller");
const { get: getSession } = require("../session/session.controller");
const { reducer, UserActionTypes } = require("./user.reducer.js");
const { reducer: voucherReducer, VoucherActionType } = require("../voucher/voucher.reducer.js");

const router = express.Router();

router.get("/users", async (req, res) => {
  const { authId, id } = req.query;

  const record = await get({ authId, id });

  if (record == null) {
    return res.status(404).json(null);
  }

  res.status(200).json(record);
});

router.get("/users/:id", async (req, res) => {
  const { id } = req.params;

  const record = await get({ id });

  if (record == null) {
    return res.status(404).json(null);
  }

  const { assets, blockedAssets, ...other } = record;
  const blockedValue = !blockedAssets
    ? 0
    : blockedAssets.reduce((prev, { value }) => {
        return prev + value;
      }, 0);

  const user = Object.assign(
    {
      assets: assets - blockedValue,
    },
    blockedAssets,
    other
  );

  res.status(200).json(user);
});

router.post("/users", async (req, res) => {
  const body = req.body;

  const record = await post(body);

  if (record == null) {
    return res.status(400).json(null);
  }

  res.status(200).json(record);
});

router.post("/users/:id/transaction", async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const [error, user] = await reducer(
    id,
    UserActionTypes.ApplyTransaction,
    body
  );

  if (error) {
    return res.status(400).json({ error: error });
  }

  const record = await update(id, Object.assign({}, user));

  res.status(200).json(record);
});

router.post("/users/:id/voucher", async (req, res) => {
  const { id } = req.params;

  const [voucherError, voucher] = await voucherReducer(VoucherActionType.Use, { tag: req.body?.voucher }, true);

  if (voucherError || !voucher) {
    return res.status(400).json({ error: voucherError || 'Voucher not found' });
  }

  const [error, user] = await reducer(
    id,
    UserActionTypes.ApplyVoucher,
    voucher,
    true
  );

  if (error) {
    return res.status(400).json({ error: error });
  }

  const record = await update(id, Object.assign({}, user));

  res.status(200).json(record);
});

router.post("/users/:id/sessions", async (req, res) => {
  const { id } = req.params;
  const { sessionId } = req.body;

  let record = await postHistory(id, sessionId);

  if (record == null) {
    return res.status(404).json(null);
  }

  res.status(200).json(record);
});

router.get("/users/:id/history", async (req, res) => {
  const { id } = req.params;

  const record = await get({ id });

  if (record == null) {
    return res.status(404).json(null);
  }

  const history = record.history || [];
  const historyRecords = await Promise.all(
    history.map((sessionId) => {
      return getSession({ id: sessionId });
    })
  );

  res.status(200).json(historyRecords.filter((it) => it != null));
});

module.exports = router;
