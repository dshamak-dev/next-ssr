import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { Button } from "../button/Button";
import { joinSessionBid } from "./session.api";

export const SessionLanding = () => {
  const [_, profile] = useContext(ProfileContext);
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  if (data == null) {
    return null;
  }

  const handleJoin = async () => {
    const state = await joinSessionBid(data.id, profile.id);

    if (state && !state.error) {
      dispatch(state);
    }
  };

  return (
    <div className="flex col gap-1">
      <div>
        <Button secondary onClick={handleJoin}>
          Join Session
        </Button>
      </div>
    </div>
  );
};
