import { post } from "./api.model.js";

const _authTokenPath = "_auth_token";

const storage = () => sessionStorage;

export const getAuthToken = () => {
  return storage().getItem(_authTokenPath) || null;
};

export const setAuthToken = (user) => {
  const token = typeof user === "object" ? JSON.stringify(user) : user || null;

  storage().setItem(_authTokenPath, token);

  return token;
};

export const login = async (domain, body) => {
  return post(domain, `login`, null, JSON.stringify(body));
};

export const signup = async (domain, body) => {
  return post(domain, `signup`, null, JSON.stringify(body));
};

