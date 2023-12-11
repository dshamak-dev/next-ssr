import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ProfileNavigation } from "../../modules/navigation/ProfileNavigation";
import classNames from "classnames";
import styles from "./Profile.module.scss";
import { ProfileInfoPage } from "./ProfileInfo";
import { ProfileTransactionsPage } from "./ProfileTransactions";
import { ProfileHistoryPage } from "./ProfileHistory";
import { useProfile } from "../../modules/profile/useProfile";
import { ProfileContext } from "../../modules/profile/profileContext";
import { Loader } from "../../modules/loader/Loader";
import { ProfileFormPage } from "./ProfileForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faClockRotateLeft,
  faRepeat,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

type tabType = "form" | "general" | "transaction" | "history";

const tabs: { id: tabType; label: string; icon: IconDefinition }[] = [
  {
    id: "general",
    label: "profile info",
    icon: faUser,
  },
  {
    id: "transaction",
    label: "profile transactions",
    icon: faRepeat,
  },
  {
    id: "history",
    label: "profile history",
    icon: faClockRotateLeft,
  },
];

export const ProfilePage = () => {
  const [loading, profile, signedIn] = useContext(ProfileContext);
  const [selected, setSelected] = useState<tabType | null>(null);

  const handleTabClick = useCallback((tab) => {
    setSelected(tab.id);
  }, []);

  useEffect(() => {
    if (loading || !signedIn) {
      return;
    }

    setSelected(profile == null ? "form" : tabs[0].id);
  }, [loading, profile, signedIn]);

  const content = useMemo(() => {
    switch (selected) {
      case "form": {
        return <ProfileFormPage />;
      }
      case "general": {
        return <ProfileInfoPage />;
      }
      case "transaction": {
        return <ProfileTransactionsPage />;
      }
      case "history": {
        return <ProfileHistoryPage />;
      }
      default: {
        return null;
      }
    }
  }, [selected]);

  return (
    <main className={styles.page}>
      <ProfileNavigation backUrl="/" />
      <div>{loading ? <Loader /> : content}</div>
      {profile ? (
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const active = tab.id === selected;

            return (
              <div
                key={tab.id}
                id={tab.id}
                className={classNames(styles.tab, {
                  [styles.tab_active]: active,
                })}
                onClick={() => handleTabClick(tab)}
              >
                <FontAwesomeIcon icon={tab.icon} />
              </div>
            );
          })}
        </div>
      ) : null}
    </main>
  );
};

export default ProfilePage;
