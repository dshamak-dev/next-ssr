import React, {
  ReactElement,
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
import { ProfileContext } from "../../modules/profile/profileContext";
import { Loader } from "../../modules/loader/Loader";
import { ProfileFormPage } from "./ProfileForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faClockRotateLeft,
  faRepeat,
  faSackDollar,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { ProfileAssets } from "../../modules/profile/ProfileAssets";

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
    icon: faSackDollar,
  },
  {
    id: "history",
    label: "profile history",
    icon: faClockRotateLeft,
  },
];

export const ProfilePage = () => {
  const [loading, profile, signedIn, dispatch, syncProfile] =
    useContext(ProfileContext);
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

  useEffect(() => {
    syncProfile();
  }, []);

  const content = useMemo(() => {
    let renderer = (): ReactElement | null => null;
    let addAssetsController = false;

    switch (selected) {
      case "form": {
        renderer = () => <ProfileFormPage />;
        break;
      }
      case "general": {
        addAssetsController = true;
        renderer = () => <ProfileInfoPage />;
        break;
      }
      case "transaction": {
        addAssetsController = true;
        renderer = () => <ProfileTransactionsPage />;
        break;
      }
      case "history": {
        addAssetsController = true;
        renderer = () => <ProfileHistoryPage />;
        break;
      }
    }

    if (addAssetsController) {
      return <>
        <div className="p-1"><ProfileAssets /></div>
        <div className={styles.contentScroll}>{renderer()}</div>
      </>;
    }

    return renderer();
  }, [selected]);

  return (
    <main className={styles.page}>
      <ProfileNavigation backUrl="/" />
      <div className={styles.content}>{loading ? <Loader /> : content}</div>
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
