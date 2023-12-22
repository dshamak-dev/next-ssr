import React, { useContext, useMemo } from "react";
import { ProfileAssets } from "../../modules/profile/ProfileAssets";
import { ProfileContext } from "../../modules/profile/profileContext";
import { getProfileHistory } from "../../modules/profile/profile.api";
import { useApi } from "../../support/useApi";
import { Loader } from "../../modules/loader/Loader";
import Link from "next/link";

interface Props {}

export const ProfileHistoryPage: React.FC<Props> = ({}) => {
  const [loading, data, logged, dispatch] = useContext(ProfileContext);
  const [loadingHistory, history, requestHistory] = useApi(
    () => getProfileHistory(data?.id).then(res => res?.json()),
    [],
    true
  );

  const list = useMemo(() => {
    return history || [];
  }, [history]);

  return (
    <article>
      <ProfileAssets />
      <div className="flex w-full col gap-1">
        {loadingHistory ? <Loader /> : null}
        {list.length
          ? list.map((it) => {
              return (
                <div key={it.id} className="flex items-center between w-full">
                  <Link href={`/session/${it.id}`}>{it.name}#{it.id}</Link>
                </div>
              );
            })
          : "no history"}
      </div>
    </article>
  );
};
