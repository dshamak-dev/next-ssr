const express = require("express");
const compression = require("compression");
const cors = require("cors");

// const tables = require('./scripts/tables');

// const { useUserApi } = require("./api/users.api");
// const { useSessionApi } = require("./api/session.api");
// const { useConnectionApi } = require("./api/connect.api.js");
// const { useGameApi } = require("./api/game.api.js");

const profileRouter = require("./modules/profile/profile.router.js");

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

app.use('/api', profileRouter);

// app.get("/health", (req, res) => {
//   res.status(200).send(true);
// });

// useUserApi(app);
// useSessionApi(app);
// useConnectionApi(app);
// useGameApi(app);

// app.get("/contest/client", (req, res) => {
//   const filePath =  path.join(__dirname, './client.script.js');
//   const file = fs.readFileSync(filePath).toString();

//   const { company } = req.query;

//   let updated = file.replace('__API_DOMAIN__', API_DOMAIN);
//   updated = updated.replace('__COMPANY_ID__', company);

//   res.send(updated);
// });

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
