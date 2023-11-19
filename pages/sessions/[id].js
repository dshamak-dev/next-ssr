import { useCallback, useEffect, useMemo, useState } from "react";
import PageHead from "../../components/PageHead.js";
import { connectSessionUser, getSession, subscribeToSession } from "../../api/session.api.js";
import { getAPIDomain } from "../../api/api.model.js";
import BackButton from "../../components/BackButton.js";
import { useRecord } from "../../support/useRecord.js";
import { useAuth } from "../../support/useAuth.js";
import Button from "../../components/Button.js";

export default function SessionPage({ id, apiDomain, defaultState }) {
  const { logged, user, login } = useAuth();
  const [state, setState] = useState(defaultState);
  const inSession = useMemo(() => {
    if (!logged) {
      return false;
    }

    return state?.users?.find((id) => id == user.id) != null;
  }, [logged, state]);

  const record = useRecord({});

  const subscribe = useCallback(async () => {
    if (!record.active) {
      return;
    }

    try {
      const controller = new AbortController();
      record.controller = controller;

      const state = await subscribeToSession(apiDomain, id, {
        signal: controller.signal,
      }).then((res) => res.json());

      setState(state);

      subscribe();
    } catch (err) {
      const canResubscribe = err.message != "Failed to fetch";

      if (canResubscribe) {
        subscribe();
      }
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
      <main>
        <BackButton />
        <h1>
          <p>{id}</p>
          <small>session id</small>
        </h1>
        <div>
          <label>Users</label>
          <div>
            {!logged ? <Button primary onClick={() => login()}>Log In</Button> : null}
            {state?.users?.map((id) => {
              return (
                <div key={id}>
                  <span>{id}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* <div style={{ whiteSpaceCollapse: "break-spaces" }}>
          {JSON.stringify(state)}
        </div> */}
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
