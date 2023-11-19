import { useCallback, useEffect, useMemo, useState } from "react";
import { getAuthToken, setAuthToken } from "../api/login.api.js";
import { useNavigation } from "./useNavigation.js";

export const useAuth = () => {
  const { navigate } = useNavigation();
  const [token, setToken] = useState(null);

  const handleSetToken = useCallback((_token) => {
    setAuthToken(_token);

    setToken(getAuthToken());
  }, []);

  const { logged, user } = useMemo(() => {
    if (!token) {
      return {
        logged: false,
        user: null,
      };
    }

    try {
      const _user = JSON.parse(token) || null;

      return {
        logged: _user != null,
        user: _user,
      };
    } catch (err) {
      return {
        logged: false,
        user: null,
      };
    }
  }, [token]);

  useEffect(() => {
    setToken(getAuthToken());
  }, []);

  const login = () => {
    navigate('/login', true);
  };

  return { logged, user, setToken: handleSetToken, login };
};
