const { reduceRecord } = require("../scripts/support.js");
const { clientsDB } = require("../scripts/tables.js");

const getUserPublic = (id) => {
  const user = clientsDB.find({ id });

  if (!user) {
    return null;
  }

  return reduceRecord(user, ["id", "email", "name", "balance"]);
};

const getUsersPublicInfo = (users) => {
  if (!Array.isArray(users)) {
    return users;
  }

  return users
    .map(({ id, password, ...other }) => {
      const info = getUserPublic(id);

      return Object.assign({}, info, other);
    })
    .filter((it) => it != null);
};

const applyTransaction = (clientId, transaction) => {
  let client = clientsDB.find({ id: clientId });

  if (!client) {
    return null;
  }

  const patch = {};

  let transactions = client.transactions || [];

  const hasSameTransaction =
    transactions.find(({ sessionId, value }) => {
      const transactionQuery = {
        sessionId: transaction.sessionId,
        value: transaction.value,
      };

      return (
        JSON.stringify({ sessionId, value }) ===
        JSON.stringify(transactionQuery)
      );
    }) != null;

  if (!hasSameTransaction) {
    const balance = client.balance || 0;
    transactions.push({
      id: Date.now(),
      ...transaction,
    });

    patch.balance = balance + transaction.value;

    patch.transactions = transactions;
  }

  return clientsDB.patch({ id: client.id }, patch);
};

const requestClientTransaction = (clientId, { sessionId, value }) => {
  const transactionInfo = { sessionId, value };

  return applyTransaction(clientId, transactionInfo);
};

module.exports = {
  getUsersPublicInfo,
  getUserPublic,
  requestClientTransaction,
};
