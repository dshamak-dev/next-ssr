const {
  findGame,
  createGame,
  emitGameState,
  addGameEventListener,
  addGamePlayer,
  getGameState,
  setPlayerNumber,
  setGamePlayerReady,
} = require("../controls/games.controls.js");

module.exports = {
  useGameApi: (app) => {
    app.get("/api/games/:gameId/listen", (req, res) => {
      const { gameId } = req.params;
      const { playerId } = req.query || { playerId: null };

      addGameEventListener(gameId, playerId, (state) => {
        res.json(state);
      });
    });

    app.get("/api/games/:gameId", async (req, res) => {
      const { gameId } = req.params;
      const { playerId } = req.query || { playerId: null };

      let data = await findGame(gameId);

      if (data == null) {
        return res.status(404).json({ error: 'Game not found' });
      }

      const state = getGameState(data, playerId);
      
      res.json(state);
    });

    app.post("/api/games", async (req, res) => {
      try {
        const { id } = req.body || { id: null };

        let data = await findGame(id);

        if (data != null) {
          return res.json(data);
        }

        data = await createGame(id);

        emitGameState(data);

        res.json(data);
      } catch (err) {
        console.log(err);

        res.json({ error: err.message });
      }
    });

    app.post("/api/games/:gameId/players", async (req, res) => {
      const { gameId } = req.params;
      const { id } = req.body || { id: null };
      const playerId = id;

      if (playerId == null) {
        return res.status(400).json({ error: 'Invalid player ID' });
      }

      let data = await findGame(gameId);

      if (data == null) {
        return res.status(404).json({ error: 'Game not found' });
      }

      data = await addGamePlayer(gameId, playerId);

      emitGameState(data);

      res.json(data);
    });

    app.put("/api/games/:gameId/players/:playerId/ready", async (req, res) => {
      const { gameId, playerId } = req.params;
      const { ready } = req.body || { ready: false };

      if (playerId == null) {
        return res.status(400).json({ error: 'Invalid player ID' });
      }

      let data = await findGame(gameId);

      if (data == null) {
        return res.status(404).json({ error: 'Game not found' });
      }

      data = await setGamePlayerReady(gameId, playerId, ready);

      emitGameState(data);

      res.json(data);
    });

    app.post("/api/games/:gameId/:playerId", async (req, res) => {
      const { gameId, playerId } = req.params;
      const { value } = req.body || { value: null };

      if (playerId == null) {
        return res.status(400).json({ error: 'Invalid player ID' });
      }

      let data = await findGame(gameId);

      if (data == null) {
        return res.status(404).json({ error: 'Game not found' });
      }

      data = await setPlayerNumber(gameId, playerId, value);

      emitGameState(data);

      res.json(data);
    });
  },
};
