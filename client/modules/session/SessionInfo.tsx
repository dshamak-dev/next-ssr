import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson } from "@fortawesome/free-solid-svg-icons";
import { SessionUsers } from "./SessionUsers";

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
        <SessionUsers />
        <p className="text-base opacity-50 text-center">sit tight, relax and wait</p>
      </div>
    </div>
  );
};
