const { Database } = require("../../database/database.controller.js");
const { uid } = require("../../scripts/support.js");

const _db = new Database("users");

const get = async ({ authId, id }) => {
  if (id != null) {
    return _db.find({ id });
  } else if (authId != null) {
    return _db.find({ authId });
  }

  return null;
};

const post = async (user) => {
  let record = await get(user);

  if (record != null) {
    return record;
  }

  record = Object.assign(user, { id: uid() });

  _db.add(record);

  return record;
};

const update = async (id, data) => {
  const record = _db.patch({ id }, data);

  return record;
};

const remove = async () => {};

module.exports = {
  get,
  post,
  update,
  remove,
};