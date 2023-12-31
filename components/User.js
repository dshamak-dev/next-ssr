import Button from "./Button.js";
import { useCallback, useState } from "react";
import { createSession, getSession } from "../api/session.api.js";
import { Popup } from "./Popup.js";
import Form from "./Form.js";
import Input from "./Input.js";
import { setUserTransaction, getUserTransactions } from "../api/user.api.js";
import { useApi } from "../support/useApi.js";
import { useNavigation } from "../support/useNavigation.js";
import Link from "next/link.js";

export default function User({ apiDomain, user }) {
  const { navigate, router } = useNavigation();
  const [_user, setUser] = useState(user || {});
  const [busy, setBusy] = useState(false);
  const [isOpenTransactions, setOpenTransactions] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [loadingSession, session, sessionError, trigger, resetSessionAPI] =
    useApi((id) => getSession(apiDomain, id), true);

  const [
    loadingTransactions,
    transactions,
    transactionsError,
    getTransactions,
  ] = useApi((id) => getUserTransactions(apiDomain, id));

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

  const handleShowTransactions = useCallback(() => {
    if (!_user.id) {
      return;
    }

    setOpenTransactions(true);
    getTransactions(_user.id);
  }, [_user?.id]);

  return (
    <div className="group">
      <div className="group">
        <h3>Hello, {_user.name || _user.email}</h3>
        <div className="group">
          <div className="field" onClick={handleShowTransactions}>
            <h2>{_user.balance || 0}</h2>
            <div>balance</div>
          </div>
          <div className="controls">
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

      <div className="controls">
        <a onClick={handleCreateSession}>create session</a>
        <a disabled={busy} onClick={() => setShowSearch(true)}>
          join session
        </a>
      </div>

      {/* <div className="section">
        <div onClick={() => setOpenHistory((state) => !state)} className="controls">
          <label>History</label>
          <span>{isOpenHistory ? "-" : "+"}</span>
        </div>

        {isOpenHistory ? (
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
                  </div>
                );
              })
            )}
          </div>
        ) : null}
      </div> */}
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
      <Popup
        visible={isOpenTransactions}
        onClose={() => setOpenTransactions(false)}
      >
        <div className="group">
          <h2>Transactions</h2>
          <div className="group">
            {loadingTransactions ? (
              <div>loading</div>
            ) : transactions ? (
              transactions.map((it, index) => {
                return (
                  <div key={it.id || index} className="flex gap-1 between border-1 p-1 transaction">
                    <Link href={`/sessions/${it.sessionId}`}>
                      Session #{it.sessionId}
                    </Link>
                    <span>{it.value}</span>
                  </div>
                );
              })
            ) : (
              <div>no transactions</div>
            )}
          </div>
        </div>
      </Popup>
      <style jsx>{`
        .history,
        .group {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .transaction {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          text-align: center;
        }

        .controls {
          display: flex;
          justify-content: space-between;
          gap: 2rem;
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
