const { Database } = require("../../database/database.controller.js");
const { uid } = require("../../scripts/support.js");
const {
  SessionStageType,
  SessionUserStageType,
} = require("./session.model.js");

const _db = new Database("session");

const get = async ({ id }) => {
  if (id != null) {
    return _db.find({ id });
  }

  return null;
};

const find = async (query) => {
  if (query != null) {
    return _db.find(query);
  }

  return null;
};

const post = async (data) => {
  let record = await get(data);

  if (record != null) {
    return record;
  }

  record = Object.assign(data, { id: uid() });

  _db.add(record);

  return record;
};

const update = async (id, data) => {
  const record = _db.patch({ id }, data);

  return record;
};

const remove = async () => {};

const getSessionUserState = async (session, userId) => {
  if (!session) {
    return ["no session found", null];
  }

  const {
    id,
    ownerId,
    stage,
    description,
    users = {},
    options,
    values,
    summary,
  } = session;

  const userJoined = users ? users[userId] != null : false;
  let userOption = null;
  let userHasBid = false;

  const usersState =
    Object.entries(users)?.map(([id, it]) => {
      const { optionId, value } = it;
      const state = { ready: optionId != null };

      if (userId === id) {
        userOption = { optionId, value };

        state.id = id;
        Object.assign(state, it);

        userHasBid = state.ready;
      }

      return state;
    }) || [];

  let error = null;
  let userStage = SessionUserStageType.Draft;
  const isInSession = users[userId] != null;

  switch (stage) {
    case SessionStageType.Active: {
      if (isInSession) {
        userStage = SessionUserStageType.Active;
      } else {
        userStage = SessionUserStageType.Close;
      }

      break;
    }
    case SessionStageType.Close: {
      if (isInSession && userOption) {
        const hasMatch = values?.includes(userOption.optionId);

        userStage = hasMatch
          ? SessionUserStageType.Success
          : SessionUserStageType.Failure;
      } else {
        userStage = SessionUserStageType.Close;
      }
      break;
    }
    case SessionStageType.Draft:
    case SessionStageType.Lobby:
    default: {
      if (userJoined) {
        userStage = userHasBid
          ? SessionUserStageType.Pending
          : SessionUserStageType.Guest;
      }

      break;
    }
  }

  const state = {
    id,
    admin: ownerId === userId,
    description,
    options,
    users: usersState,
    stage,
    userStage,
    summary,
  };

  return [error, state];
};

module.exports = {
  get,
  post,
  update,
  remove,
  find,
  getSessionUserState,
};
