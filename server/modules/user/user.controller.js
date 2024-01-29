const { uid, joinMongoRecords } = require("../../scripts/support.js");

const _db = require("./user.schema.js");

const get = async ({ authId, id }) => {
  let user = null;

  if (id != null) {
    user = await _db.findOne({ id });
  } else if (authId != null) {
    user = await _db.findOne({ authId });
  }

  if (!user) {
    return null;
  }

  return user;
};

const post = async (user) => {
  let record = await get(user);

  if (record != null) {
    return record;
  }

  record = joinMongoRecords(user, { id: uid() });

  const res = await _db.create(record);

  return res;
};

const update = async (id, data) => {
  const record = await _db.findOneAndUpdate({ id }, { $set: data }, { new: true });

  return record;
};

const updateUserTransactions = async (id, { assets, transactions }) => {
  try {
    const record = await _db.findOneAndUpdate(
      { id },
      { $set: { assets, transactions } },
      { new: true }
    );

    return record;
  } catch (err) {
    console.log(err);

    return null;
  }
};

const postHistory = async (id, sessionId) => {
  let record = await get({ id });

  if (record == null) {
    return null;
  }

  const nextHistory = record.history || [];

  if (!nextHistory.includes(sessionId)) {
    nextHistory.push({
      sourceId: sessionId,
      updatedAt: Date.now(),
      sourceType: "session",
    });
  }

  return await update(id, { history: nextHistory });
};

const remove = async () => {};

module.exports = {
  get,
  post,
  update,
  remove,
  postHistory,
  updateUserTransactions,
};
