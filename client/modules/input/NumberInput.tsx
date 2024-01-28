import React, { useCallback, useMemo } from "react";
import { Input, InputProps } from "./Input";

interface Props extends InputProps {}

export const NumberInput: React.FC<Props> = ({ onChange, inputProps, ...props }) => {
  const handleChange = useCallback(
    (e) => {
      if (onChange) {
        e.target.value = Number(e.target.value);
        onChange(e);
      }
    },
    [onChange]
  );

  const hint = useMemo(() => {
    const min = inputProps?.min || null;
    const max = inputProps?.max || null;

    if (min == null && max == null) {
      return null;
    }
    
    if (min == null) {
      return `max: ${max}`;
    }

    return `${min} - ${max}`;
  }, [inputProps]);

  return <Input {...props} inputProps={inputProps} hint={hint} onChange={handleChange} type="number" />;
};
