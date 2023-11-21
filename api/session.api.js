import { get, post, put, del } from "./api.model.js";

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

export const subscribeToSession = (domain, sessionId, props) => {
  return get(domain, `sessions/${sessionId}/listen`, props);
};

export const postToSession = (domain, sessionId, state) => {
  return post(domain, `sessions/${sessionId}/state`, null, JSON.stringify(state));
};

export const connectSessionUser = (domain, sessionId, userId) => {
  return post(domain, `sessions/${sessionId}/users`, null, JSON.stringify({ id: userId }));
};

export const createSessionBid = (domain, sessionId, body) => {
  return post(domain, `sessions/${sessionId}/bids`, null, JSON.stringify(body));
};

export const updateSessionState = (domain, sessionId, body) => {
  return put(domain, `sessions/${sessionId}/state`, null, JSON.stringify(body));
};

export const disconnectSessionUser = (domain, sessionId, userId) => {
  return del(domain, `sessions/${sessionId}/users/${userId}`, null);
};
