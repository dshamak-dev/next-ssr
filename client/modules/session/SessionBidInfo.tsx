import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPerson } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../button/Button";
import { removeSessionBid } from "./session.api";

export const SessionBidInfo = () => {
  const [_, profile] = useContext(ProfileContext);
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  if (data == null) {
    return null;
  }

  const { options, users } = data;

  const readyNum = useMemo(
    () => users.filter(({ ready }) => ready).length,
    [users]
  );

  const selection = useMemo(() => {
    const { optionId, value } = users.filter(({ id }) => {
      return id === profile.id;
    })[0];

    const option = options.filter(({ id }) => id == optionId)[0];

    return {
      value,
      ...option,
    };
  }, [users]);

  const handleRemoveBig = async () => {
    const state = await removeSessionBid(data.id, profile.id);

    if (state && !state.error) {
      dispatch(state);
    }
  };

  return selection != null ? (
    <div>
      <div>
        <h2>{selection.value}</h2>
        <p>
          Your bid for <strong>"{selection.text}"</strong>
        </p>
      </div>
      <div className="flex gap-1">
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
      <div><Button secondary onClick={handleRemoveBig}>Remove Bid</Button></div>
    </div>
  ) : null;
};
