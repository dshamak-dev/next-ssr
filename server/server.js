const express = require("express");
const compression = require("compression");
const cors = require("cors");
const os = require("os");
const path = require("path");
const fs = require('fs');

const tables = require('./scripts/tables');

const { useUserApi } = require("./api/users.api");
const { useSessionApi } = require("./api/session.api");
const { useConnectionApi } = require("./api/connect.api.js");

require('dotenv').config({ path: '../.env' });

const API_DOMAIN = process.env.API_DOMAIN;
const clientPort = 3000;

const PORT = process.env.PORT || clientPort + 1;
const app = express();

app.use(compression());

app.use(
  cors({
    origin: [
      `http://localhost:${clientPort}`,
      "https://next-ssr-b7mz.vercel.app",
      "https://next-ssr-b7mz-80r2nlhze-dshamak-devs-projects.vercel.app",
    ],
  })
);

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).send(true);
});

useUserApi(app);
useSessionApi(app);
useConnectionApi(app);

app.get("/bidon.js", (req, res) => {
  const filePath =  path.join(__dirname, './bidon.js');
  const file = fs.readFileSync(filePath).toString();

  const { company, player } = req.query;

  let updated = file.replace('__API_DOMAIN__', API_DOMAIN);
  updated = updated.replace('__COMPANY_ID__', company);
  updated = updated.replace('__PLAYER_ID__', player);

  res.send(updated);
});

app.listen(PORT, () => {
  const host = os.hostname();
  const dir = os.homedir();
  const platform = os.platform();

  console.log({ host, dir, platform }, `Server listening on port: ${PORT}`);
});
