import { appApi, waitFor } from "../../api/api.model";
import { DTOSessionAction, SessionState } from "./session.model";

export const getSession = (id): Promise<SessionState | null> => {
  return appApi.get(`/sessions/${id}`).then((res) => res?.json());
};

export const getSessionState = (id, userId): Promise<SessionState | null> => {
  return appApi.get(`/sessions/${id}/${userId}`).then((res) => res?.json());
};

export const postSession = (body: {
  ownerId: string;
  name: string;
  options: string[];
  description?: string;
}) => {
  return appApi.post("/sessions", { json: true, body });
};

export const postSessionBid = (
  sessionId: string,
  userId,
  payload: {
    optionId;
    value: number;
  }
) => {
  const body = {
    userId,
    action: DTOSessionAction.SetBid,
    payload,
  };

  return appApi
    .put(`/sessions/${sessionId}/action`, { json: true, body });
};

export const removeSessionBid = (sessionId: string, userId) => {
  const body = {
    userId,
    action: DTOSessionAction.RemoveBid,
  };

  return appApi
    .put(`/sessions/${sessionId}/action`, { json: true, body });
};

export const joinSessionBid = (sessionId: string, userId) => {
  const body = {
    userId,
    action: DTOSessionAction.Connect,
  };

  return appApi
    .put(`/sessions/${sessionId}/action`, { json: true, body });
};

export const lockSession = (sessionId: string, userId) => {
  const body = {
    userId,
    action: DTOSessionAction.LockSession,
  };

  return appApi
    .put(`/sessions/${sessionId}/action`, { json: true, body });
};

export const resolveSession = (sessionId: string, userId, payload) => {
  const body = {
    userId,
    action: DTOSessionAction.ResolveSession,
    payload,
  };

  return appApi
    .put(`/sessions/${sessionId}/action`, { json: true, body });
};

export const subscribeSessionUpdate = async (sessionId, userId) => {
  return appApi
    .get(`/sessions/${sessionId}/${userId}/subscribe`)
    .then((res) => res?.json())
    .catch((error) => {
      return { updateAt: Date.now(), ok: false };
    });
};
