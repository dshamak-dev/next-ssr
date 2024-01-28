import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPerson } from "@fortawesome/free-solid-svg-icons";
import { SessionUsers } from "./SessionUsers";

export const SessionInfo = () => {
  return (
    <div>
      <div className="flex col gap-1">
        <p className="text-base opacity-50 text-center">sit tight, relax and wait for results</p>
      </div>
    </div>
  );
};
