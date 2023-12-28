import React, { useContext, useMemo } from "react";
import { Loader } from "../../modules/loader/Loader";
import { Label } from "../../modules/label/Label";
import { ProfileContext } from "../../modules/profile/profileContext";

interface Props {}

export const ProfileInfoPage: React.FC<Props> = ({}) => {
  const [loading, profile] = useContext(ProfileContext);

  const profileContent = useMemo(() => {
    if (!profile) {
      return "no data found";
    }

    return (
      <div className="flex col gap-1 text-xs">
        <Label text="name" value={profile.displayName} className="" />
        <Label text="email" value={profile.email} />
      </div>
    );
  }, [profile]);

  if (loading) {
    return <Loader />;
  }

  return <article>{profileContent}</article>;
};

export default ProfileInfoPage;