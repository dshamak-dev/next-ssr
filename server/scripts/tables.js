const Database = require("./database");

const clientsDB = new Database("clients");
const sessionsDB = new Database("sessions");
const gamesDB = new Database("games");

module.exports = {
  clientsDB,
  sessionsDB,
  gamesDB
};
