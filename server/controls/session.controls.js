const { clientsDB, sessionsDB } = require("../scripts/tables");
const { reduceRecord, uid } = require("../scripts/support.js");
const { getUsersPublicInfo, requestClientTransaction } = require("./user.controls.js");

const SESSION_NAMINGS = {
  clients: "users",
  bidValue: "bid",
  results: "results",
  status: "status",
};

const SESSION_STATUS_TYPES = {
  // not started
  draft: "pending",
  // all bids accepted or declined
  active: "active",
  closed: "closed",
  // resolved
  resolved: "resolved",
  closed: "resolved",
};

const USER_STATUS_TYPES = {
  // not connected or no bid posted
  draft: "draft",
  // there is a bid request from opponent
  request: "request",
  // you have a bid posted
  pending: "pending",
  // all bids accepted or declined
  locked: "locked",
};

class Session {
  constructor(data) {
    Object.assign(this, data);
  }

  getParticipant(id) {
    const _arr = this[SESSION_NAMINGS.clients];

    if (!Array.isArray(_arr)) {
      return null;
    }

    return _arr.find((it) => it.id === id);
  }

  hasParticipant(participantId) {
    return this.getParticipant(participantId) != null;
  }

  addParticipant(participant) {
    if (this.hasParticipant(participant?.id)) {
      return false;
    }

    if (this[SESSION_NAMINGS.clients] == null) {
      this[SESSION_NAMINGS.clients] = [];
    }

    this[SESSION_NAMINGS.clients].push(participant);
  }

  json() {
    return Object.assign({}, this);
  }
}

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

  if (!session || session.status === SESSION_STATUS_TYPES.resolved) {
    return session;
  }

  let updates = {};

  let summary = Number(session.summary) || 0;

  if (!summary) {
    summary = session[SESSION_NAMINGS.clients].reduce((_sum, it) => {
      const _bid = it[SESSION_NAMINGS.bidValue] || 0;

      return _sum + _bid;
    }, 0);
  }

  updates.summary = summary;

  const winners = participants
    .map((p) => {
      const user = session[SESSION_NAMINGS.clients].find(
        (it) => it.playerId === p.playerId
      );

      return {
        ...p,
        id: user?.id,
      };
    })
    .filter(({ id, state }) => id != null && state);
  const amount = summary / winners.length;

  updates[SESSION_NAMINGS.status] = SESSION_STATUS_TYPES.resolved;
  updates[SESSION_NAMINGS.results] = {
    [SESSION_NAMINGS.clients]: participants,
    amount,
  };

  winners.forEach(({ state, id, ...props }) => {
    const client = clientsDB.find({ id });

    if (client != null) {
      clientsDB.patch({ id: client.id }, { balance: client.balance + amount });
    }
  });

  return sessionsDB.patch({ id: session.id }, updates);
};

const addSessionParticipant = (sessionId, participant) => {
  const sessionData = findSession({ id: sessionId });

  if (!sessionData) {
    return sessionData;
  }

  const session = new Session(sessionData);

  if (session.hasParticipant(participant?.id)) {
    return sessionData;
  }

  session.addParticipant(participant);

  return sessionsDB.patch({ id: session.id }, session.json());
};

const getUserSessionState = (sessionData, participantId) => {
  const session = new Session(sessionData);

  const participantRecord = session.getParticipant(participantId);
  const inSession = participantRecord != null;

  if (!inSession) {
    return Object.assign({}, sessionData, {
      userState: {
        status: USER_STATUS_TYPES.draft,
      },
    });
  }

  let userStatus = USER_STATUS_TYPES.draft;

  const bid = participantRecord[SESSION_NAMINGS.bidValue];

  const hasBid = bid != null;
  const sessionBid = session[SESSION_NAMINGS.bidValue];
  const hasBidRequest = sessionBid != null && sessionBid != bid;

  switch (session.status) {
    case SESSION_STATUS_TYPES.draft: {
      if (hasBidRequest) {
        userStatus = USER_STATUS_TYPES.request;
      } else if (hasBid) {
        userStatus = USER_STATUS_TYPES.pending;
      }

      break;
    }
    case SESSION_STATUS_TYPES.closed: {
      break;
    }
    default: {
      userStatus = USER_STATUS_TYPES.locked;
    }
  }

  const userState =
    participantId == null
      ? null
      : {
          id: participantId,
          status: userStatus,
          bid,
        };

  return Object.assign({}, sessionData, { userState });
};

const lockSessionBids = (sessionId) => {
  const updates = {};

  const session = findSession({ id: sessionId });

  if (!session) {
    return session;
  }

  if (![SESSION_STATUS_TYPES.draft].includes(session[SESSION_NAMINGS.status])) {
    return session;
  }

  updates[SESSION_NAMINGS.status] = SESSION_STATUS_TYPES.active;

  const clients = getSessionClients(session);

  clients.forEach(({ id, bid }) => {
    requestClientTransaction(id, {
      sessionId: session.id,
      value: Number(bid) * -1
    })
  });

  return sessionsDB.patch({ id: sessionId }, updates);
};

module.exports = {
  SESSION_NAMINGS,
  USER_STATUS_TYPES,
  SESSION_STATUS_TYPES,

  addSessionParticipant,
  getUserSessionState,
  lockSessionBids,

  getSessionClients,
  extendSession,
  findSession,
  createSession,
  getSessionPublicInfo,
  resolveSession,
};
