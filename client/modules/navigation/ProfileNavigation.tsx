import React, { useContext, useMemo } from "react";
import { LinkView } from "../link/LinkView";
import { useAuth } from "../auth/useAuth";
import { ProfileContext } from "../profile/profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeftLong,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import { Loader } from "../loader/Loader";

export const ProfileNavigation = ({ backUrl }) => {
  const { user, signOut } = useAuth();
  const [loading, profile] = useContext(ProfileContext);

  const displayName = useMemo(() => {
    return profile?.displayName || user?.displayName || null;
  }, [user, profile]);

  return (
    <>
      <nav className="flex items-center between">
        <div className="flex items-center grow-1">
          {backUrl ? (
            <LinkView href={backUrl}>
              <FontAwesomeIcon icon={faArrowLeftLong} />
            </LinkView>
          ) : null}
        </div>
        {displayName ? (
          <>
            <div className="flex items-center grow-1">
              {loading ? (
                <Loader />
              ) : (
                <LinkView href="/profile">{displayName}</LinkView>
              )}
            </div>
            <div onClick={() => signOut()}>
              <FontAwesomeIcon icon={faRightFromBracket} />
            </div>
          </>
        ) : null}
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
