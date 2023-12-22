import React, { useContext, useMemo } from "react";
import { ProfileAssets } from "../../modules/profile/ProfileAssets";
import { ProfileContext } from "../../modules/profile/profileContext";

interface Props {}

export const ProfileTransactionsPage: React.FC<Props> = ({}) => {
  const [loading, data, logged, dispatch] = useContext(ProfileContext);

  const transactions = useMemo(() => {
    return data?.transactions || [];
  }, [data?.transaction]);

  return (
    <article>
      <ProfileAssets />
      <div className="flex w-full col gap-1">
        {transactions.length
          ? transactions.map((it) => {
            const label = it.type ? it.type : it.source;

              return (
                <div key={it.id} className="flex items-center between w-full">
                  <span>{label || 'anonym'}</span>
                  <span>{it.value}</span>
                </div>
              );
            })
          : "no transactions"}
      </div>
    </article>
  );
};
