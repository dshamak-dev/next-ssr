import { ErrorBoundary } from "../ErrorBoundary";
import { SessionProvider } from "next-auth/react";
import "../support/global.style.css";

export default function MyApp({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ErrorBoundary>
        <Component {...pageProps} />
      </ErrorBoundary>
    </SessionProvider>
  );
}
