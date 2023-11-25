const {
  findSession,
  createSession,
  resolveSession,
} = require("../controls/session.controls.js");

module.exports = {
  useConnectionApi: (app) => {
    app.get("/api/connections/:companyId/:connectionId", (req, res) => {
      const { companyId, connectionId } = req.params;
      const ownerId = companyId;

      let session = findSession({ ownerId, connectionId });

      if (session == null) {
        return res.status(404).json({ error: "No session found" });
      }

      res.status(200).json({ sessionId: session.id });
    });
    app.post("/api/connections/:companyId/:connectionId", (req, res) => {
      const { companyId, connectionId } = req.params;
      const ownerId = companyId;

      let session = findSession({ ownerId, connectionId });

      if (session == null) {
        session = createSession(ownerId, { connectionId });
      }

      res.status(200).json({ sessionId: session?.id });
    });

    app.post("/api/connections/:connectionId/resolve", (req, res) => {
      const { connectionId } = req.params;
      const { companyId, players } = req.body || {};
      const ownerId = companyId;

      const participants = Object.entries(players).map(([playerId, state]) => {
        return { playerId, state };
      });

      const session = resolveSession({ ownerId, connectionId }, participants);

      if (session == null) {
        return res.status(404).json({ error: "No connection found" });
      }

      res.status(200).json({ session });
    });
  },
};
