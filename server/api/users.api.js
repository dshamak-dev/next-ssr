const { uid, reduceRecord } = require("../scripts/support.js");
const { clientsDB, sessionsDB } = require("../scripts/tables.js");

const getClientHistory = (client) => {
  return client?.history || [];
};

const getSessionPublicInfo = (id) => {
  const session = sessionsDB.find({ id });

  if (session == null) {
    return { id };
  }

  const fields = reduceRecord(session, ["id", "status", 'bid']);

  return Object.assign({}, fields);
};

const extendClient = (client) => {
  const history = getClientHistory(client);

  if (!client || !history.length) {
    return client;
  }

  const _history = history.map((id) => getSessionPublicInfo(id));

  const _extended = Object.assign({}, client, {
    history: _history,
  });

  return _extended;
};

const init = (app) => {
  app.post("/api/login", async (req, res) => {
    try {
      let body = req.body;

      const { email, password } = body;

      const client = clientsDB.find({ email });
      const hasMatch = client != null;

      if (!hasMatch || client?.password != password) {
        return res.status(400).json({ error: "Invalid email or password" });
      }

      res.status(200).json(client);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/signup", (req, res) => {
    let body = req.body;

    const { email, name, type, password } = body;

    const client = clientsDB.find({ email });
    const hasMatch = client != null;

    if (hasMatch) {
      return res.status(400).json({ error: "This email already used" });
    }

    const _client = {
      name,
      id: uid(),
      type,
      email,
      password,
      balance: 0,
    };

    clientsDB.add(_client);

    res.status(200).json(_client);
  });

  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = req.params.id;

      const client = clientsDB.find({ id });
      const hasMatch = client != null;

      if (!hasMatch) {
        return res.status(404).json({ error: "No match" });
      }

      const json = extendClient(client);

      res.status(200).json(json);
    } catch (err) {
      console.log({ err });
      
      res.status(400).json({ error: err.message });
    }
  });

  app.get("/api/users/:id/balance", async (req, res) => {
    try {
      const id = req.params.id;

      const client = clientsDB.find({ id });
      const hasMatch = client != null;

      if (!hasMatch) {
        return res.status(404).json({ error: "No match" });
      }

      res.status(200).json({ value: client?.balance || 0 });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post("/api/users/:id/transaction", async (req, res) => {
    try {
      let id = req.params.id;

      const { value, password } = req.body;

      const client = clientsDB.find({ id, password });
      const hasMatch = client != null;

      if (!hasMatch) {
        return res.status(403).json({ error: "Invalid data" });
      }

      const _value = Number(value) || 0;
      const _nextBalance = (client.balance || 0) + _value;

      clientsDB.patch({ id }, { balance: _nextBalance });

      res.status(200).end();
    } catch (err) {
      res.status(400).end({ error: err.message });
    }
  });
};

module.exports = {
  useUserApi: init,
};
