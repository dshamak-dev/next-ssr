import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { useAuth } from "../../modules/auth/useAuth";
import { getProfile } from "../../modules/profile/profile.api";
import { waitFor } from "../../api/api.model";
import { Loader } from "../../modules/loader/Loader";
import { Label } from "../../modules/label/Label";
import { ProfileContext } from "../../modules/profile/profileContext";
import { ProfileAssets } from "../../modules/profile/ProfileAssets";

interface Props {}

export const ProfileInfoPage: React.FC<Props> = ({}) => {
  const [loading, profile] = useContext(ProfileContext);

  const profileContent = useMemo(() => {
    if (!profile) {
      return "no data found";
    }

    return (
      <div>
        <ProfileAssets />
        <div className="flex col gap-1">
          <Label text="name" value={profile.displayName} />
          <Label text="email" value={profile.email} />
          <Label text="intergration" value="coming soon" />
        </div>
      </div>
    );
  }, [profile]);

  if (loading) {
    return <Loader />;
  }

  return <article>{profileContent}</article>;
};
