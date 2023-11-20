import { useCallback, useEffect, useMemo, useState } from "react";
import PageHead from "../../components/PageHead.js";
import {
  connectSessionUser,
  getSession,
  subscribeToSession,
} from "../../api/session.api.js";
import { getAPIDomain } from "../../api/api.model.js";
import BackButton from "../../components/BackButton.js";
import { useRecord } from "../../support/useRecord.js";
import { useAuth } from "../../support/useAuth.js";
import Button from "../../components/Button.js";
import SessionUser from "../../components/SessionUser.js";
import { useNavigation } from "../../support/useNavigation.js";

export default function SessionPage({ id, apiDomain, defaultState }) {
  const { logged, user, login } = useAuth();
  const [state, setState] = useState(defaultState);
  const [reconnect, setReconnect] = useState(false);
  const { url } = useNavigation();

  const inSession = useMemo(() => {
    if (!logged) {
      return false;
    }

    return state?.users?.find((id) => id == user.id) != null;
  }, [logged, state]);

  const record = useRecord({});

  const subscribe = useCallback(async () => {
    setReconnect(false);

    if (!record.active) {
      return;
    }

    const handleError = (err) => {
      const canResubscribe = err.message != "Failed to fetch";

      if (canResubscribe) {
        console.log({ canResubscribe, err });

        subscribe();
      } else {
        setReconnect(true);
      }
    };

    try {
      const controller = new AbortController();
      record.controller = controller;

      const state = await subscribeToSession(apiDomain, id, {
        signal: controller.signal,
      })
        .then((res) => {
          console.log("subscribe", { res });

          return Promise.resolve(res);
        })
        .then((res) => res.json())
        .then((state) => {
          setState(state);

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

  return (
    <>
      <PageHead />
      <main className="session-page">
        <BackButton />
        <div className="session-field">
          <h1><a target="_blank" href={url}>{id}</a></h1>
          <small>session id</small>
        </div>
        <div className="session-field">
          <h2>{state?.bid || 0}</h2>
          <small>session bid</small>
        </div>
        {reconnect ? (
          <div>
            <p>Opps! Connection failed.</p>
            <Button primary onClick={() => subscribe()}>
              Reconnect
            </Button>
          </div>
        ) : null}
        <div className="users-list">
          <label>Users</label>
          <div>
            {!logged ? (
              <Button primary onClick={() => login()}>
                Log In
              </Button>
            ) : null}
            {state?.users?.map((it) => {
              return <SessionUser key={it.id} session={state} user={it} />;
            })}
          </div>
        </div>
        {/* <div style={{ whiteSpaceCollapse: "break-spaces" }}>
          {JSON.stringify(state)}
        </div> */}
        <style jsx>{`
          .session-page {
            width: 100vh;
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
