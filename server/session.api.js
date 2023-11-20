const { EventEmitter } = require("events");
const { getDB, writeDB } = require("./db.utils.js");
const { updateUser, findUserById } = require("./users.api");

const emitter = new EventEmitter();
const EVENT_TYPES = {
  CONNECT: "connect",
  ACTION: "action",
  STATE: "state",
};

const dbName = "sessions";
let _sessions = getDB(dbName) || {};

const applySessionToUser = (userId, sessionId) => {
  const user = findUserById(userId);

  if (user == null) {
    return;
  }

  const _sessionId = String(sessionId);
  const history = user.history || [];

  if (history.includes(_sessionId)) {
    return;
  }

  history.push(_sessionId);

  updateUser(user.id, { history });
};

const findSessionById = (id, keys = []) => {
  if (!_sessions) {
    return null;
  }

  const _session = _sessions[id];

  if (!_session) {
    return null;
  }

  if (keys != null && keys.length > 0) {
    return keys.reduce((_all, key) => {
      return Object.assign(_all, {
        [key]: _session[key],
      });
    }, {});
  }

  return _session;
};

function onSessionChange(sessionId, session) {
  emitter.emit(EVENT_TYPES.STATE, { id: sessionId, state: session });

  _sessions = writeDB(dbName, {
    ..._sessions,
    [sessionId]: session,
  });
};

function addSessionUser(sessionId, userId) {
  const session = Object.assign({}, _sessions[sessionId]);

  if (!session) {
    return;
  }

  if (!session.users) {
    session.users = [];
  }

  if (!session.users.find((it) => it.id == userId)) {
    const userShort = findUserById(userId, ["id", "name"]);
    const userState = {
      ...userShort,
      status: "pending",
    };

    session.users.push(userState);

    applySessionToUser(userId, sessionId);

    onSessionChange(sessionId, session);
  }
};

// const removeSessionUser = (sessionId, userId) => {
//   const session = Object.assign({}, _sessions[sessionId]);

//   if (!session || !session.users || !session.users.length) {
//     return;
//   }

//   onSessionChange(sessionId, session);
// };

const init = (app) => {
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
      users: [],
    };

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

  app.delete("/api/sessions/:sessionId/users/:userId", (req, res) => {
    const {sessionId, userId} = req.params.sessionId;

    removeSessionUser(sessionId, userId);

    res.status(200).end();
  });
};

module.exports = {
  findSessionById,
  useSessionApi: init,
};
