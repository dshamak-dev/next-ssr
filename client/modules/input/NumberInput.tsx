import React, { useCallback } from "react";
import { Input, InputProps } from "./Input";

interface Props extends InputProps {}

export const NumberInput: React.FC<Props> = ({ onChange, ...props }) => {
  const handleChange = useCallback(
    (e) => {
      if (onChange) {
        onChange(e);
      }
    },
    [onChange]
  );

  return <Input {...props} onChange={handleChange} type="number" />;
};
