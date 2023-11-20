import { useState } from "react";
import { useApi } from "../support/useApi.js";

export default function SessionUser({ session, user }) {
  // const [busy, setBusy] = useState(false);

  if (!user?.id) {
    return null;
  }

  return (
    <>
      <div className="session-user">
        <span>{user?.name}</span>
        <span>{user?.status || "pending"}</span>
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
        }
      `}</style>
    </>
  );
}
