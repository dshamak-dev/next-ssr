export enum SessionStageType {
  Draft = 0,
  Lobby,
  Pending,
  Active,
  Close,
}

export enum SessionUserStageType {
  // not taking part
  Draft = 0,
  // has no access
  Close = 1,
  // logged && no bid
  Guest = 2,
  // logged && has bid
  Pending = 3,
  // logged && locked bid
  Active = 4,
  // logged && lost
  Success = 5,
  // logged && won
  Failure = 6,
  Spectator = 7,
}

export interface SessionOption {
  text: string;
  id: number | string;
}

export interface SessionUserState {
  ready: boolean;
  // your selection
  optionId?: SessionOption["id"];
  value?: number;
}

export interface SessionState {
  id: string;
  name: string;
  description?: string;
  users: SessionUserState[];
  options: SessionOption[];
  stage: SessionStageType;
  userStage: SessionUserStageType;
}

export enum DTOSessionAction {
  CreateSession = "create",
  Connect = "connect",
  Disconnect = "disconnect",
  SetBid = "setBid",
  RemoveBid = "removeBid",
  LockSession = "lock",
  ResolveSession = "resolve",
}
