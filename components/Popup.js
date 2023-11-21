import classNames from "classnames";
import { useCallback } from "react";

export const Popup = ({ visible, children, onClose }) => {
  const handleClick = useCallback((ev) => {
    ev.stopPropagation();
  }, []);

  const handleClose = useCallback((ev) => {
    onClose(ev);
  }, [onClose]);

  return (
    <>
      {visible ? (
        <div onClick={handleClose} className={classNames("popup-overlay", { visible })}>
          <div className="popup-content" onClick={handleClick}>{children}</div>
        </div>
      ) : null}
      <style jsx>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          z-index: 10;

          box-sizing: border-box;
          width: 100vw;
          height: 100vh;
          height: 100dvh;

          padding: 1rem;

          display: flex;
          align-items: center;
          justify-content: center;

          background-color: rgba(0, 0, 0, 0.5);
        }
        .popup-content {
          width: 100%;
          max-width: 640px;

          padding: 1rem;
          box-sizing: border-box;

          background-color: white;
        }
      `}</style>
    </>
  );
}
