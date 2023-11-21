import Link from "next/link.js";
import { useApi } from "../support/useApi.js";
import { useAuth } from "../support/useAuth.js";
import { getEnvironmentProps } from "../support/env.utils.js";
import { getUserBalance } from "../api/user.api.js";
import { useEffect } from "react";

export default function AccountHeader({ apiDomain }) {
  const { logged, user, login } = useAuth();
  const [loading, balance, error, request] = useApi((userId) => getUserBalance(apiDomain, userId));

  useEffect(() => {
    if (user != null) {
      request(user.id);
    }
  }, [user]);

  return (
    <>
      {logged && user != null ? (
        <>
          <Link href={`/users/${user.id}`} className="field">{user.name || user.email}</Link>
          <span className="field">
            balance: <span>{loading ? '-' : balance || 0}</span>
          </span>
        </>
      ) : (
        <a onClick={login}>login</a>
      )}
      <style jsx>{`
        .info,
        .field {
          display: flex;
          align-items: center;
          justify-contet: space-between;
          gap: 2rem;
        }
        .field {
          gap: 0.5rem;
        }
      `}</style>
    </>
  );
}
