export const getAPIDomain = () => {
  try {
    return process.env.API_DOMAIN;
  } catch (err) {
    return "";
  }
};

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
    } as any)
      .then(async (res) => {
        let error = null;
        let response: any = null;

        try {
          if (res.json) {
            response = await res.json();

            error = response?.error;
          }
        } catch (err) {}

        if (!error && res.status >= 200 && res.status < 300) {
          return response;
        }

        return Promise.reject({ message: error });
      });
  }

  put(path, { json = true, body }) {
    return this.post(path, { json, body, method: "put" });
  }
}

export const appApi = new Api();
