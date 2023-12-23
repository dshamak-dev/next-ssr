const { uid } = require("../../scripts/support.js");
const { postHistory } = require("../user/user.controller.js");
const {
  reducer: userReducer,
  UserActionTypes,
} = require("../user/user.reducer.js");
const { get, update } = require("./session.controller.js");
const { emit } = require("./session.event.js");
const { SessionStageType } = require("./session.model.js");
const {
  getSessionSummary,
  getSessionPrizePerUser,
} = require("./session.support.js");

const SessionActions = {
  createSession: "create",
  connect: "connect",
  disconnect: "disconnect",
  setBid: "setBid",
  removeBid: "removeBid",
  lockSession: "lock",
  resolveSession: "resolve",
};

const sessionActions = {
  [SessionActions.createSession]: async (_, userId, payload) => {
    const error = null;
    const data = null;

    return [error, data];
  },
  [SessionActions.connect]: async (session, userId) => {
    const error = null;
    const data = session;

    if (!data.users) {
      data.users = {};
    }

    data.users[userId] = { optionId: null, value: null };

    await postHistory(userId, session.id);

    return [error, data];
  },
  [SessionActions.disconnect]: async (session, userId) => {
    const error = null;
    const data = session;

    if (!data.users) {
      data.users = {};
    }

    delete data.users[userId];

    return [error, data];
  },
  [SessionActions.setBid]: async (session, userId, payload) => {
    const { optionId, value } = payload;
    const error = null;
    const data = session;

    if (!data.users) {
      data.users = {};
    }

    data.users[userId] = { optionId, value };

    return [error, data];
  },
  [SessionActions.removeBid]: async (session, userId) => {
    const error = null;
    const data = session;

    if (!data.users) {
      data.users = {};
    }

    data.users[userId] = { optionId: null, value: null };

    return [error, data];
  },
  [SessionActions.lockSession]: async (session, userId) => {
    let error = null;
    let data = session;

    if (!data.users) {
      data.users = {};
    }

    const validUsers = Object.entries(data.users).reduce(
      (prev, [id, state]) => {
        const { optionId, value } = state;

        if (optionId == null || !value) {
          return prev;
        }

        return Object.assign(prev, {
          [id]: state,
        });
      },
      {}
    );

    const readyNum = Object.keys(validUsers).length;

    if (readyNum < 2) {
      return ["no enought users to start", session];
    }

    // block bids for each user
    const processedUsers = await Promise.all(
      Object.entries(validUsers).map(([id, state]) => {
        const { optionId, value } = state;

        return userReducer(
          id,
          UserActionTypes.BlockAssets,
          {
            value,
            source: session.name,
            sourceId: session.id,
          },
          true
        ).then(([error, user]) => {
          if (error) {
            return [error, null];
          }

          return [null, [id, state]];
        });
      })
    );

    data.stage = SessionStageType.Active;
    data.users = validUsers;

    data.summary = getSessionSummary(data);

    return [error, data];
  },
  [SessionActions.resolveSession]: async (session, userId, payload) => {
    const error = null;
    const data = session;

    if (!data || data.ownerId !== userId) {
      return ["you have no permissions for action", data];
    }

    const { users } = data;

    // todo: support multiple values
    data.values = payload.options;

    // resolve blocked assets for each user
    await Promise.all(
      Object.entries(users).map(([id]) => {
        return userReducer(
          id,
          UserActionTypes.ResolveBlockedAssets,
          {
            sourceId: session.id,
          },
          true
        );
      })
    );

    const usersPrize = getSessionPrizePerUser(data);

    await Promise.all(
      Object.entries(usersPrize).map(async ([id, it]) => {
        const { rate, value } = it;

        const transition = {
          id: uid(),
          value,
          source: data.name,
          sourceId: data.id,
          sourceType: "session",
        };

        return userReducer(
          id,
          UserActionTypes.ApplyTransaction,
          transition,
          true
        ).then((res) => {
          Object.assign(data.users[id], {
            prize: value,
            rate
          });

          return res;
        });
      })
    );

    data.stage = SessionStageType.Close;

    return [error, data];
  },
};

module.exports = {
  sessionActions,
  reducer: async (actionName, sessionId, userId, payload) => {
    const handler = sessionActions[actionName];

    if (!handler) {
      return ["invalid action", null];
    }

    const session = await get({ id: sessionId });
    const [error, nextState] = await handler(session, userId, payload);

    if (!error && nextState) {
      await update(nextState.id, nextState);
    }

    emit(sessionId, nextState, [userId]);

    return [error, nextState];
  },
};
