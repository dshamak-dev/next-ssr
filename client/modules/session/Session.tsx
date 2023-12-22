import { useContext, useMemo } from "react";
import { Loader } from "../loader/Loader";
import { ContestSessionContext } from "./sessionContext";
import { SessionBidForm } from "./SessionBidForm";
import { SessionState, SessionUserStageType } from "./session.model";
import { SessionBidInfo } from "./SessionBidInfo";
import { SessionLanding } from "./SessionLanding";
import { SessionAdmin } from "./SessionAdmin";
import { SessionInfo } from "./SessionInfo";

export const Session = () => {
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  const content = useMemo(() => {
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
          <h3>you {userStage === SessionUserStageType.Failure ? "Lost" : "Won"}</h3>
        );
      }
      case SessionUserStageType.Close: {
        return <h3>no permission to access</h3>;
      }
      default: {
        return <h3>nothing here to watch</h3>;
      }
    }
  }, [data]);

  return (
    <div>
      {loading ? <Loader /> : null}
      {data != null ? (
        <div>
          <div>
            <h1>
              {data.name}#{data.id}
            </h1>
            {data.details ? <h3>{data.details}</h3> : null}
          </div>
          <div>{content}</div>
          <SessionAdmin />
        </div>
      ) : null}
    </div>
  );
};
