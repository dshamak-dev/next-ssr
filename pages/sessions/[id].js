import { useCallback, useEffect, useMemo, useState } from "react";
import PageHead from "../../components/PageHead.js";
import {
  connectSessionUser,
  createSessionBid,
  getSession,
  subscribeToSession,
  updateSessionState,
} from "../../api/session.api.js";
import { getAPIDomain } from "../../api/api.model.js";
import { useRecord } from "../../support/useRecord.js";
import { useAuth } from "../../support/useAuth.js";
import Button from "../../components/Button.js";
import SessionUser from "../../components/SessionUser.js";
import { useNavigation } from "../../support/useNavigation.js";
import AccountHeader from "../../components/AccountHeader.js";
import { useApi } from "../../support/useApi.js";
import { Popup } from "../../components/Popup.js";
import Form from "../../components/Form.js";
import Input from "../../components/Input.js";

export default function SessionPage({ id, apiDomain, defaultState }) {
  const { logged, user, login } = useAuth();
  const [session, setState] = useState(defaultState);
  const [reconnect, setReconnect] = useState(false);
  const { url, reload } = useNavigation();
  const [bidPopupVisible, setBidPopupVisible] = useState(false);
  const [loadingBet, bidResponse, bidError, requestBid] = useApi(
    (body) => createSessionBid(apiDomain, id, body),
    true
  );
  const [loadingSessionState, sessionState, stateError, requestStateChange] = useApi(
    (body) => updateSessionState(apiDomain, id, body),
    true
  );

  const handleBidOn = useCallback(
    ({ value }) => {
      requestBid({ value, id, userId: user.id }).then(() => {
        setBidPopupVisible(false);
      });
    },
    [requestBid, id, user?.id]
  );

  const handleSessionStateChange = useCallback((status) => {
    requestStateChange({ status, userId: user.id });
  }, [requestStateChange, user]);

  const isAdmin = useMemo(() => {
    if (!session?.ownerId || !user?.id) {
      return false;
    }

    return session.ownerId === user.id;
  }, [session, user?.id]);

  const userSessionState = useMemo(() => {
    if (!logged) {
      return null;
    }

    return session?.users?.find(({ id }) => id == user.id);
  }, [logged, session]);

  const inSession = useMemo(() => {
    return userSessionState != null;
  }, [userSessionState]);

  const record = useRecord({});

  const subscribe = useCallback(async () => {
    setReconnect(false);

    if (!record.active) {
      return;
    }

    const handleError = (err) => {
      const canResubscribe = err.message != "Failed to fetch";

      if (canResubscribe) {
        subscribe();
      } else {
        setReconnect(true);
      }
    };

    try {
      const controller = new AbortController();
      record.controller = controller;

      const _session = await subscribeToSession(apiDomain, id, {
        signal: controller.signal,
      })
        .then((res) => {
          return Promise.resolve(res);
        })
        .then((res) => res.json())
        .then((session) => {
          setState(session);

          subscribe();
        })
        .catch((err) => {
          handleError(err);
        });
    } catch (err) {
      handleError(err);
    }

    record.controller = null;
  }, []);

  useEffect(() => {
    if (!user || inSession) {
      return;
    }

    connectSessionUser(apiDomain, id, user.id).catch((err) => {});

    return () => {
      // dissconect
    };
  }, [logged, inSession]);

  useEffect(() => {
    record.active = true;

    subscribe();

    return () => {
      record.active = false;

      try {
        record?.controller?.abort();
      } catch (err) {}
    };
  }, []);

  const sessionControls = useMemo(() => {
    if (!isAdmin) {
      return null;
    }

    switch (session?.status) {
      case "pending": {
        return <Button onClick={() => handleSessionStateChange('active')}>Lock current bid</Button>;
      }
      case "active": {
        return <Button onClick={() => handleSessionStateChange('resolved')}>Resolve session</Button>;
      }
      default: {
        return null;
      }
    }
  }, [isAdmin, session]);

  const bidControlsContent = useMemo(() => {
    if (!logged || !inSession) {
      return null;
    }

    if (session.status !== "pending") {
      return <div>all bids accepted</div>;
    }

    console.log({ userSessionState });

    const sessionBid = Number(session?.bid) || 0;
    const userBid = Number(userSessionState?.bid) || 0;
    const hasOtherBid = sessionBid !== userBid;

    return (
      <div>
        <div className="flex between gap-1">
          <Button primary onClick={() => setBidPopupVisible(true)}>
            Bid On
          </Button>
          {hasOtherBid ? (
            <Button
              onClick={() => {
                handleBidOn({ value: sessionBid });
              }}
            >
              Accept current
            </Button>
          ) : null}
        </div>
      </div>
    );
  }, [logged, inSession, session?.bid, userSessionState]);

  return (
    <>
      <PageHead />
      <main className="session-page">
        <div className="flex between">
          <AccountHeader apiDomain={apiDomain} />
        </div>
        <div className="session-field">
          <h1>
            <a target="_blank" href={url}>
              {id}
            </a>
          </h1>
          <small>session id</small>
        </div>
        {reconnect ? null : sessionControls}
        <div className="session-field">
          <h2>{session?.bid || 0}</h2>
          <small>session bid</small>
        </div>
        {reconnect ? (
          <div>
            <p>Opps! Connection failed.</p>
            <Button primary onClick={() => reload()}>
              Reconnect
            </Button>
          </div>
        ) : (
          <>
            {bidControlsContent}
          </>
        )}
        {reconnect ? null : (
          <>
            <div className="users-list">
              <label>Users</label>
              <div className="users-list">
                {!logged ? (
                  <Button primary onClick={() => login()}>
                    Log In
                  </Button>
                ) : null}
                {session?.users?.map((it) => {
                  const isSelf = it.id === user?.id;
                  const canKick = isAdmin && !isSelf;

                  return (
                    <SessionUser
                      key={it.id}
                      session={session}
                      user={it}
                      active={isSelf}
                      canKick={canKick}
                    />
                  );
                })}
              </div>
            </div>
            <Popup
              visible={bidPopupVisible}
              onClose={() => setBidPopupVisible(false)}
            >
              <Form fields={["value"]} onSubmit={handleBidOn}>
                <div>
                  <Input
                    required
                    disabled={loadingBet}
                    type="number"
                    name="value"
                    id="value"
                    placeholder="Input Bid"
                    defaultValue={0}
                    step={1}
                    min={0}
                  />
                </div>
                <div>
                  <Button primary disabled={loadingBet}>
                    Confirm Bid
                  </Button>
                </div>
              </Form>
            </Popup>
          </>
        )}
        <style jsx>{`
          .session-page {
            width: 100vw;
            box-sizing: border-box;
            padding: 1rem;

            display: flex;
            flex-direction: column;
            gap: 2rem;
          }

          .session-field {
            display: flex;
            flex-direction: column;
            gap: 0.125rem;
            text-align: center;
            text-transform: uppercase;
          }

          .users-list {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
        `}</style>
      </main>
    </>
  );
}

export async function getServerSideProps(context) {
  const apiDomain = getAPIDomain();
  const sessionId = context.params.id;

  let defaultState = { users: [], isAdmin: false };

  try {
    defaultState = await getSession(apiDomain, sessionId).then((res) =>
      res.json()
    );
  } catch (err) {}

  return {
    props: {
      defaultState,
      apiDomain,
      id: sessionId,
    },
  };
}
