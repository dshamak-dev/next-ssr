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
};

const findUserById = (id, keys = []) => {
  if (!_cache?.users) {
    return null;
  }

  const user = _cache.users[id];

  if (keys != null && keys.length > 0) {
    return keys.reduce((_all, key) => {
      return Object.assign(_all, {
        [key]: user[key],
      });
    }, {});
  }

  return user;
};

const init = (app) => {
  app.post("/api/login", async (req, res) => {
    try {
      let body = req.body;

      const { email, password, type, ...other } = body;

      const recordKey = type === 0 ? "users" : "business";
      const storage = _cache[recordKey];

      const _rec = Object.values(storage).find((it) => it?.email === email);

      const invalidData = _rec != null && _rec.password != password;

      if (!email || !password || invalidData) {
        return res.status(400).end("Invalid email or password");
      }

      let json = _rec;

      if (_rec == null) {
        const id = Date.now();

        json = storage[id] = {
          ...other,
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

      let json = Object.assign({}, _rec);

      const history = json.history || [];
      const populatedHistoty = history.map((id) => ({ id, source: 'custom', status: 'pending' }));

      json.history = populatedHistoty;

      res.status(200).json(json);
    } catch (err) {
      res.status(400).end(err.message);
    }
  });

  app.post("/api/users/:id/transaction", async (req, res) => {
    try {
      let id = req.params.id;

      const { value, password } = req.body;
      const _rec = _cache.users[id];

      if (_rec == null) {
        return res.status(404).end();
      }

      if (_rec.password != password) {
        return res.status(403).end();
      }

      let json = _rec;

      const _value = Number(value) || 0;

      if (_value != 0) {
        json.balance += _value;

        updateUser(id, json);
      }

      res.status(200).end();
    } catch (err) {
      res.status(400).end(err.message);
    }
  });
};

module.exports = {
  updateUser,
  findUserById,
  useUserApi: init,
};
