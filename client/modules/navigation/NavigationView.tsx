import React, { useMemo } from "react";
import { LinkView } from "../link/LinkView";
import { signOut, useSession } from "next-auth/react";

export const NavigationView = ({ backUrl }) => {
  const { data } = useSession();

  const userInfo = useMemo(() => {
    if (!data?.user) {
      return null;
    }

    return data.user.email || data.user.name;
  }, [data?.user]);

  return (
   <>
    <nav className="flex items-center between">
      <div className="flex items-center grow-1">
        {backUrl ? (
          <LinkView href={backUrl}>
            <img src="/back-arrow.png" className="invert back-button" />
          </LinkView>
        ) : null}
      </div>
      <div className="flex items-center gap-1">
        {userInfo ? (
          <>
            <LinkView href="/profile">{userInfo}</LinkView>
            <div onClick={() => signOut()}>
              <img
                src="/signout-icon.png"
                className="signout-button invert"
              />
            </div>
          </>
        ) : null}
      </div>
    </nav>
    <style jsx>{`
      nav {
        position: sticky;
        top: 0;
        left: 0;
      }

      .back-button {
        width: 0.9rem;
      }

      .signout-button {
        width: 0.75rem;
      }
    `}</style>
    </>
  );
};
