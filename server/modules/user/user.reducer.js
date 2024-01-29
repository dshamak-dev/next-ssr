const { uid, joinMongoRecords } = require("../../scripts/support.js");
const { Transaction } = require("../transaction/transaction.model.js");
const { get, update, updateUserTransactions } = require("./user.controller.js");

const UserActionTypes = {
  BlockAssets: 1,
  ApplyTransaction: 2,
  AddHistoryRecord: 3,
  ResolveBlockedAssets: 4,
  ApplyVoucher: 5,
};

const blockUserAssets = async (user, payload) => {
  let assets = Number(user?.assets) || 0;
  const value = Number(payload.value) || 0;

  if (!value || assets < value) {
    return ["Not enough assets", user];
  }

  const blockedAssets = user.blockedAssets || [];

  assets -= value;

  blockedAssets.push(
    Object.assign(
      {
        sourceType: "blocked",
        createdAt: Date.now(),
      },
      payload
    )
  );

  return [
    null,
    joinMongoRecords({}, user, {
      assets,
      blockedAssets,
    }),
  ];
};

const applyUserTransaction = async (user, payload) => {
  const transactions = user.transactions || [];
  let assets = Number(user.assets) || 0;

  const transaction = new Transaction(payload);
  const value = Number(payload.value) || 0;

  if (transaction.type === "remove" && assets < value) {
    return ["Not enough assets", user];
  }

  assets = transaction.applyTo(assets);

  transactions.push(transaction);

  return [null, joinMongoRecords({}, user, { assets, transactions })];
};

const applyUserVoucher = async (user, voucher) => {
  if (!voucher || !voucher.id) {
    return ["invalid voucher", user];
  }

  const transactions = user.transactions || [];

  if (transactions.find((it) => it.sourceId === voucher.id)) {
    return ["voucher was already used", user];
  }

  const transaction = {
    title: voucher.tag,
    sourceId: voucher.id,
    sourceType: "voucher",
    type: "add",
    value: voucher.value,
  };

  return applyUserTransaction(user, transaction);
};

const userActions = {
  [UserActionTypes.BlockAssets]: blockUserAssets,
  [UserActionTypes.ApplyTransaction]: applyUserTransaction,
  [UserActionTypes.ApplyVoucher]: applyUserVoucher,
  [UserActionTypes.ResolveBlockedAssets]: async (user, payload) => {
    const { sourceId, revert = false } = payload;

    const blockedAssets = user.blockedAssets || [];
    const blockedRecordIndex = blockedAssets.findIndex(
      (it) => it.sourceId == sourceId
    );

    if (blockedRecordIndex === -1) {
      return ["data not found", user];
    }

    let error = null;
    let nextUser = user;

    const { id, ...blockedRecord } = blockedAssets.splice(
      blockedRecordIndex,
      1
    )[0];

    if (revert) {
      const transaction = {
        ...blockedRecord,
        type: "add",
        sourceType: "refund",
        value: Number(blockedRecord.value),
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

const reducer = async (userId, actionType, payload, saveChanges = true) => {
  const user = await get({ id: userId });

  if (!user) {
    return ["user not found", null];
  }

  const handler = userActions[actionType];

  try {
    switch (actionType) {
      case UserActionTypes.ApplyVoucher:
      case UserActionTypes.ApplyTransaction: {
        const [actionError, actionResult] = await handler(user, payload);
        const error = actionError;

        if (error || !actionResult) {
          return [error, actionResult];
        }

        const { assets, transactions } = actionResult;

        const updatedUser = await updateUserTransactions(user.id, {
          assets,
          transactions,
        });

        return [error, updatedUser];
      }
    }
  } catch (err) {
    return [err, null];
  }

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
      updatedUser = await update(
        user.id,
        joinMongoRecords({}, user, actionResult)
      );
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
