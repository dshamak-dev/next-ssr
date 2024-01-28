import React, { useMemo } from "react";
import "./input.css";
import classNames from "classnames";

export interface InputProps {
  id?: string;
  label?: string;
  type: string;
  className?: string;
  inputProps?: Record<string, string | number | boolean | Function>;
  onChange?: (e) => void;
  required?: boolean;
  hint?: string | null;
}

export const Input: React.FC<InputProps> = ({
  label,
  id,
  type = "text",
  inputProps,
  className,
  hint,
  ...other
}) => {
  const isRequired = useMemo(() => {
    return !!inputProps?.required || !!other?.required;
  }, [inputProps, other]);

  return (
    <div>
      {label ? (
        <label htmlFor={id} className="input-label flex gap">
          {label}
          {isRequired ? (
            <span className="required-mark text-red">*</span>
          ) : null}
        </label>
      ) : null}
      <div
        className={classNames("input-container", className)}
        data-hint={hint}
        title={label}
      >
        <input
          type={type}
          placeholder={`Enter ${type}`}
          {...inputProps}
          {...other}
          id={id}
          className="input-field"
        />
      </div>
    </div>
  );
};
