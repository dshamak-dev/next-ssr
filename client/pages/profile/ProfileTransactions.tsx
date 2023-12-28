import React, { useContext, useMemo } from "react";
import { ProfileContext } from "../../modules/profile/profileContext";

interface Props {}

export const ProfileTransactionsPage: React.FC<Props> = ({}) => {
  const [loading, data, logged, dispatch] = useContext(ProfileContext);

  const transactions = useMemo(() => {
    return data?.transactions || [];
  }, [data?.transaction]);

  return (
    <div className="flex w-full col gap-1 text-xs p-1">
      {transactions.length
        ? transactions.map((it) => {
            const label = it.title || it.source;
            // const dateLabel = it.createdAt
            //   ? new Date(it.createdAt).toLocaleDateString("us", {
            //       year: "2-digit",
            //       month: "short",
            //       day: "numeric",
            //     })
            //   : null;

            return (
              <div
                key={it.id}
                className="transaction-item flex items-center between w-full"
              >
                <span className="opacity-50">{label || "anonym"}</span>
                {/* <span className="opacity-50 text-center">{dateLabel}</span> */}
                <span className="text-right">{it.value}</span>
              </div>
            );
          })
        : "no transactions"}
      <style jsx>{`
        .transaction-item {
          display: grid;
          grid-template-columns: 1fr  auto;
          gap: 1rem;
        }
      `}</style>
    </div>
  );
};

export default ProfileTransactionsPage;
