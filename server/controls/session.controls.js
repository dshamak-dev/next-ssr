const { clientsDB, sessionsDB } = require("../scripts/tables");
const { reduceRecord, uid } = require("../scripts/support.js");

const SESSION_NAMINGS = {
  clients: "users",
  bidValue: "bid",
  results: "results",
};

const getSessionClients = (session) => {
  if (!session) {
    return [];
  }

  return session[SESSION_NAMINGS.clients] || [];
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

module.exports = {
  SESSION_NAMINGS,
  getSessionClients,
  extendSession,
  getUsersPublicInfo,
  findSession,
  createSession,
};