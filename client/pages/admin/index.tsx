import React, { useContext, useMemo } from "react";
import { ProfileContext } from "../../modules/profile/profileContext";
import { Loader } from "../../modules/loader/Loader";
import { VoucherAdminSection } from "../../modules/voucher/VoucherAdminSection";
import { ProfileNavigation } from "../../modules/navigation/ProfileNavigation";

export default function AdminPage() {
  const [loadingProfile, profile] = useContext(ProfileContext);

  const content = useMemo(() => {
    if (!profile) {
      return null;
    }

    if (!profile.admin) {
      return <p>no permission</p>;
    }

    return (
      <div className="flex col gap-2 text-xs">
        <h1>Admin Page</h1>
        <VoucherAdminSection />
      </div>
    );
  }, [profile]);

  return (
    <div>
      <ProfileNavigation backUrl="/" />
      <div className="p-1">
        {loadingProfile ? <Loader /> : null}
        {content}
      </div>
    </div>
  );
}
