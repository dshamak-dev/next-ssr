const uuid = require("uuid");

const uidV4 = () => {
  return uuid.v4();
};

const uid = () => {
  const v4 = uidV4();
  const parts = v4.split("-");
  const id = parts[0];

  return id;
};

const reduceRecord = (record, keys) => {
  if (record == null) {
    return record;
  }

  return keys.reduce((_all, key) => {
    return Object.assign(_all, {
      [key]: record[key],
    });
  }, {});
};

const normalizeMongoRecord = (record) => {
  const res = Object.assign({}, record);

  if (res._doc) {
    return res._doc;
  }

  return res;
};

const joinMongoRecords = (...arguments) => {
  const res = Object.assign(
    {},
    ...arguments.map((it) => normalizeMongoRecord(it))
  );

  return res;
};

module.exports = {
  uid,
  uidV4,
  reduceRecord,
  joinMongoRecords,
  normalizeMongoRecord,
};
