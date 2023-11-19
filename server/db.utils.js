const fs = require("fs");
const path = require("path");
const folderPath = path.join(__dirname, "../private");

const getDBPath = (dbName) => {
  return path.join(folderPath, `${dbName}.json`);
};

const getDB = (dbName) => {
  const dbPath = getDBPath(dbName);

  if (!fs.existsSync(dbPath)) {
    return null;
  }

  const file = fs.readFileSync(dbPath);

  return JSON.parse(file);
};

const writeDB = (dbName, json) => {
  const dbPath = getDBPath(dbName);

  const data = Object.assign({}, json);

  fs.writeFileSync(dbPath, JSON.stringify(data), {
    encoding: "utf8",
    flag: "w",
  });

  return data;
};

module.exports = {
  getDB,
  writeDB,
};
