import { useCallback, useEffect, useReducer } from "react";

interface Action<T> {
  type: "loading" | "data" | "error";
  value: boolean | T;
  error?: string;
}

interface State<T> {
  data: T | null | boolean;
  loading?: boolean;
  error?: string | null;
}

interface ReducerType<T> {
  prevState: State<T>;
  action: Action<T>;
}


function reducer<T>(prevState: State<T>, action: Action<T>) {
  let nextState = Object.assign({}, prevState);

  switch (action.type) {
    case "data": {
      nextState.loading = false;
      nextState.data = action.value;
      break;
    }
    case "error": {
      nextState.error = action.value as string | null;
      nextState.data = null;
      nextState.loading = false;
      break;
    }
    case "loading": {
      nextState.loading = !!action.value;
      break;
    }
  }

  return nextState;
};

export function useApi<T>(
  requestCallback,
  initialData: T | null = null,
  initialStart = false
): any[] {
  const [{ loading, data, error }, dispatch] = useReducer(reducer, {
    loading: false,
    data: initialData as T | null,
    error: null,
  });

  const handleRequest = useCallback(async () => {
    if (!requestCallback) {
      return null;
    }

    dispatch({ type: "loading", value: true });

    try {
      const res = await requestCallback();

      dispatch({ type: "data", value: res });
    } catch (err) {
      dispatch({ type: "error", value: err.message });
    }
  }, [requestCallback]);

  const forseData = (data) => {
    dispatch({ type: "data", value: data });
  };

  useEffect(() => {
    if (initialStart) {
      handleRequest();
    }
  }, [initialStart]);

  return [loading, data, error, handleRequest, forseData];
};
