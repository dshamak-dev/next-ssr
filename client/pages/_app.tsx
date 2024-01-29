import { ErrorBoundary } from "../ErrorBoundary";
import { SessionProvider } from "next-auth/react";

import { dom, config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

config.autoAddCss = false;

dom.watch();

import "../styles/global.style.css";
import { ProfileProvider } from "../modules/profile/profileContext";
import { NotificationProvider } from "../modules/notification/NotificationProvider";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ErrorBoundary>
        <ProfileProvider>
          <NotificationProvider />
          <Component {...pageProps} />
        </ProfileProvider>
      </ErrorBoundary>
    </SessionProvider>
  );
}
