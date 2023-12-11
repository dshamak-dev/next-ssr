import React from "react";

export const Label: React.FC<{ text: string; value: number | string | boolean }> = ({
  value,
  text,
}) => {
  return (
    <div>
      <div>{text}</div>
      <div>{value || '-'}</div>
    </div>
  );
};
