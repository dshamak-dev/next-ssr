import { useCallback, useEffect, useState } from "react";
import PageHead from "../../components/PageHead.js";
import { getSession, subscribeToSession } from "../../api/session.api.js";

export default function SessionPage({ id, env, defaultState }) {
  const [state, setState] = useState(defaultState);

  const subscribe = useCallback(async () => {
    try {
      const state = await subscribeToSession(id).then(res => res.json());
      setState(state);

      subscribe();
    } catch(err) {
      subscribe();
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
  console.log({ context: context, env: process.env });
  const sessionId = context.params.id;

  const env = ["API_HOST"].reduce((all, key) => {
    return { ...all, [key]: process.env[key] };
  }, {});

  let defaultState = { users: [], isAdmin: false };

  try {
    defaultState = await getSession(sessionId).then(res => res.json());
  } catch (err) {

  }

  return {
    props: {
      env,
      defaultState,
      id: sessionId,
    },
  };
}
