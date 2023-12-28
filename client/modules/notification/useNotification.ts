import { useCallback, useMemo } from "react";
import { dispatchNotificationEvent } from "./NotificationContext";
import { INotification } from "./notification.model";

export const useNotification = () => {
  const handleShow = useCallback((payload: string | INotification) => {
    const notification =
      typeof payload === "string"
        ? {
            text: payload,
          }
        : payload;

    dispatchNotificationEvent(notification);
  }, []);
  const handleClose = useCallback(() => {}, []);

  const controls = useMemo(() => {
    return {
      show: handleShow,
      close: handleClose,
    };
  }, [handleShow, handleClose]);

  return controls;
};
