const express = require("express");
const compression = require("compression");
const cors = require("cors");

require("dotenv").config();

const userRouter = require("./modules/user/user.router.js");
const sessionRouter = require("./modules/session/session.router.js");
const voucherRouter = require("./modules/voucher/voucher.router.js");

const { connect } = require("mongoose");

const dbUri = process.env.DB_URI;

let dbClient;

try {
  dbClient = connect(dbUri, { autoCreate: true });
  console.log("bd connected");
} catch (err) {
  dbClient = null;
  console.error(err);
}
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

app.get("*", async (req, res) => {
  let message = "";

  message = dbClient != null ? "connected" : "-_-";

  res.status(200).end(message);
});

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
