import { API_PATH } from "./api.model.js";

const _authTokenPath = "_auth_token";

export const getAuthToken = () => {
  return localStorage.getItem(_authTokenPath) || null;
};

export const setAuthToken = (user) => {
  const token = typeof user === 'object' ? JSON.stringify(user) : user || null;

  localStorage.setItem(_authTokenPath, token);

  return token;
};

export const login = async ({ email, password, type }) => {
  return fetch(`${API_PATH}/login`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, type }),
  })
    .then((res) => res.json())
    .then(({ email, type, id }) => {
      const user = { email, type, id };
      
      setAuthToken(JSON.stringify({ email, type, id, createdAt: Date.now() }));

      return user;
    });
};
