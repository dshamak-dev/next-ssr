import { useMemo, useState } from "react";
import { useApi } from "../support/useApi.js";
import Button from "./Button.js";
import classNames from "classnames";

export default function SessionUser({ active, canKick, user }) {
  if (!user?.id) {
    return null;
  }

  return (
    <>
      <div className={classNames("session-user", { active })}>
        <span className={classNames({ 'bold': active })}>{active ? 'YOU' : user?.name}</span>
        <span className="flex gap-1">
          <span>{user?.status || "pending"}</span>
          {user?.bid ? <span>bid: {user.bid}</span> : null}
        </span>
        {/* {canKick ? <Button className="w-fit">kick</Button> : null} */}
      </div>
      <style jsx>{`
        .session-user {
          display: flex;
          width: 100%;
          justify-content: space-between;
          align-items: center;

          padding: 1rem;

          background-color: white;

          box-sizing: border-box;

          &.active {
            border: 1px solid black;
          }
        }
      `}</style>
    </>
  );
}
