const express = require("express");
const { get, post, update, remove } = require("./profile.controller");

const router = express.Router();

router.get("/profile", async (req, res) => {
  const { authId, id } = req.query;

  const record = await get({ authId, id });

  if (record == null) {
    return res.status(404).json(null);
  }

  res.status(200).json(record);
});

router.get("/profile/:id", async (req, res) => {
  const { id } = req.params;

  const record = await get({ id });

  if (record == null) {
    return res.status(404).json(null);
  }

  res.status(200).json(record);
});

router.post("/profile", async (req, res) => {
  const body = req.body;

  const record = await post(body);

  if (record == null) {
    return res.status(400).json(null);
  }

  res.status(200).json(record);
});

router.post("/profile/:id/transaction", async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  let user = await get({ id });

  if (!user) {
    return res.status(404).json(null);
  }

  const transactions = user.transactions || [];
  let assets = Number(user.assets) || 0;

  assets += Number(body.value);

  transactions.push(body);

  const record = await update(
    id,
    Object.assign(user, {
      transactions,
      assets,
    })
  );

  res.status(200).json(record);
});

module.exports = router;
