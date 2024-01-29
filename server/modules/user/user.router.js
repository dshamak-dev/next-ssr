const express = require("express");
const { get, post, update, postHistory } = require("./user.controller");
const { get: getSession } = require("../session/session.controller");
const { reducer, UserActionTypes } = require("./user.reducer.js");
const {
  reducer: voucherReducer,
  VoucherActionType,
} = require("../voucher/voucher.reducer.js");
const jwt = require("jsonwebtoken");
const { joinMongoRecords } = require("../../scripts/support.js");

const router = express.Router();

router.post("/auth", async (req, res) => {
  const { email, password, csrfToken } = req.body;

  if (!email || !password) {
    return res.status(400).json(null).end();
  }

  let user;

  try {
    user = await get({ email });
  } catch (error) {
    console.log(error);

    return res.status(400).json(null).end();
  }

  if (!user) {
    user = await post({
      email,
      password,
      authId: email,
    });
  } else if (user.password !== password) {
    console.log("invalid", { user, password });
    return res.status(400).json(null).end();
  }

  const { authId, id } = user;

  const tokenData = { email, authId, id };

  const accessToken = jwt.sign(tokenData, csrfToken);

  res
    .setHeader("Authorization", `Bearer ${accessToken}`)
    .status(200)
    .json(tokenData)
    .end();
});

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

  const normalizedAssets = Number(assets) - Number(blockedValue);

  const user = joinMongoRecords(other, {
    assets: normalizedAssets,
    blockedAssets,
  });

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

router.post("/users/:id/blockassets", async (req, res) => {
  const { id } = req.params;
  const { value, title, sourceType, sourceId } = req.body;

  const [error, user] = await reducer(id, UserActionTypes.BlockAssets, {
    value,
    title,
    sourceType,
    sourceId,
  });

  if (error) {
    return res.status(400).json({ error: error });
  }

  res.status(200).json(user);
});
router.post("/users/:id/resolveassets", async (req, res) => {
  const { id } = req.params;
  const { sourceId, revert = false } = req.body;

  const [error, user] = await reducer(
    id,
    UserActionTypes.ResolveBlockedAssets,
    { sourceId, revert }
  );

  if (error) {
    return res.status(400).json({ error: error });
  }

  res.status(200).json(user);
});

router.post("/users/:id/voucher", async (req, res) => {
  const { id } = req.params;
  const voucherTag = req.body?.voucher;

  const [voucherError, voucher] = await voucherReducer(
    VoucherActionType.Use,
    { tag: voucherTag },
    true
  );

  if (voucherError || !voucher) {
    return res.status(400).json({ error: voucherError || "Voucher not found" });
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

  let history = record.history || [];
  // todo: remove migration
  history = history.map((it) => {
    if (typeof it !== "object") {
      return { sourceId: it, sourceType: "session" };
    }
    return it;
  });

  const historyRecords = await Promise.all(
    history.map(({ sourceId, sourceType, updatedAt }) => {
      if (sourceType !== "session") {
        return null;
      }

      return getSession({ id: sourceId }).then((res) => {
        if (!res) {
          return res;
        }

        return {
          title: res.title,
          url: `/${sourceType}/${sourceId}`,
          updatedAt,
        };
      });
    })
  );

  res.status(200).json(historyRecords.filter((it) => it != null));
});

module.exports = router;
