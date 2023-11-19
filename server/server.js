const express = require("express");
const compression = require("compression");
const cors = require("cors");
const os = require('os');

const useUsersApi = require('./users.api');
const useSessionApi = require('./session.api');

const clientPort = 3000;

const PORT = process.env.PORT || clientPort + 1;
const app = express();

app.use(compression());

app.use(cors({ origin: [`http://localhost:${clientPort}`] }));

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).send(true);
});

useUsersApi(app);
useSessionApi(app);

app.listen(PORT, () => {
  const host = os.hostname();
  const dir = os.homedir();
  const platform = os.platform();

  console.log({ host, dir, platform }, `Server listening on port: ${PORT}`)
});
