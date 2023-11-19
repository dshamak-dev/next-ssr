const { EventEmitter } = require("events");
const { getDB, writeDB } = require("./db.utils.js");

const emitter = new EventEmitter();
const EVENT_TYPES = {
  CONNECT: "connect",
  ACTION: "action",
  STATE: "state",
};

const init = (app) => {
  const dbName = "sessions";
  let _sessions = getDB(dbName) || {};

  app.get("/api/sessions/:sessionId", (req, res) => {
    const sessionId = req.params.sessionId;

    if (_sessions[sessionId] == null) {
      return res.status(404);
    } else {
      res.json(_sessions[sessionId]);
    }
  });

  app.post("/api/sessions/", (req, res) => {
    const sessionId = Date.now();
    const body = req.body;
    const { ownerId } = body;

    const session = {
      ownerId,
      id: sessionId,
      users: [
        {
          id: ownerId,
        },
      ],
    };

    _sessions = writeDB(dbName, {
      ..._sessions,
      [sessionId]: session,
    });

    res.status(200).json(session);
  });

  // Long Pulling

  app.get("/api/sessions/:sessionId/listen", (req, res) => {
    const sessionId = req.params.sessionId;

    emitter.once(EVENT_TYPES.STATE, ({ id, state }) => {
      if (sessionId == id) {
        res.json(state);
      }
    });
  });

  app.post("/api/sessions/:sessionId/state", (req, res) => {
    const sessionId = req.params.sessionId;
    const body = req.body;

    emitter.emit(EVENT_TYPES.STATE, { id: sessionId, state: body });

    res.status(200);
  });
};

module.exports = init;
