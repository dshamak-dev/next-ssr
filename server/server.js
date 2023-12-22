const express = require("express");
const compression = require("compression");
const cors = require("cors");

const userRouter = require("./modules/user/user.router.js");
const sessionRouter = require("./modules/session/session.router.js");

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

app.use('/api', userRouter);
app.use('/api', sessionRouter);

app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});
