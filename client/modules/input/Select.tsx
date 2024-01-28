import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./input.css";
import { useMemo } from "react";

export const Select = ({
  options,
  label,
  placeholder,
  inputProps,
  id,
  ...props
}) => {
  const isRequired = useMemo(() => {
    return !!inputProps?.required || !!props?.required;
  }, [inputProps, props]);

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
      <div className="input-container">
        <select className="input-field" id={id} {...inputProps} {...props}>
          <option disabled value="">
            {placeholder || "Select Option"}
          </option>
          {options.map(({ id, text }) => {
            return (
              <option key={id} value={id}>
                {text}
              </option>
            );
          })}
        </select>
        <FontAwesomeIcon icon={faAngleDown} className="input-control-icon" />
      </div>
    </div>
  );
};
