import { appApi, waitFor } from "../../api/api.model";
import { IVoucher } from "./voucher.model";

export const getVouchers = (profileId): Promise<IVoucher[] | null> => {
  if (profileId == null) {
    return Promise.resolve([]);
  }

  return appApi
    .get(`/vouchers/?profileId=${profileId}`)
    .then((res) => res?.json());
};

export const postVoucher = (
  profileId,
  voucherData
): Promise<IVoucher | null> => {
  if (profileId == null || voucherData == null) {
    return Promise.resolve(null);
  }

  return appApi
    .post(`/vouchers/?profileId=${profileId}`, {
      json: true,
      body: voucherData,
    });
};
