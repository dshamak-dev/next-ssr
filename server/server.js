const express = require("express");
const compression = require("compression");
const cors = require("cors");

const userRouter = require("./modules/user/user.router.js");
const sessionRouter = require("./modules/session/session.router.js");
const voucherRouter = require("./modules/voucher/voucher.router.js");
const { Database } = require("./database/database.controller.js");

require("dotenv").config({ path: "../.env" });

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

app.use("/api", userRouter);
app.use("/api", sessionRouter);
app.use("/api", voucherRouter);

app.get("/secret/api/tables/:table/clear", async (req, res) => {
  const { table } = req.params;
  const { secret } = req.query;
  const _d = new Date();
  const answer = _d.toLocaleDateString("us");

  if (secret !== answer) {
    return res.status(403).end(`failed`);
  }

  const _t = new Database(table);

  if (!_t.exist()) {
    return res.status(403).end(`failed`);
  }

  _t.clear();

  res.status(200).end("ok");
});
app.get("/secret/api/tables/:table", async (req, res) => {
  const { table } = req.params;

  if (!table) {
    return res.status(403).end(`failed`);
  }

  const _t = new Database(table);

  if (!_t.exist()) {
    return res.status(403).end(`failed`);
  }

  res.status(200).end(`${JSON.stringify(_t.table)}`);
});

app.get("*", async (req, res) => {
  res.status(200).end("hi!");
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
