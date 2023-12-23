const { uid } = require("../../scripts/support.js");
const { get, update } = require("./user.controller.js");

const UserActionTypes = {
  BlockAssets: 1,
  ApplyTransaction: 2,
  AddHistoryRecord: 3,
  ResolveBlockedAssets: 4,
};

const blockuserAssets = async (user, payload) => {
  const blockedAssets = user.blockedAssets || [];
  let assets = Number(user.assets) || 0;

  assets -= Number(payload.value);

  blockedAssets.push(
    Object.assign(
      {
        createdAt: Date.now(),
      },
      payload
    )
  );

  return [
    null,
    Object.assign({}, user, {
      assets,
      blockedAssets,
    }),
  ];
};

const applyUserTransaction = async (user, payload) => {
  const transactions = user.transactions || [];
  let assets = Number(user.assets) || 0;

  assets += Number(payload.value);

  transactions.push(
    Object.assign(
      {
        id: uid(),
        createdAt: Date.now(),
      },
      payload
    )
  );

  return [
    null,
    Object.assign({}, user, {
      assets,
      transactions,
    }),
  ];
};

const userActions = {
  [UserActionTypes.BlockAssets]: blockuserAssets,
  [UserActionTypes.ApplyTransaction]: applyUserTransaction,
  [UserActionTypes.ResolveBlockedAssets]: async (user, payload) => {
    const { sourceId, revert = false } = payload;

    const blockedAssets = user.blockedAssets || [];
    const blockedRecordIndex = blockedAssets.findIndex(
      (it) => it.sourceId === sourceId
    );

    if (blockedRecordIndex === -1) {
      return ["data not found", user];
    }

    let error = null;
    let nextUser = Object.assign({}, user);

    const { id, ...blockedRecord } = blockedAssets.splice(
      blockedRecordIndex,
      1
    )[0];

    if (!revert) {
      const transaction = {
        ...blockedRecord,
        value: Number(blockedRecord.value) * -1,
      };

      const [_err, _user] = await applyUserTransaction(nextUser, transaction);

      error = _err;
      nextUser = _err ? nextUser : _user;
    }

    nextUser.blockedAssets = blockedAssets;

    return [error, nextUser];
  },
  [UserActionTypes.AddHistoryRecord]: async (user, payload) => {
    // todo
    return [null, user];
  },
};

const reducer = async (userId, actionType, payload, saveChanges = false) => {
  const user = await get({ id: userId });

  if (!user) {
    return ["user not found", null];
  }

  const handler = userActions[actionType];

  if (!handler) {
    return ["permission denied", user];
  }

  let error = null;
  let updatedUser = user;

  try {
    const [actionError, actionResult] = await handler(user, payload);
    error = actionError;
    updatedUser = actionResult;

    if (!error && saveChanges) {
      updatedUser = await update(user.id, Object.assign({}, user, updatedUser));
    }
  } catch (err) {
    error = err.message;
  }

  return [error, updatedUser];
};

module.exports = {
  UserActionTypes,
  reducer,
};
