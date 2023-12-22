import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { Button } from "../button/Button";
import { Popup } from "./Popup";

interface Props extends React.PropsWithChildren<any> {
  visible?: boolean;
  buttonProps,
  onText,
  offText,
  popupProps?,
}

export const PopupButton: React.FC<Props> = ({
  visible,
  buttonProps,
  onText,
  offText,
  popupProps,
  children,
}) => {
  const [state, setState] = useState(false);

  useEffect(() => {
    setState(!!visible);
  }, [visible]);

  return (
    <>
      <Button {...buttonProps} onClick={() => setState((prev) => !prev)}>
        {state ? onText : offText}
      </Button>
      <Popup
        {...popupProps}
        visible={state}
        onClose={() => setState(false)}
      >
        {children}
      </Popup>
    </>
  );
};
