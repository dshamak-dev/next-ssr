import Link from "next/link.js";
import { useCallback, useMemo, useState } from "react";

import styles from "../styles/Login.module.scss";
import classNames from "classnames";
import { useRouter } from "next/router.js";
import PageHead from "../components/PageHead.js";
import { login } from "../api/login.api.js";
import { useAuth } from "../support/useAuth.js";
import Button from "../components/Button.js";
import { getAPIDomain } from "../api/api.model.js";

const _loginTypes = [
  { value: 0, text: "User" },
  { value: 1, text: "Business" },
];

export const Login = ({ apiDomain }) => {
  const router = useRouter();
  const { logged, user, setToken } = useAuth();

  const [selectedTypeValue, setSelectedTypeValue] = useState(
    _loginTypes[0].value
  );
  const selectedType = useMemo(() => {
    return _loginTypes.find((it) => it.value === selectedTypeValue);
  }, [selectedTypeValue]);
  const [busy, setBusy] = useState(false);

  const handleSubmit = useCallback(
    async (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      setBusy(true);

      const data = new FormData(ev.target);
      const entries = ["email", "password"].reduce((_fields, key) => {
        return { ..._fields, [key]: data.get(key) };
      }, {});

      login(apiDomain, { ...entries, type: selectedTypeValue })
        .then((res) => {
          router.push(
            `${selectedTypeValue === 0 ? `/users/` : `/business/`}${res.id}`
          );
        })
        .finally(() => {
          setBusy(false);
        });
    },
    [selectedTypeValue]
  );

  return (
    <>
      <PageHead />
      <main className={styles.main}>
        {logged && user != null ? (
          <div>
            <Button
              onClick={() =>
                router.push(
                  `${user.type != 0 ? `/business/` : `/users/`}${user.id}`
                )
              }
            >
              continue as {user.email}
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
                  <Link href="">Don't have an account?</Link>
                </div>
              </div>

              <div className={styles.submit}>
                <button disabled={busy}>Log In as {selectedType.text}</button>
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
      apiDomain: getAPIDomain()
    }
  }
}

export default Login;
