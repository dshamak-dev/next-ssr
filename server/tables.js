const Database = require("./database");

const clientsDB = new Database("clients");
const sessionsDB = new Database("sessions");

module.exports = {
  clientsDB,
  sessionsDB,
};
