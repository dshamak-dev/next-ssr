const { clientsDB, sessionsDB } = require("../scripts/tables");
const { reduceRecord, uid } = require("../scripts/support.js");
const { getUsersPublicInfo } = require("./user.controls.js");

const SESSION_NAMINGS = {
  clients: "users",
  bidValue: "bid",
  results: "results",
  status: "status",
};

const getSessionClients = (session) => {
  if (!session) {
    return [];
  }

  return session[SESSION_NAMINGS.clients] || [];
};

const extendSession = (session) => {
  if (!session || !getSessionClients(session).length) {
    return session;
  }

  const users = getUsersPublicInfo(getSessionClients(session));
  let results = session[SESSION_NAMINGS.results];

  if (results != null) {
    results = Object.assign({}, results, {
      [SESSION_NAMINGS.clients]: (results[SESSION_NAMINGS.clients] || []).map(
        ({ id, state }) => {
          const other = users.find((it) => it.id === id);

          return { ...other, id, state };
        }
      ),
    });
  }

  const _extended = Object.assign({}, session, {
    users,
    [SESSION_NAMINGS.results]: results,
  });

  return _extended;
};

const findSession = (query) => {
  return sessionsDB.find(query);
};

const createSession = (ownerId, props = {}) => {
  const session = {
    ...props,
    ownerId,
    id: uid(),
    users: [],
    status: "pending",
  };

  sessionsDB.add(session);

  return session;
};

const getSessionPublicInfo = (id) => {
  const session = sessionsDB.find({ id });

  if (session == null) {
    return { id };
  }

  const fields = reduceRecord(session, ["id", "status", "bid"]);

  return Object.assign({}, fields);
};

const resolveSession = (sessionQuery, participants) => {
  const session = findSession(sessionQuery);

  if (!session || session.status === 'resolved') {
    return session;
  }

  const summary = Number(session.summary) || 0;
  const winners = participants.filter(({ state }) => state);
  const amount = summary / winners.length;

  const updates = {
    [SESSION_NAMINGS.status]: 'resolved',
    [SESSION_NAMINGS.results]: {
      [SESSION_NAMINGS.clients]: participants,
      amount,
    },
  };

  winners.forEach(({ state, ...props }) => {
    const client = clientsDB.find(props);

    if (client != null) {
      clientsDB.patch({ id: client.id }, { balance: client.balance + amount });
    }
  });

  return sessionsDB.patch({ id: session.id }, updates);
};

module.exports = {
  SESSION_NAMINGS,
  getSessionClients,
  extendSession,
  findSession,
  createSession,
  getSessionPublicInfo,
  resolveSession,
};
