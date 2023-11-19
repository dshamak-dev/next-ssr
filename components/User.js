import { useRouter } from "next/router.js";
import Button from "./Button.js";
import { useCallback, useState } from "react";
import { createSession } from "../api/session.api.js";

export default function User(props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleNavigate = useCallback((path) => {
    router.push(path);
  }, [router]);

  const handleCreateSession = useCallback(() => {
    if (!props.id) {
      return;
    }

    setBusy(true);

    createSession(props.apiDomain, props.id)
      .then((res) => res.json())
      .then((res) => handleNavigate(`/sessions/${res.id}`))
      .finally(() => {
        setBusy(false);
      });
  }, [props?.id]);

  return (
    <div>
      <div>
        <h3>Hello, {props.email}</h3>
        <div>
          <h2>{props.balance}</h2>
          <div>balance</div>
          <div>
            <Button disabled={busy}>add points</Button>
            <Button primary disabled={busy}>sell points</Button>
          </div>
        </div>
      </div>
      <div>
        <Button onClick={handleCreateSession} disabled={busy}>create session</Button>
        <Button primary disabled={busy}>join session</Button>
      </div>
      <div>
        <label>History</label>
        <div>
          {!props.history?.length ? (
            <div>no history records</div>
          ) : (
            props.history.map((it, index) => {
              return (
                <div key={index}>
                  <span>{it.source}</span>
                  <span>{it.cost}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
