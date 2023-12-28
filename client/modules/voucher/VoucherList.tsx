import React from "react";
import { IVoucher } from "./voucher.model";
import { Voucher } from "./Voucher";

interface Props {
  vouchers: IVoucher[];
}

export const VoucherList: React.FC<Props> = ({ vouchers = [] }) => {
  const length = vouchers?.length || 0;

  return (
    <div className="flex col gap-1">
      {!length
        ? "no vouchers"
        : vouchers.map((voucher) => (
            <Voucher key={voucher.id} voucher={voucher} />
          ))}
    </div>
  );
};
