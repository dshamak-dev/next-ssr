import React, { useEffect, useRef, useState } from "react";
import { Button } from "../button/Button";
import { Popup } from "./Popup";

interface Props extends React.PropsWithChildren<any> {
  visible?: boolean;
  buttonProps?;
  onText;
  offText;
  closeEvents?: string[];
  popupProps?;
}

export const PopupButton: React.FC<Props> = ({
  visible,
  buttonProps,
  onText,
  offText,
  popupProps,
  children,
  closeEvents = [],
}) => {
  const ref = useRef<any>(null);
  const [state, setState] = useState(false);

  useEffect(() => {
    setState(!!visible);
  }, [visible]);

  useEffect(() => {
    if (!state || !ref?.current || !closeEvents) {
      return;
    }

    const onCloseEvent = () => {
      setState(false);
    };

    closeEvents.forEach((eventName) => {
      ref.current.addEventListener(eventName, onCloseEvent);
    });

    return () => {
      if (ref.current) {
        closeEvents.forEach((eventName) => {
          ref.current.removeEventListener(eventName, onCloseEvent);
        });
      }
    };
  }, [state, ref?.current, closeEvents]);

  return (
    <>
      <Button {...buttonProps} onClick={() => setState((prev) => !prev)}>
        {state ? onText : offText}
      </Button>
      <Popup
        ref={ref}
        {...popupProps}
        visible={state}
        onClose={() => setState(false)}
      >
        {children}
      </Popup>
    </>
  );
};
