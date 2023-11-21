const { EventEmitter } = require("events");
const { clientsDB, sessionsDB } = require("./tables");
const { uid, reduceRecord } = require("./support.js");

const emitter = new EventEmitter();
const EVENT_TYPES = {
  CONNECT: "connect",
  ACTION: "action",
  STATE: "state",
};

const triggerSessionUpdate = (id, session) => {
  emitter.emit(EVENT_TYPES.STATE, { id, state: session });
};

const extendSession = (session) => {
  if (!session || !session.users?.length) {
    return session;
  }

  const users = session.users.map((id) => {
    const user = clientsDB.find({ id });

    return reduceRecord(user, ["id", "email", "name"]);
  }).filter(it => it != null);

  return Object.assign({}, session, { users });
};

const init = (app) => {
  app.get("/api/sessions/:sessionId", (req, res) => {
    const id = req.params.sessionId;

    const session = sessionsDB.find({ id });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    } else {
      res.json(extendSession(session));
    }
  });

  app.post("/api/sessions/", (req, res) => {
    const { ownerId } = req.body;

    const session = {
      ownerId,
      id: uid(),
      users: [],
    };

    sessionsDB.add(session);

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

  app.put("/api/sessions/:sessionId", (req, res) => {
    const sessionId = req.params.sessionId;
    const body = req.body;

    const session = sessionsDB.find({ id });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    }

    const _updated = sessionsDB.patch({ id }, body);

    triggerSessionUpdate(sessionId, _updated);

    res.status(200).end();
  });

  app.post("/api/sessions/:sessionId/users", (req, res) => {
    const id = req.params.sessionId;
    const { id: userId } = req.body;

    const session = sessionsDB.find({ id });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    }

    const sessionUsers = session.users || [];

    if (!sessionUsers.includes(userId)) {
      sessionUsers.push(userId);

      const _updated = sessionsDB.patch({ id }, { users: sessionUsers });

      triggerSessionUpdate(id, extendSession(_updated));
    }

    res.status(200).end();
  });
};

module.exports = {
  useSessionApi: init,
};
