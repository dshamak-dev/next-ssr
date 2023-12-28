const { Database } = require("../../database/database.controller.js");
const { Voucher } = require("./voucher.model.js");

const _db = new Database("vouchers");

const get = async () => {
  return _db.table;
};

const find = async (query) => {
  return _db.find(query);
};

const update = async (entries, payload) => _db.patch(entries, payload);

const post = async (payload) => {
  const voucher = new Voucher(payload);

  await _db.add(voucher);

  return voucher;
};

module.exports = {
  get,
  find,
  post,
  update,
};
