import React, { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPerson } from "@fortawesome/free-solid-svg-icons";

export const SessionUsers: React.FC = () => {
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  const { users } = data;

  const readyNum = useMemo(
    () => users.filter(({ ready }) => ready).length,
    [users]
  );

  return (
    <div className="flex gap-1 justify-center">
      <span className="flex gap-1">
        <FontAwesomeIcon icon={faCheck} />
        {readyNum}
      </span>
      <span>/</span>
      <span className="flex gap-1">
        {users.length}
        <FontAwesomeIcon icon={faPerson} />
      </span>
    </div>
  );
};
