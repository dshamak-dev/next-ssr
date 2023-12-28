const https = require("https");

const memo = {};

module.exports = {
  resolve: async (companyId, connectionId, { players }) => {
    const memoKey = `${companyId}-${connectionId}`;

    if (memo[memoKey]) {
      return Promise.resolve({ ok: false, error: null });
    }

    const clearMemo = () => {
      memo[memoKey] = false;
    };

    memo[memoKey] = true;

    try {
      const promise = new Promise((resolve, reject) => {
        https
          .request(
            {
              protocol: "https:",
              hostname: "next-ssr-sp4k.onrender.com",
              path: `/api/connections/${connectionId}/resolve`,
              method: "post",
              headers: {
                "content-type": "application/json",
                accept: "application/json",
              },
              body: JSON.stringify({ companyId, players }),
            },
            (response) => {
              response.on("data", (data) => {
                resolve(data);
              });

              response.on("error", (err) => {
                reject(err);
              });
            }
          )
          .on("error", (error) => {
            
            reject(error);
          });
      });

      return promise.catch((err) => {
        return { ok: false, error: err };
      }).finally(() => {
        clearMemo();
      });
    } catch (error) {
      clearMemo();

      return Promise.resolve({ ok: false, error: err });
    }
  },
};
