import React, { useCallback, useContext, useReducer, useState } from "react";
import { Button } from "../button/Button";
import { ProfileContext } from "./profileContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat, faTimes } from "@fortawesome/free-solid-svg-icons";
import { ProfileTransactionForm } from "./ProfileTransactionForm";
import classNames from "classnames";

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
    <>
      {visible ? <div className="profile-transaction_overlay" onClick={() => handleToggle(false)}></div> : null}
      <div
        className={classNames("relative z-1 profile-transaction flex col items-center", {
          active: visible,
        })}
      >
        <div className="flex col items-center">
          <h2 className="text-xl">{loading ? "-" : profile?.assets || 0}</h2>
          <label className="text-xs text-black">assets</label>
        </div>
        <Button
          onClick={() => handleToggle()}
          secondary
          className="toggle-button"
          style={{
            width: "2rem",
            height: "2rem",
            padding: "0",
            position: "absolute",
            bottom: "-1rem",
            zIndex: 1,
            color: visible ? "var(--red)" : undefined,
          }}
        >
          <FontAwesomeIcon icon={visible ? faTimes : faRepeat} />
        </Button>
        {visible ? (
          <div className="profile-transaction_form-cover">
            <ProfileTransactionForm onClose={() => handleToggle(false)} />
          </div>
        ) : null}
      </div>
      <style jsx>{`
        .profile-transaction_overlay {
          top: 0;
          left: 0;
          position: fixed;
          width: 100%;
          height: 100%;
          background-color: var(--green);
          opacity: 0.4;
          z-index: 0;
        }

        .profile-transaction {
          position: relative;
          width: 100%;
          margin: 0 auto;
          padding: 1rem 1rem 1.5rem;
          background-color: var(--green);
          border-radius: 2rem;
          color: var(--white);
          z-index: 1;
        }

        .profile-transaction.active {
          border-radius: 2rem 2rem 0 0;
        }

        .profile-transaction_form-cover {
          position: absolute;
          top: calc(100% - 1px);
          width: 100%;
          padding: 1.5rem 1rem 1rem;
          background-color: var(--green);
          border-radius: 0 0 2rem 2rem;
        }
      `}</style>
    </>
  );
};
