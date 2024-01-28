import React, { useCallback } from "react";
import { Button as Button } from "../../modules/button/Button";
import { LinkView as Link } from "../../modules/link/LinkView";
import styles from "./Signin.module.scss";
import classNames from "classnames";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";

export const SignInPage = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleContinue = useCallback(() => {
    router.push('/profile');
  }, []);

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
              <Link
                  href="/signin"
                  aria-label="github"
                  className={styles.social_link}
                  onClick={() => signIn('google', { redirect: true })}
                ><img src="/google-icon.png" alt="google" className="invert" /></Link>
                <Link
                  href="/signin"
                  aria-label="github"
                  className={styles.social_link}
                  onClick={() => signIn('github', { redirect: true })}
                ><img src="/github-icon.png" alt="github" className="invert" /></Link>
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
