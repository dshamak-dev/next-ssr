export const getAPIDomain = () => {
  try {
    return process.env.API_DOMAIN;
  } catch (err) {
    return "";
  }
};

// export const post = (domain, path, props, body) => {
//   return fetch(`${domain}/api/${path}`, {
//     method: "post",
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     ...props,
//     body: body,
//   });
// };

// export const put = (domain, path, props, body) => {
//   return fetch(`${domain}/api/${path}`, {
//     method: "put",
//     headers: {
//       Accept: "application/json",
//       "Content-Type": "application/json",
//     },
//     ...props,
//     body: body,
//   });
// };

// export const get = (domain, path, props) => {
//   return fetch(`${domain}/api/${path}`, {
//     ...props,
//   });
// };

// export const del = (domain, path, props) => {
//   return fetch(`${domain}/api/${path}`, {
//     ...props,
//     method: "delete",
//   });
// };

export const waitFor = (ms) => {
  return new Promise((res) => {
    setTimeout(res, ms);
  });
};

class Api {
  apiUrl;

  constructor() {
    this.apiUrl = getAPIDomain();
  }

  getAddress(path) {
    return `${this.apiUrl}/api/${path.replace(/^\//, "")}`;
  }

  get(path) {
    return fetch(this.getAddress(path)).catch((err) => {
      return null;
    });
  }

  post(path, { json = true, body, ...other }) {
    let requestBody = body;

    if (json && typeof body === "object") {
      requestBody = JSON.stringify(body);
    }

    return fetch(this.getAddress(path), {
      method: "post",
      headers: {
        "Content-Type": json ? "application/json" : undefined,
        Accept: json ? "application/json" : undefined,
      },
      body: requestBody,
      ...other,
    }).catch((err) => {
      return null;
    });
  }

  put(path, { json = true, body }) {
    return this.post(path, { json, body, method: "put" });
  }
}

export const appApi = new Api();
