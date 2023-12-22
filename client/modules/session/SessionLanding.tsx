import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../button/Button";
import { joinSessionBid } from "./session.api";

export const SessionLanding = () => {
  const [_, profile] = useContext(ProfileContext);
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  if (data == null) {
    return null;
  }

  const { options, users } = data;

  const handleJoin = async () => {
    const state = await joinSessionBid(data.id, profile.id);

    if (state && !state.error) {
      dispatch(state);
    }
  };

  return (
    <div>
      <div className="flex gap-1">
        <span className="flex gap-1">
          {users.length}
          <FontAwesomeIcon icon={faPerson} />
        </span>
      </div>
      <div>
        <Button secondary onClick={handleJoin}>
          Join Session
        </Button>
      </div>
    </div>
  );
};
