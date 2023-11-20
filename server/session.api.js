const { EventEmitter } = require("events");
const { getDB, writeDB } = require("./db.utils.js");
const { updateUser, findUserById } = require("./users.api");

const emitter = new EventEmitter();
const EVENT_TYPES = {
  CONNECT: "connect",
  ACTION: "action",
  STATE: "state",
};

const applySessionToUser = (userId, sessionId) => {
  const user = findUserById(userId);

  if (user == null) {
    return;
  }

  const history = user.history || [];

  if (history.includes(sessionId)) {
    return;
  }

  history.push(sessionId);

  updateUser(user.id, { history });
};

const init = (app) => {
  const dbName = "sessions";
  let _sessions = getDB(dbName) || {};

  const onSessionChange = (sessionId, session) => {
    emitter.emit(EVENT_TYPES.STATE, { id: sessionId, state: session });

    _sessions = writeDB(dbName, {
      ..._sessions,
      [sessionId]: session,
    });
  };

  const addSessionUser = (sessionId, userId) => {
    const session = _sessions[sessionId];

    if (!session) {
      return;
    }

    applySessionToUser(userId, sessionId);

    if (!session.users) {
      session.users = [];
    }

    if (!session.users.includes(userId)) {
      session.users.push(userId);

      onSessionChange(sessionId, session);
    }
  };

  app.get("/api/sessions/:sessionId", (req, res) => {
    const sessionId = req.params.sessionId;

    if (_sessions[sessionId] == null) {
      return res.status(404).json({ message: "No session found" });
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

    applySessionToUser(ownerId, sessionId);

    onSessionChange(sessionId, session);

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

  app.post("/api/sessions/:sessionId/users", (req, res) => {
    const sessionId = req.params.sessionId;
    const body = req.body;

    addSessionUser(sessionId, body.id);

    res.status(200).end();
  });
};

module.exports = init;
