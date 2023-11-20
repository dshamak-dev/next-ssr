import Link from "next/link.js";
import { useCallback, useMemo, useState } from "react";

import styles from "../styles/Login.module.scss";
import classNames from "classnames";
import PageHead from "../components/PageHead.js";
import { login, setAuthToken } from "../api/login.api.js";
import { useAuth } from "../support/useAuth.js";
import Button from "../components/Button.js";
import { getAPIDomain } from "../api/api.model.js";
import { useNavigation } from "../support/useNavigation.js";
import { useApi } from "../support/useApi.js";

const _loginTypes = [
  { value: 0, text: "User" },
  { value: 1, text: "Business" },
];

export const Login = ({ apiDomain }) => {
  const { redirect } = useNavigation();
  const { logged, user, setToken } = useAuth();
  const [loading, response, error, handleLogin, reset] = useApi(
    (body) => login(apiDomain, body),
    true
  );

  const [selectedTypeValue, setSelectedTypeValue] = useState(
    _loginTypes[0].value
  );
  const selectedType = useMemo(() => {
    return _loginTypes.find((it) => it.value === selectedTypeValue);
  }, [selectedTypeValue]);

  const [isLogin, setLoginState] = useState(true);
  const [busy, setBusy] = useState(false);

  const handleToggleState = useCallback(() => {
    if (busy) {
      return;
    }

    setLoginState((state) => !state);
  }, [isLogin, busy]);

  const handleSubmit = useCallback(
    async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      setBusy(true);

      const data = new FormData(ev.target);
      const entries = ["email", "password"]
        .concat(isLogin ? [] : ["name"])
        .reduce((_fields, key) => {
          return { ..._fields, [key]: data.get(key) };
        }, {});

      handleLogin({ ...entries, type: selectedTypeValue })
        .then((res) => {
          console.log({ res });

          const { email, type, id } = res;

          setAuthToken(
            JSON.stringify({ email, type, id, createdAt: Date.now() })
          );

          redirect(
            `${selectedTypeValue === 0 ? `/users/` : `/business/`}${id}`
          );
        })
        .finally(() => {
          setBusy(false);
        });
    },
    [selectedTypeValue, isLogin]
  );

  return (
    <>
      <PageHead />
      <main className={styles.main}>
        {logged && user != null ? (
          <div>
            <Button
              onClick={() =>
                redirect(
                  `${user.type != 0 ? `/business/` : `/users/`}${user.id}`
                )
              }
            >
              continue as {user?.email}
            </Button>
            <Button primary onClick={() => setToken(null)}>
              Switch Account
            </Button>
          </div>
        ) : (
          <div className={styles.popup}>
            <Link href="/" className={styles.closeButton} />
            <div className={styles.header}>
              <h1 className={styles.title}>Login</h1>
              <div className={styles.toggle}>
                {_loginTypes.map((it, index) => {
                  return (
                    <span
                      key={it.value}
                      className={classNames(styles.toggleItem, {
                        [styles.toggleItemActive]:
                          selectedTypeValue === it.value,
                      })}
                      onClick={() => setSelectedTypeValue(it.value)}
                    >
                      {it.text}
                    </span>
                  );
                })}
              </div>
            </div>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
              aria-disabled={busy}
            >
              <div className={styles.fields}>
                {isLogin ? null : (
                  <div className={styles.field}>
                    <input
                      required
                      name="name"
                      id="name"
                      type="text"
                      placeholder="Name"
                      disabled={busy}
                    />
                  </div>
                )}
                <div className={styles.field}>
                  <input
                    required
                    name="email"
                    id="email"
                    type="email"
                    placeholder="Email"
                    disabled={busy}
                  />
                </div>
                <div className={styles.field}>
                  <input
                    required
                    name="password"
                    id="password"
                    type="password"
                    placeholder="Password"
                    disabled={busy}
                  />
                </div>
                <div>
                  <a onClick={handleToggleState}>
                    {isLogin ? `Don't have an account?` : `I have an account!`}
                  </a>
                </div>
              </div>

              <div className={styles.submit}>
                {error ? <p className="error">{error}</p> : null}
                <button disabled={busy}>
                  {isLogin ? `Log In` : `Sign Up`} as {selectedType.text}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
};

export function getServerSideProps() {
  return {
    props: {
      apiDomain: getAPIDomain(),
    },
  };
}

export default Login;
