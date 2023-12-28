import { useCallback, useEffect, useMemo, useReducer } from "react";
import { useAuth } from "../auth/useAuth";
import { getProfile } from "./profile.api";

const profileReducer = (state, action) => {
  // console.log(state, action);

  switch (action.type) {
    case "data": {
      return {
        data: action.value,
        loading: false,
      };
    }
    case "loading": {
      return {
        ...state,
        loading: action.value,
      };
    }
    default: {
      return {
        ...state,
        loading: false,
      };
    }
  }
};

export const useProfile = () => {
  const { authId, status } = useAuth();

  const [{ data, loading }, dispatch] = useReducer(profileReducer, {
    data: null,
    loading: false,
  });

  const sync = useCallback(() => {
    if (!authId) {
      return;
    }

    dispatch({ type: "loading", value: true });
    getProfile(authId)
      .then((res) => res?.json())
      .then((data) => {
        dispatch({ type: "data", value: data });
      })
      .finally(() => {
        dispatch({ type: "loading", value: false });
      });
  }, [authId]);

  useEffect(() => {
    if (!authId) {
      return;
    }

    sync();
  }, [authId]);

  return [loading, data, status == "authenticated", dispatch, sync];
};
