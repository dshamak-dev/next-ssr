const express = require("express");
const compression = require("compression");
const cors = require("cors");
const os = require("os");

const tables = require('./tables');

const { useUserApi } = require("./users.api");
const { useSessionApi } = require("./session.api");

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

app.listen(PORT, () => {
  const host = os.hostname();
  const dir = os.homedir();
  const platform = os.platform();

  console.log({ host, dir, platform }, `Server listening on port: ${PORT}`);
});
