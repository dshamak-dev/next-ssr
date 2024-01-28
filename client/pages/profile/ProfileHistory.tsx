import React, { useContext, useMemo } from "react";
import { ProfileContext } from "../../modules/profile/profileContext";
import { getProfileHistory } from "../../modules/profile/profile.api";
import { useApi } from "../../support/useApi";
import { Loader } from "../../modules/loader/Loader";
import Link from "next/link";

interface Props {}

export const ProfileHistoryPage: React.FC<Props> = ({}) => {
  const [loading, profile, logged, dispatch] = useContext(ProfileContext);
  const [loadingHistory, historyData, requestHistory] = useApi(
    () => getProfileHistory(profile?.id),
    [],
    profile?.id != null
  );

  const list = useMemo(() => {
    return historyData || [];
  }, [loadingHistory, historyData]);

  return (
    <div className="flex w-full col gap-1 text-xs p-1">
      {loadingHistory ? (
        <Loader />
      ) : list.length ? (
        list.map((it) => {
          const dateLabel = it.updatedAt
            ? new Date(it.updatedAt).toLocaleDateString()
            : null;

          return (
            <div key={it.id} className="flex items-center between w-full">
              <Link href={it.url}>{it.title || `#${it.id}`}</Link>
              <span>{dateLabel}</span>
            </div>
          );
        })
      ) : (
        "no history"
      )}
    </div>
  );
};

export default ProfileHistoryPage;
