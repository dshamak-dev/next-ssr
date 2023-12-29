import { useContext, useMemo } from "react";
import { Loader } from "../loader/Loader";
import { ContestSessionContext } from "./sessionContext";
import { SessionBidForm } from "./SessionBidForm";
import { SessionState, SessionUserStageType } from "./session.model";
import { SessionBidInfo } from "./SessionBidInfo";
import { SessionLanding } from "./SessionLanding";
import { SessionAdmin } from "./SessionAdmin";
import { SessionInfo } from "./SessionInfo";
import { Button } from "../button/Button";
import Link from "next/link";
import { SessionUsers } from "./SessionUsers";
import { LinkView } from "../link/LinkView";

export const Session = () => {
  const [loading, data, dispatch, sessionError] = useContext(ContestSessionContext);

  const content = useMemo(() => {
    if (sessionError != null) {
      switch (sessionError.status) {
        case 401: {
          return <div>
            <h1>{sessionError.message}</h1>
            <LinkView href="/profile">create account</LinkView>
          </div>
        }
        case 404: {
          return <div>
            <h1>{sessionError.message}</h1>
            <LinkView href="/">home</LinkView>
          </div>
        }
        default: {
          return <h1>{sessionError.message}</h1>;
        }
      }
    }

    if (data == null) {
      return null;
    }

    const { userStage } = data as SessionState;

    switch (userStage) {
      case SessionUserStageType.Spectator: {
        return <SessionInfo />;
      }
      case SessionUserStageType.Draft: {
        return <SessionLanding />;
      }
      case SessionUserStageType.Guest: {
        return <SessionBidForm />;
      }
      case SessionUserStageType.Pending: {
        return <SessionBidInfo />;
      }
      case SessionUserStageType.Active: {
        return <SessionInfo />;
      }
      case SessionUserStageType.Failure:
      case SessionUserStageType.Success: {
        return (
          <div className="flex col gap-1">
            <h3 className="text-center uppercase">
              you {userStage === SessionUserStageType.Failure ? "Lost" : "Won"}
            </h3>
            <Link href="/">
              <Button secondary>Close</Button>
            </Link>
          </div>
        );
      }
      case SessionUserStageType.Close: {
        return <h3>no permission to access</h3>;
      }
      default: {
        return <LinkView href="/">The room is empty, go home</LinkView>;
      }
    }
  }, [data, sessionError]);

  return (
    <div className="p-1">
      {loading ? <Loader /> : null}
      {data != null ? (
        <div className="session-group">
          <div className="flex col gap-1">
            <div className="flex col gap-1">
              <LinkView href={`/session/${data.id}`} className="text-base flex gap">
                <strong>
                  {data.title} #{data.id}
                </strong>
              </LinkView>
              {data.details ? <h3>{data.details}</h3> : null}
            </div>
            <SessionUsers />
            <div>{content}</div>
          </div>
          <SessionAdmin />
        </div>
      ) : content}
      <style jsx>{`
        .session-group {
          display: grid;
          grid-template-rows: 1fr auto;
          height: 100%;
        }
      `}</style>
    </div>
  );
};
