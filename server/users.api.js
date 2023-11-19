const { getDB, writeDB } = require("./db.utils.js");

const dbName = "clients";

let _cache = getDB(dbName) || {
  users: {},
  business: {},
};

const updateUser = (id, data) => {
  if (_cache.users == null) {
    _cache.users = {};
  }

  const user = _cache.users[id] || {};

  _cache.users[id] = Object.assign(user, data);

  writeDB(dbName, _cache);
}

const init = (app) => {
  app.post("/api/login", async (req, res) => {
    try {
      let body = req.body;

      const { email, password, type } = body;

      const recordKey = type === 0 ? "users" : "business";
      const storage = _cache[recordKey];

      const _rec = Object.values(storage).find((it) => it.email === email);

      const invalidData = _rec != null && _rec.password != password;

      if (!email || !password || invalidData) {
        return res.status(400).end("Invalid email or password");
      }

      let json = _rec;

      if (_rec == null) {
        const id = Date.now();

        json = storage[id] = {
          id,
          type,
          email,
          password,
          balance: 0,
        };
      }

      writeDB(dbName, _cache);

      res.status(200).json(json);
    } catch (err) {
      res.status(400).end(err.message);
    }
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      let id = req.params.id;

      const _rec = _cache.users[id];

      if (_rec == null) {
        return res.status(404).redirect("/login");
      }

      let json = _rec;

      res.status(200).json(json);
    } catch (err) {
      res.status(400).end(err.message);
    }
  });
};

module.exports = {
  updateUser,
  findUserById: (id) => { 
    if (!_cache?.users) {
      return null;
    }

    return _cache.users[id];
   },
  useUserApi: init
};
