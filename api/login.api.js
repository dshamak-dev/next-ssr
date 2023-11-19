import { post } from "./api.model.js";

const _authTokenPath = "_auth_token";

export const getAuthToken = () => {
  return localStorage.getItem(_authTokenPath) || null;
};

export const setAuthToken = (user) => {
  const token = typeof user === "object" ? JSON.stringify(user) : user || null;

  localStorage.setItem(_authTokenPath, token);

  return token;
};

export const login = async (domain, { email, password, type }) => {
  return post(domain, `login`, null, JSON.stringify({ email, password, type }))
    .then((res) => res.json())
    .then(({ email, type, id }) => {
      const user = { email, type, id };

      setAuthToken(JSON.stringify({ email, type, id, createdAt: Date.now() }));

      return user;
    });
};
