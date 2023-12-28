import React from "react";
import { IVoucher } from "./voucher.model";

interface Props {
  voucher: IVoucher;
}

export const Voucher: React.FC<Props> = ({ voucher }) => {
  const { id, tag, maxUsageNumber, used, value } = voucher;

  return (
    <div data-id={id} className="flex gap-1">
      <div>
        <label>
          #{tag}<span className="text-xs">({value})</span>
        </label>
      </div>
      <div>
        <span>Used: </span>
        <span>
          {used} / {maxUsageNumber}
        </span>
      </div>
    </div>
  );
};
