import React, { useCallback } from "react";
import { IVoucher } from "./voucher.model";
import { FormField, useForm } from "../form/useForm";
import { Form } from "../form/Form";

interface Props {
  onSubmit?: (event, voucher: IVoucher) => void;
}

const voucherFormFields: FormField[] = [
  {
    id: "tag",
    required: true,
    placeholder: "Voucher Tag",
  },
  {
    id: "value",
    type: "number",
    required: true,
    placeholder: "Voucher Value",
  },
  {
    id: "exprireDate",
    type: "date",
    placeholder: "Voucher Valid Till",
  },
  {
    id: "maxUsageNumber",
    type: "number",
    required: true,
    placeholder: "Voucher Usage Limit",
  },
];

const initialVoucher = {};

export const VoucherForm: React.FC<Props> = ({ onSubmit }) => {
  // const { id, title, maxUsageNumber, used, value } = voucher;

  const handleSubmit = useCallback(
    (e, formData) => {
      if (onSubmit) {
        onSubmit(e, formData as IVoucher);
      }
    },
    [onSubmit]
  );

  return (
    <div>
      <Form
        onSubmit={handleSubmit}
        fields={voucherFormFields}
        initialData={initialVoucher}
      />
    </div>
  );
};
