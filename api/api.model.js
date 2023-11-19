export const API_PATH = `http://localhost:3001/api`;

export const post = (path, props, body) => {
  return fetch(`${API_PATH}${path}`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...props,
    body: body,
  });
};

export const get = (path, props) => {
  return fetch(`${API_PATH}${path}`, {
    ...props,
  });
};
