import { useApi } from "../../support/useApi";
import { getSessionState } from "./session.api";
import { createContext, useCallback, useContext } from "react";
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

  const dispatch = useCallback((nextData) => {
    if (forseData) {
      forseData(nextData);
    }
  }, []);

  return (
    <ContestSessionContext.Provider
      value={[loading as boolean, data as SessionState | null, dispatch]}
    >
      {children}
    </ContestSessionContext.Provider>
  );
};