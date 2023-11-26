const { uid, reduceRecord } = require("../scripts/support.js");
const { EventEmitter } = require("events");
const { gamesDB } = require("../scripts/tables.js");
const Contest = require("../server.script.js");

const emitter = new EventEmitter();
const EVENT_TYPES = {
  STATE: "state",
};
const GAME_STATUS = {
  draft: "draft",
  loading: "loading",
  guest: "guest",
  pending: "pending",
  active: "active",
  closed: "closed",
};

class Game {
  id;
  players;
  status;

  state;

  createdAt;
  updatedAt;

  minValue;
  maxValue;

  constructor(props) {
    Object.assign(this, props);

    this.id = this.id || uid();
    this.players = this.players || [];
    this.status = this.status || GAME_STATUS.draft;
    this.state = this.state || {};

    this.createdAt = this.createdAt || Date.now();
    this.updatedAt = Date.now();

    this.validate();
  }

  hasPlayer(playerId) {
    if (!Array.isArray(this.players)) {
      return false;
    }

    return this.players.includes(playerId);
  }

  findPlayer(playerId) {
    if (!this.hasPlayer(playerId)) {
      return null;
    }

    if (this.state == null) {
      this.state = {};
    }

    if (this.state[playerId] == null) {
      this.state[playerId] = {
        number: null,
        ready: false,
      };
    }

    return this.state[playerId];
  }

  addNumber(playerId, value) {
    if (
      !this.hasPlayer(playerId) ||
      value == null ||
      value > this.maxValue ||
      value < this.minValue
    ) {
      return false;
    }

    const playerState = this.findPlayer(playerId);

    const _num = Number(value);

    if (Number.isNaN(_num)) {
      return false;
    }

    this.state[playerId] = {
      ...playerState,
      number: _num,
    };

    this.validate();

    return true;
  }

  join(playerId) {
    if (![GAME_STATUS.draft].includes(this.status)) {
      return false;
    }

    if (!Array.isArray(this.players)) {
      this.players = [];
    }

    if (this.players.includes(playerId)) {
      return false;
    }

    this.players.push(playerId);

    this.validate();

    return true;
  }

  setReadyState(playerId, readyState) {
    if (!this.hasPlayer(playerId)) {
      return false;
    }

    const playerState = this.findPlayer(playerId);

    this.state[playerId].ready = readyState;

    this.validate();
  }

  validate() {
    const playersNum = this.players?.length || 0;

    this.minValue = this.minValue || 0;
    this.maxValue = playersNum > 3 ? 100 : 10;

    const stateValues = Object.values(this.state || {});

    switch (this.status) {
      case GAME_STATUS.draft: {
        // Min 2 players required
        const allReady =
          stateValues.length > 1 && stateValues.every(({ ready }) => ready);

        if (allReady) {
          this.status = GAME_STATUS.active;
        }

        break;
      }
      case GAME_STATUS.active:
      case GAME_STATUS.pending: {
        const numbersCount = stateValues.filter(({ number }) => {
          const _num = number == null ? NaN : Number(number);

          return !Number.isNaN(_num);
        }).length;

        if (numbersCount === this.players.length) {
          this.resolve();
        }
        break;
      }
    }
  }

  resolve() {
    if (this.status === GAME_STATUS.closed && this.results != null) {
      return this.results;
    }

    this.status = GAME_STATUS.closed;

    const allNumbers = Object.values(this.state).map((it) => {
      const value = Number(it.number);

      return value;
    });
    const uniqueNumbers = allNumbers.filter((num) => {
      const numVariants = allNumbers.filter((it) => it === num);

      return numVariants.length === 1;
    });
    const greatestValue = uniqueNumbers.sort((a, b) => b - a).shift();

    const results = Object.entries(this.state).reduce(
      (res, [id, { number }]) => {
        return {
          ...res,
          [id]: number === greatestValue,
        };
      },
      {}
    );

    Contest.resolve("23ed84", this.id, { players: results });

    this.results = results;
  }

  getWinState(playerId) {
    if (!this.hasPlayer(playerId)) {
      return false;
    }

    if (![GAME_STATUS.closed].includes(this.status)) {
      return false;
    }

    return this.results[playerId];
  }

  json() {
    return { ...this };
  }
}

const createGame = (id) => {
  const game = new Game({ id });

  const gameData = game.json();

  gamesDB.add(gameData);

  return Promise.resolve(gameData);
};

const updateGame = (gameId, updates) => {
  const gameData = gamesDB.patch({ id: gameId }, updates);

  return Promise.resolve(gameData);
};

const findGame = async (gameId) => {
  return Promise.resolve(gamesDB.find({ id: gameId }));
};

const setPlayerNumber = async (gameId, playerId, value) => {
  let gameData = await findGame(gameId);

  if (gameData == null) {
    return Promise.resolve(null);
  }

  const game = new Game(gameData);
  game.addNumber(playerId, value);

  gameData = await updateGame(gameId, game.json());

  return Promise.resolve(gameData);
};

const addGamePlayer = async (gameId, playerId) => {
  let gameData = await findGame(gameId);

  if (gameData == null) {
    return null;
  }

  const game = new Game(gameData);
  game.join(playerId);

  gameData = await updateGame(gameId, game.json());

  return Promise.resolve(gameData);
};

const setGamePlayerReady = async (gameId, playerId, readyState) => {
  let gameData = await findGame(gameId);

  if (gameData == null) {
    return Promise.resolve(null);
  }

  const game = new Game(gameData);
  game.setReadyState(playerId, readyState);

  gameData = game.json();

  gameData = await updateGame(gameId, gameData);

  return Promise.resolve(gameData);
};

const emitGameState = (game) => {
  emitter.emit(EVENT_TYPES.STATE, game);
};

const getGameState = (data, playerId) => {
  const game = new Game(data);

  const gameData = game.json();

  let publicFields = [
    "id",
    "status",
    "state",
    "players",
    "minValue",
    "maxValue",
  ];

  if (playerId == null) {
    return Object.assign({}, reduceRecord(gameData, publicFields));
  }

  const playerState = game.findPlayer(playerId);

  let gameStatus = gameData.status;
  let winState = game.getWinState(playerId);

  switch (game.status) {
    case GAME_STATUS.draft: {
      if (playerState == null) {
        // player is not joined
        gameStatus = GAME_STATUS.draft;
      } else {
        // player is joined and waiting for game to start
        gameStatus = playerState.ready
          ? GAME_STATUS.loading
          : GAME_STATUS.draft;
      }
      break;
    }
    case GAME_STATUS.active:
    case GAME_STATUS.pending: {
      if (playerState == null) {
        // player is not joined and can only view
        gameStatus = GAME_STATUS.guest;
      } else {
        // player is not joined and can pick a number or wait for results
        gameStatus =
          playerState.number == null ? GAME_STATUS.active : GAME_STATUS.pending;
      }
      break;
    }
    case GAME_STATUS.closed: {
      gameStatus = GAME_STATUS.closed;
      publicFields.push("results");

      break;
    }
  }

  return Object.assign({}, reduceRecord(gameData, publicFields), {
    status: gameStatus,
    connected: playerState != null,
    ready: !!playerState?.ready,
    number: playerState?.number || null,
    winState,
  });
};

const addGameEventListener = (gameId, playerId, callback) => {
  emitter.once(EVENT_TYPES.STATE, (game) => {
    if (gameId !== game?.id) {
      return;
    }

    const state = getGameState(game, playerId);

    callback(state);
  });
};

module.exports = {
  createGame,
  updateGame,
  findGame,
  getGameState,
  addGamePlayer,
  setGamePlayerReady,
  setPlayerNumber,
  emitGameState,
  addGameEventListener,
};
