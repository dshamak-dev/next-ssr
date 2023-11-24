import { useCallback, useState } from "react";

export const useApi = (request, json = false, defaultState = null) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(defaultState);
  const [error, setError] = useState(null);
  // const [controller, setController] = useState(null);

  const handleError = useCallback((err) => {
    setResponse(null);

    setError(err?.message || err);
    setLoading(false);

    return null;
  }, []);

  const trigger = useCallback(
    async (...args) => {
      // const _controller = new AbortController();

      // setController(_controller);

      setLoading(true);

      try {
        return request(...args)
          .then(async (res) => {
            if (res.status >= 400) {
              const { error } = await (res.json
                ? res.json()
                : Promise.resolve({ error: res.statusText }));

              return Promise.reject(error);
            }

            if (json) {
              return res.json();
            }

            return res;
          })
          .then((res) => {
            setResponse(res);
            setLoading(false);

            return Promise.resolve(res);
          })
          .catch((err) => {
            handleError(err);

            return Promise.reject(err);
          });
      } catch (err) {
        handleError(err);

        return Promise.reject(err);
      }
    },
    [request, handleError]
  );

  const forceData = useCallback((data) => {
    setResponse(data);
  }, [setResponse]);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
  }, []);

  return [loading, response, error, trigger, reset, forceData];
};
