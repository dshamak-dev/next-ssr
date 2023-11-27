const { EventEmitter } = require("events");
const { clientsDB, sessionsDB } = require("../scripts/tables");
const { uid } = require("../scripts/support.js");
const {
  findSession,
  extendSession,
  getSessionClients,
  SESSION_NAMINGS,
  createSession,
  resolveSession,
  getUserSessionState,
  addSessionParticipant,
} = require("../controls/session.controls.js");

const emitter = new EventEmitter();
const EVENT_TYPES = {
  CONNECT: "connect",
  ACTION: "action",
  STATE: "state",
};

const triggerSessionUpdate = (id, session) => {
  emitter.emit(EVENT_TYPES.STATE, { id, state: session });
};

const init = (app) => {
  app.get("/api/sessions/:sessionId", (req, res) => {
    const id = String(req.params.sessionId).toLocaleLowerCase();

    const session = findSession({ id });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    } else {
      res.json(extendSession(session));
    }
  });

  app.post("/api/sessions/", (req, res) => {
    const { ownerId } = req.body;

    const session = createSession(ownerId);

    res.status(200).json(session);
  });

  app.post("/api/sessions/:sessionId/users", (req, res) => {
    const sessionId = req.params.sessionId;
    const { id: userId, ...otherUserData } = req.body;

    const session = sessionsDB.find({ id: sessionId });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    }

    const client = clientsDB.find({ id: userId });
    const hasClientMatch = client != null;

    if (!hasClientMatch) {
      return res.status(404).json({ error: "No such client" });
    }

    const history = client.history || [];

    if (!history.includes(sessionId)) {
      history.push(sessionId);

      clientsDB.patch({ id: userId }, { history });
    }

    const sessionUsers = getSessionClients(session);

    if (!sessionUsers.find((it) => it.id === userId)) {
      sessionUsers.push({ ...otherUserData, id: userId });

      const _updated = sessionsDB.patch(
        { id: sessionId },
        { users: sessionUsers }
      );

      const json = extendSession(session);

      triggerSessionUpdate(sessionId, json);

      return res.status(200).json(json);
    }

    res.status(200).json(extendSession(session));
  });

  app.post("/api/sessions/:id/bids", (req, res) => {
    const sessionId = req.params.id;
    const { userId, value, autoActivation = false } = req.body;
    const clientBid = Number(value) || 0;

    let session = sessionsDB.find({ id: sessionId });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    }

    const sessionClients = getSessionClients(session);
    const clientIndex = sessionClients.findIndex(({ id }) => id === userId);

    const hasClientMatch = clientIndex !== -1;

    if (!hasClientMatch) {
      session = addSessionParticipant(session.id, { id: userId });
      // return res.status(404).json({ error: "No such client" });
    }

    const sessionBid = Number(session[SESSION_NAMINGS.bidValue]) || 0;

    const client = sessionClients[clientIndex];
    client.bid = clientBid;
    client.status =
      clientBid > sessionBid
        ? "raise"
        : clientBid === sessionBid
        ? "accept"
        : "pending";

    sessionClients.splice(clientIndex, 1, client);

    const updateFields = {
      [SESSION_NAMINGS.clients]: sessionClients,
      [SESSION_NAMINGS.bidValue]: clientBid,
    };

    if (autoActivation) {
      const allAccepted = sessionClients.every(
        (_user) => Number(_user[SESSION_NAMINGS.bidValue]) === sessionBid
      );

      updateFields[SESSION_NAMINGS.status] = allAccepted
        ? "active"
        : session[SESSION_NAMINGS.status];
    }

    const _updated = sessionsDB.patch({ id: sessionId }, updateFields);
    const extended = extendSession(_updated);

    triggerSessionUpdate(sessionId, extended);

    res.status(200).json(extended);
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

    triggerSessionUpdate(sessionId, extendSession(_updated));

    res.status(200).json({ ok: true });
  });

  app.put("/api/sessions/:sessionId/status", (req, res) => {
    const sessionId = req.params.sessionId;
    const { status, userId, users } = req.body;

    const session = sessionsDB.find({ id: sessionId });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    }

    let updates = { status };

    let _updated = session;

    switch (status) {
      case "resolved": {
        _updated = resolveSession({ id: sessionId }, users);
        break;
      }
      case "active": {
        const sessionBid = Number(session[SESSION_NAMINGS.bidValue]) || 0;
        const clients = getSessionClients(session);

        updates.summary = sessionBid * clients.length;

        clients.forEach(({ id }) => {
          const client = clientsDB.find({ id });

          if (client != null) {
            clientsDB.patch({ id }, { balance: client.balance - sessionBid });
          }
        });

        _updated = sessionsDB.patch({ id: sessionId }, updates);
        break;
      }
      default: {
        _updated = sessionsDB.patch({ id: sessionId }, updates);
        break;
      }
    }

    triggerSessionUpdate(sessionId, extendSession(_updated));

    res.status(200).json({ ok: true });
  });

  // Long Pulling

  app.get("/api/sessions/:sessionId/listen", (req, res) => {
    const sessionId = req.params.sessionId;
    const { userId } = req.query || {};

    // req.setTimeout(5000);

    emitter.once(EVENT_TYPES.STATE, ({ id, state }) => {
      if (sessionId == id) {
        res.json(getUserSessionState(state, userId));
      }
    });
  });
};

module.exports = {
  useSessionApi: init,
};
