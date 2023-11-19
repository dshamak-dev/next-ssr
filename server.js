const express = require("express");
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");

const useUsersApi = require('./server/users.api');
const useSessionApi = require('./server/session.api');

const clientPort = 3000;

const PORT = process.env.PORT || clientPort + 1;
const app = express();

app.use(compression());

app.use(cors({ origin: [`http://localhost:${clientPort}`] }));

app.use(bodyParser.json({ limit: "10mb" }));

app.get("/health", (req, res) => {
  res.status(200).send(true);
});

useUsersApi(app);
useSessionApi(app);

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
