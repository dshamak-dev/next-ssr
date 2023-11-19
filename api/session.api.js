import { API_PATH, get, post } from "./api.model.js";

export const createSession = (userId) => {
  return post(
    `/sessions`,
    null,
    JSON.stringify({
      ownerId: userId,
    })
  );
};

export const getSession = (sessionId) => {
  return get(`/sessions/${sessionId}`);
};

export const subscribeToSession = (sessionId) => {
  return get(`/sessions/${sessionId}/listen`);
};

export const postToSession = (sessionId, state) => {
  return post(`/sessions/${sessionId}/state`, null, JSON.stringify(state));
};
