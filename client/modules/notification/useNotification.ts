import { useCallback, useMemo } from "react";
import { ToasterType, showToaster } from "./NotificationProvider";

export const useNotification = () => {
  const handleShow = useCallback((type: ToasterType, content, props = null) => {
    showToaster(type, content, props);
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
