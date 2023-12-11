import React from "react";
import './input.css';

export const Input: React.FC<any> = ({ label, id, type="text", ...props }) => {
  return (
    <div className="input_container">
      <input
        type={type}
        placeholder={`Enter ${type}`}
        {...props}
        id={id}
        className="input-field"
      />
      {label ? (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      ) : null}
      <span className="input-highlight"></span>
    </div>
  );
};
