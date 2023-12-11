import React, { useContext, useMemo } from "react";
import { ProfileAssets } from "../../modules/profile/ProfileAssets";
import { ProfileContext } from "../../modules/profile/profileContext";

interface Props {}

export const ProfileHistoryPage: React.FC<Props> = ({}) => {
  const [loading, data, logged, dispatch] = useContext(ProfileContext);

  const list = useMemo(() => {
    return data?.histroy || [];
  }, [data?.histroy]);

  return (
    <article>
      <ProfileAssets />
      <div className="flex w-full col gap-1">
        {list.length
          ? list.map((it) => {
              return (
                <div key={it.id} className="flex items-center between w-full">
                  <span>{it.type}</span>
                  <span>{it.value}</span>
                </div>
              );
            })
          : "no history"}
      </div>
    </article>
  );
};
