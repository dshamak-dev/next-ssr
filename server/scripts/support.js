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

module.exports = {
  uid,
  uidV4,
  reduceRecord,
};
