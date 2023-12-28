import React from "react";

export const Label: React.FC<{
  text: string;
  value: number | string | boolean;
  className?: string;
}> = ({ value, text, className }) => {
  return (
    <div className={className}>
      <div className="opacity-50">{text}</div>
      <div className="w-full text-elipsis">{value || "-"}</div>
    </div>
  );
};
