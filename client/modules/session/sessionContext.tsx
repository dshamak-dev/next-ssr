import { useApi } from "../../support/useApi";
import { getSessionState, subscribeSessionUpdate } from "./session.api";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { SessionState } from "./session.model";
import { ProfileContext } from "../profile/profileContext";

export const ContestSessionContext = createContext([
  false,
  null,
  null,
] as any[]);

export const ContestSessionProvider = ({ id, children }) => {
  const [loadingProfile, profile] = useContext(ProfileContext);

  const [loading, data, error, request, forseData] = useApi(
    () => profile == null ? Promise.reject('401') : getSessionState(id, profile?.id),
    null,
    profile?.id != null
  );
  const [pending, subscribeState, subscribeError, subscribe] = useApi(
    () => subscribeSessionUpdate(id, profile?.id),
    null,
    profile?.id != null
  );

  const sessionError = useMemo(() => {
    if (loadingProfile) {
      return null;
    }

    if (!profile?.id) {
      return {
        status: 401,
        message: "Profile Not Created",
      };
    }

    if (loading) {
      return null;
    }

    if (!data) {
      return {
        status: 404,
        message: "Session not found",
      };
    }
  }, [loadingProfile, profile, loading, data]);

  const dispatch = useCallback((nextData) => {
    if (forseData) {
      forseData(nextData);
    }
  }, []);

  useEffect(() => {
    if (subscribeState?.ok) {
      request();

      subscribe();
    }
  }, [subscribeState]);

  const session = useMemo(() => {
    if (!data || data.error) {
      return null;
    }

    return data;
  }, [data]);

  return (
    <ContestSessionContext.Provider
      value={[
        loading as boolean,
        session as SessionState | null,
        dispatch,
        sessionError,
      ]}
    >
      {children}
    </ContestSessionContext.Provider>
  );
};
