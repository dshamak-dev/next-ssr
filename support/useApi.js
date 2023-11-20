import { useCallback, useState } from "react";

export const useApi = (request, json = false) => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
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
          .then((res) => {
            if (res.status >= 400) {
              return Promise.reject(res.statusText);
            }

            if (json) {
              return res.json();
            }

            return Promise.resolve(res);
          })
          .then((res) => {
            setResponse(res);
            setLoading(false);

            return res;
          })
          .catch((err) => handleError(err));
      } catch (err) {
        handleError(err);

        return Promise.reject(err);
      }
    },
    [request, handleError]
  );

  // const abort = useCallback(() => {
  //   try {
  //     console.abort();
  //   } catch (err) {}
  // }, [controller]);

  const reset = useCallback(() => {
    setResponse(null);
    setError(null);
    setLoading(false);
  }, []);

  return [loading, response, error, trigger, reset];
};
