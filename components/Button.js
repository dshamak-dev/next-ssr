import classNames from "classnames";
import { useCallback } from "react";

export default function Button({
  className = "",
  primary = false,
  disabled = false,
  onClick,
  ...other
}) {
  const handleClick = useCallback(
    (ev) => {
      if (disabled || !onClick) {
        return;
      }

      onClick(ev);
    },
    [disabled, onClick]
  );

  return (
    <>
      <button
        {...other}
        onClick={handleClick}
        className={classNames(className, "button", { primary })}
      ></button>
      <style jsx>{`
        .button {
          width: 100%;
          padding: 0.5rem 2rem;
          background-color: transparent;
          border: 1px solid #2d2d2d;
          color: #2d2d2d;
          cursor: pointer;
          text-align: center;
        }
        .button.primary {
          background-color: #2d2d2d;
          color: #fff;
        }
      `}</style>
    </>
  );
}
