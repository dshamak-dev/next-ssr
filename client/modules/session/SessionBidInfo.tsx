import { useContext, useMemo } from "react";
import { ContestSessionContext } from "./sessionContext";
import { ProfileContext } from "../profile/profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPerson } from "@fortawesome/free-solid-svg-icons";
import { Button } from "../button/Button";
import { removeSessionBid } from "./session.api";
import { SessionUsers } from "./SessionUsers";

export const SessionBidInfo = () => {
  const [_, profile] = useContext(ProfileContext);
  const [loading, data, dispatch] = useContext(ContestSessionContext);

  if (data == null) {
    return null;
  }

  const { options, users } = data;

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
    <div className="flex col gap-1">
      <p className="flex gap-1 align-bottom justify-center">
        <span>You set</span> <h2>{selection.value}</h2> <span>on</span>{" "}
        <strong>"{selection.text}"</strong>
      </p>
      <SessionUsers />

      <p className="text-center opacity-50">waiting for start</p>

      <div>
        <Button secondary onClick={handleRemoveBig}>
          Remove Bid
        </Button>
      </div>
    </div>
  ) : null;
};
