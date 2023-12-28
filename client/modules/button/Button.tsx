import classNames from "classnames";
import React from "react";
import styles from "./Button.module.scss";

interface Props extends React.PropsWithChildren<any> {}

export const Button: React.FC<Props> = ({
  className,
  primary,
  secondary,
  ...other
}) => {
  return (
    <button
      {...other}
      className={classNames(styles.button, 'pointer select-none', className, { [styles.primary]: primary, [styles.secondary]: secondary })}
    ></button>
  );
};
