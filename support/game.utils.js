const getStorage = () => {
  return localStorage;
};

const getItem = (key) => {
  const record = getStorage().getItem(key);

  try {
    return JSON.parse(record);
  } catch (err) {
    return record;
  }
};

const setItem = (key, data) => {
  getStorage().setItem(
    key,
    typeof data === "object" ? JSON.stringify(data) : data
  );
};

const HISTORY_STORAGE_KEY = "_games-history";

export const getGamesHistory = () => {
  return getItem(HISTORY_STORAGE_KEY);
};

export const setGamesHistory = (history) => {
  return setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
};

export const addGamesHistory = (id) => {
  const _history = getGamesHistory() || [];

  if (_history.includes(id)) {
    return;
  }

  _history.push(id);

  setGamesHistory(_history);
};
