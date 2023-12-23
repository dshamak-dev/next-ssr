// const { EventEmitter } = require("events");

// const emitter = new EventEmitter();

const listeners = new Map();

const addListener = (userId, sessionId, callback) => {
  listeners.set(userId, {
    callback,
    type: sessionId,
  });
};

const removeListener = (userId) => {
  if (listeners.has(userId)) {
    listeners.delete(userId);
  }
};

const emit = (sessionId, payload, blacklist = []) => {
  listeners.forEach((it, key) => {
    if (!it || blacklist && blacklist.includes(key)) {
      return;
    }

    const { callback, type } = it;

    if (callback && type === sessionId) {
      callback(type, payload);
    }
  });
};

module.exports = {
  addListener,
  removeListener,
  emit
};
