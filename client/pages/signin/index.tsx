import React, { useCallback, useEffect, useState } from "react";
import { ButtonView as Button } from "../../modules/button/ButtonView";
import { LinkView as Link } from "../../modules/link/LinkView";
import styles from "./Signin.module.scss";
import classNames from "classnames";
import { useSession, signIn, signOut } from "next-auth/react";

export const SignInPage = () => {
  const { data: session } = useSession();

  const handleContinue = useCallback(() => {}, []);

  useEffect(() => {
    console.log({session});
  }, [session]);

  return (
    <main className={classNames(styles.page, "flex col gap-3 between")}>
      <div className={styles.back_button}>
        <Link href="/">
          <img className={styles.back_button_icon} src="/back-arrow.png" />
        </Link>
      </div>
      <div className="flex justify-center items-center grow-1">
        <div className={styles.content}>
          <div className={classNames(styles.form, "flex col gap-2")}>
            {session?.user ? (
              <>
                <div className="flex col items-center">
                  <Button onClick={handleContinue}>Continue as {session.user.email || session.user.name}</Button>
                </div>
              </>
            ) : null}
            <div className="flex col items-center">
              <label>Sign in with</label>
              <div className="social-list flex gap-1 justify-center items-center">
                {/* <Link
                  href="/signin"
                  aria-label="google"
                  className={styles.social_link}
                  onClick={() => signIn('google')}
                >
                  g
                </Link> */}
                <Link
                  href="/signin"
                  aria-label="github"
                  className={styles.social_link}
                  onClick={() => signIn('github', { redirect: true })}
                ><img src="/github-icon.png" alt="github" className="invert" /></Link>
                {/* <Link
                  href="/signin"
                  aria-label="instagram"
                  className={styles.social_link}
                >
                  i
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer flex justify-center">
        <img className={styles.logo} src="/logo.png" />
      </div>
    </main>
  );
};

export default SignInPage;
