import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./input.css";

export const Select = ({ options, inputProps, ...props }) => {
  return (
    <>
      <div className="input-container">
        <select className="input-field" {...inputProps} {...props}>
          <option disabled value="">Select Option</option>
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
    </>
  );
};
