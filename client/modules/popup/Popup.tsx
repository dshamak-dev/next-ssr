import classNames from "classnames";
import React, { forwardRef } from "react";
import styles from "./Popup.module.scss";

interface Props extends React.PropsWithChildren<any> {
  onClose?: () => void;
  visible?: boolean;
}

export const Popup: React.FC<Props> = forwardRef<any, Props>(({
  visible = false,
  onClose,
  className,
  children,
  ...other
}, ref) => {
  if (!visible) {
    return null;
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handlePrevent = (e) => {
    e.stopPropagation();
  };

  return (
    <div
      {...other}
      ref={ref}
      className={classNames(styles.popup, className)}
      onClick={handleClose}
    >
      <div className={classNames(styles.content)} onClick={handlePrevent}>
        {children}
      </div>
    </div>
  );
});
