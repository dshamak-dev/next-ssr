import React, { useContext, useMemo } from "react";
import { ProfileContext } from "../../modules/profile/profileContext";

interface Props {}

export const ProfileTransactionsPage: React.FC<Props> = ({}) => {
  const [loading, data, logged, dispatch] = useContext(ProfileContext);

  const transactions = useMemo(() => {
    return data?.transactions || [];
  }, [data?.transaction]);

  return (
    <div className="flex w-full col gap-1">
      {transactions.length
        ? transactions.map((it) => {
            const label = it.title || it.source;

            return (
              <div key={it.id} className="flex items-center between w-full">
                <span>{label || "anonym"}</span>
                <span>{it.value}</span>
              </div>
            );
          })
        : "no transactions"}
    </div>
  );
};

export default ProfileTransactionsPage;