import { useCallback, useEffect, useState } from "react";
import PageHead from "../../components/PageHead.js";
import { getSession, subscribeToSession } from "../../api/session.api.js";
import { getAPIDomain } from "../../api/api.model.js";

export default function SessionPage({ id, apiDomain, defaultState }) {
  const [state, setState] = useState(defaultState);

  const subscribe = useCallback(async () => {
    try {
      const state = await subscribeToSession(apiDomain, id).then((res) =>
        res.json()
      );
      setState(state);

      subscribe();
    } catch (err) {
      const canResubscribe = err.message != "Failed to fetch";

      console.error(err);

      if (canResubscribe) {
        subscribe();
      }
    }
  }, []);

  useEffect(() => {
    subscribe();
  }, []);

  return (
    <>
      <PageHead />
      <main>
        <h1>
          <p>{id}</p>
          <small>session id</small>
        </h1>
        <div style={{ whiteSpaceCollapse: "break-spaces" }}>
          {JSON.stringify(state)}
        </div>
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
