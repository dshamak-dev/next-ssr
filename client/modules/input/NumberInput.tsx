import React from "react";
import { Input } from "./Input";

export const NumberInput: React.FC = (props) => {
  return (
    <Input {...props} type="number" />
  );
};
