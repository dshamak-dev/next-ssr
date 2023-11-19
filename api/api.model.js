export const getAPIDomain = () => {
  try {
    return process.env.API_DOMAIN;
  } catch(err) {
    return '';
  }
}

export const post = (domain, path, props, body) => {
  return fetch(`${domain}/api/${path}`, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...props,
    body: body,
  });
};

export const put = (domain, path, props, body) => {
  return fetch(`${domain}/api/${path}`, {
    method: "put",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    ...props,
    body: body,
  });
};

export const get = (domain, path, props) => {
  return fetch(`${domain}/api/${path}`, {
    ...props,
  });
};

export const del = (domain, path, props) => {
  return fetch(`${domain}/api/${path}`, {
    ...props,
    method: 'delete'
  });
};
