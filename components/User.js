import { useRouter } from "next/router.js";
import Button from "./Button.js";
import { useCallback, useState } from "react";
import { createSession, getSession } from "../api/session.api.js";
import Link from "next/link.js";
import Popup from "./Popup.js";
import Form from "./Form.js";
import Input from "./Input.js";
import { setUserTransaction } from "../api/user.api.js";
import { useApi } from "../support/useApi.js";
import { useNavigation } from "../support/useNavigation.js";

export default function User({ apiDomain, user }) {
  const { navigate, router } = useNavigation();
  const [_user, setUser] = useState(user || {});
  const [busy, setBusy] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loadingSession, session, sessionError, trigger, resetSessionAPI] =
    useApi((id) => getSession(apiDomain, id), true);

  const handleNavigate = useCallback(
    (path) => {
      router.push(path);
    },
    [router]
  );

  const handleCreateSession = useCallback(() => {
    if (!_user.id) {
      return;
    }

    setBusy(true);

    createSession(apiDomain, _user.id)
      .then((res) => res.json())
      .then((res) => handleNavigate(`/sessions/${res.id}`))
      .finally(() => {
        setBusy(false);
      });
  }, [_user?.id]);

  const handleTransaction = useCallback(
    ({ value, password }) => {
      if (!_user.id) {
        return;
      }

      setBusy(true);

      const body = {
        password,
        value: value * showTransaction,
      };

      setUserTransaction(apiDomain, _user.id, body)
        .then((res) => {
          setUser((it) => {
            const value = Number(body.value) || 0;

            return {
              ...it,
              balance: it.balance + value,
            };
          });
        })
        .finally(() => {
          setShowTransaction(false);
          setBusy(false);
        });
    },
    [_user?.id, showTransaction]
  );

  const handleJoin = useCallback(
    async ({ id }) => {
      const res = await trigger(id);

      if (res != null && res.id != null) {
        navigate(`/sessions/${res.id}`);
      }
    },
    [apiDomain, trigger]
  );

  return (
    <div>
      <div>
        <h3>Hello, {_user.name || _user.email}</h3>
        <div>
          <h2>{_user.balance}</h2>
          <div>balance</div>
          <div>
            <Button disabled={busy} onClick={() => setShowTransaction(1)}>
              add points
            </Button>
            <Button
              primary
              disabled={busy}
              onClick={() => setShowTransaction(-1)}
            >
              sell points
            </Button>
          </div>
        </div>
      </div>
      <div>
        <Button onClick={handleCreateSession} disabled={busy}>
          create session
        </Button>
        <Button primary disabled={busy} onClick={() => setShowSearch(true)}>
          join session
        </Button>
      </div>
      <div className="section">
        <label>History</label>
        <div className="history">
          {!_user.history?.length ? (
            <div>no history records</div>
          ) : (
            _user.history.map((it, index) => {
              return (
                <div key={index} className="history_item">
                  <Link href={`/sessions/${it.id}`}>
                    {it.source || "custom"}
                  </Link>
                  <span>{it.status || "pending"}</span>
                  <span>{it.cost || 0}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
      <Popup
        visible={showTransaction}
        onClose={() => setShowTransaction(false)}
      >
        <div>
          <Form fields={["password", "value"]} onSubmit={handleTransaction}>
            <div>
              <Input
                required
                type="number"
                name="value"
                id="value"
                placeholder="Input Amount"
                defaultValue={0}
                step={1}
                min={0}
                max={showTransaction < 0 ? _user.balance : null}
              />
            </div>
            <div>
              <Input
                required
                type="password"
                name="password"
                id="password"
                placeholder="Password"
              />
            </div>
            <div>
              <Button primary>Trasfer</Button>
            </div>
          </Form>
        </div>
      </Popup>
      <Popup
        visible={showSearch}
        onClose={() => {
          resetSessionAPI();
          setShowSearch(false);
        }}
      >
        <div>
          <Form fields={["id"]} onSubmit={handleJoin}>
            <div>
              <Input
                disabled={loadingSession}
                required
                type="text"
                name="id"
                id="id"
                placeholder="Input Session ID"
              />
            </div>
            {sessionError != null ? <p>{sessionError}</p> : null}
            <div>
              <Button primary disabled={loadingSession}>
                Join
              </Button>
            </div>
          </Form>
        </div>
      </Popup>
      <style jsx>{`
        .section,
        .history {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .history_item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 1rem;
          background-color: white;
        }
      `}</style>
    </div>
  );
}
