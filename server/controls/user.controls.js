const { reduceRecord } = require("../scripts/support.js");
const { clientsDB } = require("../scripts/tables.js");

const getUsersPublicInfo = (users) => {
  if (!Array.isArray(users)) {
    return users;
  }

  return users
    .map(({ id, password, ...other }) => {
      const user = clientsDB.find({ id });

      const fields = reduceRecord(user, ["id", "email", "name"]);

      return Object.assign({}, fields, other);
    })
    .filter((it) => it != null);
};

module.exports = {
  getUsersPublicInfo
};