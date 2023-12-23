import { useApi } from "../../support/useApi";
import { getSessionState, subscribeSessionUpdate } from "./session.api";
import { createContext, useCallback, useContext, useEffect } from "react";
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
    () => getSessionState(id, profile?.id),
    null,
    profile?.id != null
  );
  const [pending, subscribeState, subscribeError, subscribe] = useApi(
    () => subscribeSessionUpdate(id, profile?.id),
    null,
    profile?.id != null
  );

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

  return (
    <ContestSessionContext.Provider
      value={[loading as boolean, data as SessionState | null, dispatch]}
    >
      {children}
    </ContestSessionContext.Provider>
  );
};
