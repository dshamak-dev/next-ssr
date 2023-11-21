const fs = require("fs");
const path = require("path");

const folderPath = path.join(__dirname, "../private");

class Database {
  name;
  path;

  table;

  constructor(name) {
    this.name = name;

    this.path = path.join(folderPath, `${name}.json`);

    this.table = [];

    this.read();
  }

  findIndex(entries) {
    return this.table.findIndex((rec) => {
      return Object.entries(entries).every(([key, value]) => {
        return rec[key] == value;
      });
    });
  }


  find(entries) {
    const index = this.findIndex(entries);

    if (index === -1) {
      return null;
    }

    return Object.assign({}, this.table[index]);
  }

  add(record) {
    this.table.push(record);

    this.write();
  }

  delete(entries) {
    const index = this.findIndex(entries);

    if (index === -1) {
      return;
    }

    this.table.splice(index, 1);

    this.write();
  }

  patch(entries, fields) {
    const index = this.findIndex(entries);

    if (index === -1) {
      return null;
    }

    const updated = Object.assign({}, this.table[index], fields);

    this.table.splice(index, 1, updated);

    this.write();

    return updated;
  }

  read() {
    if (!fs.existsSync(this.path)) {
      return null;
    }

    const file = fs.readFileSync(this.path);

    return (this.table = JSON.parse(file));
  }

  write() {
    fs.writeFileSync(this.path, JSON.stringify(this.table), {
      encoding: "utf8",
      flag: "w",
    });
  }
}

module.exports = Database;
