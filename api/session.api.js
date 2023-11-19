import { get, post } from "./api.model.js";

export const createSession = (domain, userId) => {
  return post(
    domain,
    `sessions`,
    null,
    JSON.stringify({
      ownerId: userId,
    })
  );
};

export const getSession = (domain, sessionId) => {
  return get(domain, `sessions/${sessionId}`);
};

export const subscribeToSession = (domain, sessionId) => {
  return get(domain, `sessions/${sessionId}/listen`);
};

export const postToSession = (domain, sessionId, state) => {
  return post(domain, `sessions/${sessionId}/state`, null, JSON.stringify(state));
};
