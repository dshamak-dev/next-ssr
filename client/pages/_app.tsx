import { ErrorBoundary } from "../ErrorBoundary";
import { SessionProvider } from "next-auth/react";

import { dom, config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

dom.watch();

import "../support/global.style.css";
import { ProfileProvider } from "../modules/profile/profileContext";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ErrorBoundary>
        <ProfileProvider>
          <Component {...pageProps} />
        </ProfileProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
}
