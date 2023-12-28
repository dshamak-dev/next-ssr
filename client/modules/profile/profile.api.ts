import { appApi, waitFor } from "../../api/api.model";

export const getProfile = async (id) => {
  return appApi.get(`/users?authId=${id}`);
};

export const postProfile = (body) => {
  return appApi.post("users", { json: true, body });
};

export const postTransaction = (profileId, body) => {
  return appApi.post(`users/${profileId}/transaction`, { json: true, body });
};

export const getProfileHistory = (profileId) => {
  return appApi.get(`users/${profileId}/history`);
};

export const useProfileVoucher = (profileId, voucher) => {
  return appApi.post(`users/${profileId}/voucher`, {
    json: true,
    body: { voucher },
  });
};
