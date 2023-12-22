const express = require("express");
const { get, post, getSessionUserState } = require("./session.controller");
const { postHistory } = require("../user/user.controller");
const { reducer } = require("./session.reducer.js");
const { SessionStageType } = require("./session.model.js");

const router = express.Router();

router.get("/sessions/:id", async (req, res) => {
  const { id } = req.params;

  const record = await get({ id });

  if (record == null) {
    return res.status(404).json(null);
  }

  res.status(200).json(record);
});

router.post("/sessions", async (req, res) => {
  const body = req.body;

  const record = await post(Object.assign({
    stage: SessionStageType.Draft
  }, body));

  if (record == null) {
    return res.status(400).json(null);
  }

  await postHistory(record.ownerId, record.id);

  res.status(200).json(record);
});

router.get("/sessions/:sessionId/:userId", async (req, res) => {
  const { sessionId, userId } = req.params;

  const session = await get({ id: sessionId });

  if (!session) {
    return res.status(404).json({ error: "no session found" });
  }

  const [error, state] = await getSessionUserState(session, userId);

  if (error) {
    return res.status(400).json({ error });
  }

  res.status(200).json(state);
});

router.put("/sessions/:id/action", async (req, res) => {
  const { id } = req.params;
  const { userId, action, payload } = req.body;

  const [error, data] = await reducer(action, id, userId, payload);

  if (error != null) {
    return res.status(400).json({ error });
  }

  const [stateError, state] = await getSessionUserState(data, userId);

  if (stateError != null) {
    return res.status(400).json({ error: stateError });
  }

  res.status(200).json(state);
});

module.exports = router;
