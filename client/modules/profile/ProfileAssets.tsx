import React, { useCallback, useContext, useReducer, useState } from "react";
import { ButtonView } from "../button/ButtonView";
import { ProfileContext } from "./profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";
import { ProfileTransactionForm } from "./ProfileTransactionForm";

interface State {
  pending: boolean;
  visible: boolean;
}

const reducer = (prev, action): State => {
  const _next = Object.assign({}, prev, { [action.type]: action.value });

  return _next;
};

export const ProfileAssets: React.FC<{}> = ({}) => {
  const [loading, profile] = useContext(ProfileContext);
  const [{ pending, visible }, dispatch] = useReducer(reducer, {
    pending: false,
    visible: false,
  });

  const handleToggle = (force: boolean | undefined = undefined) => {
    dispatch({
      type: "visible",
      value: force !== undefined ? force : !visible,
    });
  };

  return (
    <div className="flex col items-center">
      <h2>{loading ? "-" : profile?.assets || 0}</h2>
      <label>assets</label>
      <ButtonView onClick={() => handleToggle()}>
        <FontAwesomeIcon icon={faRepeat} />
      </ButtonView>
      {visible ? (
        <div>
          <ProfileTransactionForm onClose={() => handleToggle(false)} />
        </div>
      ) : null}
    </div>
  );
};
