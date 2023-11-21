const { EventEmitter } = require("events");
const { clientsDB, sessionsDB } = require("./tables");
const { uid, reduceRecord } = require("./support.js");

const emitter = new EventEmitter();
const EVENT_TYPES = {
  CONNECT: "connect",
  ACTION: "action",
  STATE: "state",
};

const NAMINGS = {
  clients: "users",
  bidValue: "bid",
  results: "results",
};

const triggerSessionUpdate = (id, session) => {
  emitter.emit(EVENT_TYPES.STATE, { id, state: session });
};

const getSessionClients = (session) => {
  if (!session) {
    return [];
  }

  return session[NAMINGS.clients] || [];
};

const getUsersPublicInfo = (users) => {
  return users
    .map(({ id, ...other }) => {
      const user = clientsDB.find({ id });

      const fields = reduceRecord(user, ["id", "email", "name"]);

      return Object.assign({}, fields, other);
    })
    .filter((it) => it != null);
};

const extendSession = (session) => {
  if (!session || !getSessionClients(session).length) {
    return session;
  }

  const users = getUsersPublicInfo(getSessionClients(session));
  let results = session[NAMINGS.results];

  if (results != null) {
    results = Object.assign({}, results, {
      [NAMINGS.clients]: (results[NAMINGS.clients] || []).map(
        ({ id, state }) => {
          const other = users.find((it) => it.id === id);

          return { ...other, id, state };
        }
      ),
    });
  }

  const _extended = Object.assign({}, session, {
    users,
    [NAMINGS.results]: results,
  });

  return _extended;
};

const init = (app) => {
  app.get("/api/sessions/:sessionId", (req, res) => {
    const id = String(req.params.sessionId).toLocaleLowerCase();

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
      status: "pending",
    };

    sessionsDB.add(session);

    res.status(200).json(session);
  });

  app.post("/api/sessions/:sessionId/users", (req, res) => {
    const sessionId = req.params.sessionId;
    const { id: userId } = req.body;

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

    if (!sessionUsers.includes(userId)) {
      sessionUsers.push({ id: userId });

      const _updated = sessionsDB.patch(
        { id: sessionId },
        { users: sessionUsers }
      );

      triggerSessionUpdate(sessionId, extendSession(_updated));
    }

    res.status(200).end();
  });

  app.post("/api/sessions/:id/bids", (req, res) => {
    const sessionId = req.params.id;
    const { userId, value } = req.body;
    const clientBid = Number(value) || 0;

    const session = sessionsDB.find({ id: sessionId });
    const hasMatch = session != null;

    if (!hasMatch) {
      return res.status(404).json({ error: "No session found" });
    }

    const sessionClients = getSessionClients(session);
    const clientIndex = sessionClients.findIndex(({ id }) => id === userId);

    const hasClientMatch = clientIndex !== -1;

    if (!hasClientMatch) {
      return res.status(404).json({ error: "No such client" });
    }

    const sessionBid = Number(session[NAMINGS.bidValue]) || 0;

    const client = sessionClients[clientIndex];
    client.bid = clientBid;
    client.status =
      clientBid > sessionBid
        ? "raise"
        : clientBid === sessionBid
        ? "accept"
        : "pending";

    sessionClients.splice(clientIndex, 1, client);

    const _updated = sessionsDB.patch(
      { id: sessionId },
      {
        [NAMINGS.clients]: sessionClients,
        [NAMINGS.bidValue]: Math.max(sessionBid, clientBid),
      }
    );

    triggerSessionUpdate(sessionId, extendSession(_updated));

    res.status(200).json({ ok: true });
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

    switch (status) {
      case "resolved": {
        const summary = Number(session.summary) || 0;
        const winners = users.filter(({ state }) => state);
        const amount = summary / winners.length;

        updates[NAMINGS.results] = {
          [NAMINGS.clients]: users,
          amount,
        };

        winners.forEach(({ id }) => {
          const client = clientsDB.find({ id });

          if (client != null) {
            clientsDB.patch({ id }, { balance: client.balance + amount });
          }
        });
        break;
      }
      case "active": {
        const sessionBid = Number(session[NAMINGS.bidValue]) || 0;
        const clients = getSessionClients(session);

        updates.summary = sessionBid * clients.length;

        clients.forEach(({ id }) => {
          const client = clientsDB.find({ id });

          if (client != null) {
            clientsDB.patch({ id }, { balance: client.balance - sessionBid });
          }
        });
        break;
      }
    }

    const _updated = sessionsDB.patch({ id: sessionId }, updates);

    triggerSessionUpdate(sessionId, extendSession(_updated));

    res.status(200).json({ ok: true });
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
};

module.exports = {
  useSessionApi: init,
};
