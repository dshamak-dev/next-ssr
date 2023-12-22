const SessionStageType = {
  Draft: 0,
  Lobby: 1,
  Pending: 2,
  Active: 3,
  Close: 4,
};
const SessionUserStageType = {
   // not taking part
   Draft: 0,
   // has no access
   Close: 1,
   // logged && no bid
   Guest: 2,
   // logged && has bid
   Pending: 3,
   // logged && locked bid
   Active: 4,
   // logged && lost
   Success: 5,
   // logged && won
   Failure: 6,
   // session started and can only spectate
   Spectator: 7,
};

module.exports = {
  SessionStageType,
  SessionUserStageType
};