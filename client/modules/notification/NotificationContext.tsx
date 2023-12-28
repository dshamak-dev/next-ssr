import { createContext, useCallback, useEffect, useRef, useState } from "react";
import { INotification } from "./notification.model";

const defaultValue = [];

export const NotificationContext = createContext(defaultValue);

const eventName = "showNitification";

export const addEvent = (callback) => {
  document.addEventListener(eventName, callback);
};
export const removeEvent = (callback) => {
  document.removeEventListener(eventName, callback);
};
export const dispatchNotificationEvent = (payload) => {
  document.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: true,
      detail: payload,
    })
  );
};

export const NotificationProvider = () => {
  const ref = useRef<any>(null);
  const [notifivations, setNotifications] = useState(defaultValue);

  const handleAction = useCallback((e) => {
    const notification: INotification = e.detail;
    
    if (notification && notification.text) {
      alert(notification.text);
    }
  }, []);

  useEffect(() => {
    addEvent(handleAction);

    return () => {
      removeEvent(handleAction);
    };
  }, []);

  return (
    <NotificationContext.Provider value={notifivations}>
      <div ref={ref} className="popup-wrapper"></div>
      <style jsx>{`
        .popup-wrapper {
          position: fixed;
          top: 0;
          left: 0;
        }
      `}</style>
    </NotificationContext.Provider>
  );
};
