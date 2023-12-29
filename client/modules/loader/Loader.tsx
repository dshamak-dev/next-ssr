import React, { PropsWithChildren } from "react";
import styles from "./Loader.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch, faSpinner } from "@fortawesome/free-solid-svg-icons";

export const Loader: React.FC<PropsWithChildren> = () => {
  return (
    <div className={styles.loader} title="loading..">
      <FontAwesomeIcon icon={faSpinner} className={styles.icon} />
    </div>
  );
};
