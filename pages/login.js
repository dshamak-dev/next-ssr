import Link from "next/link.js";
import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "../styles/Login.module.scss";
import classNames from "classnames";
import { useRouter } from "next/router.js";
import PageHead from "../components/PageHead.js";

const _loginTypes = [
  { value: 0, text: "User" },
  { value: 1, text: "Business" },
];

export const Login = () => {
  const router = useRouter();
  const [selectedTypeValue, setSelectedTypeValue] = useState(
    _loginTypes[0].value
  );
  const selectedType = useMemo(() => {
    return _loginTypes.find((it) => it.value === selectedTypeValue);
  }, [selectedTypeValue]);

  const handleSubmit = useCallback(
    (ev) => {
      ev.preventDefault();
      ev.stopPropagation();

      const data = new FormData(ev.target);
      const entries = ["email", "password"].reduce((_fields, key) => {
        return { ..._fields, [key]: data.get(key) };
      }, {});

      router.push(selectedTypeValue === 0 ? `/users/1` : `/business/1`);
    },
    [selectedTypeValue]
  );

  return (
    <>
      <PageHead />
      <main className={styles.main}>
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
                      [styles.toggleItemActive]: selectedTypeValue === it.value,
                    })}
                    onClick={() => setSelectedTypeValue(it.value)}
                  >
                    {it.text}
                  </span>
                );
              })}
            </div>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <input required name="email" id="email" placeholder="Email" />
              </div>
              <div className={styles.field}>
                <input
                  required
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Password"
                />
              </div>
              <div>
                <Link href="/">Don't have an account?</Link>
              </div>
            </div>

            <div className={styles.submit}>
              <button>Log In to {selectedType.text}</button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default Login;
