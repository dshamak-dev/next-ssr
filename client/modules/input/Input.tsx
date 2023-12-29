import React from "react";
import "./input.css";
import classNames from "classnames";

export interface InputProps {
  id: string;
  label?: string;
  type: string;
  className?: string;
  inputProps?: Record<string, string | number | boolean | Function>;
  onChange?: (e) => void;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  type = "text",
  inputProps,
  className,
  ...other
}) => {
  return (
    <div className={classNames("input-container", className)} title={label}>
      <input
        type={type}
        placeholder={`Enter ${type}`}
        {...inputProps}
        {...other}
        id={id}
        className="input-field"
      />
    </div>
  );
};
