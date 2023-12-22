import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson } from "@fortawesome/free-solid-svg-icons";

export const SessionInfo = () => {
  const [_, profile] = useContext(ProfileContext);
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  if (data == null) {
    return null;
  }

  const { options, users } = data;

  return (
    <div>
      <div className="flex col gap-1">
        <span className="flex gap-1">
          {users.length}
          <FontAwesomeIcon icon={faPerson} />
        </span>
        <h3>sit tight, relax and wait</h3>
      </div>
    </div>
  );
};
