import { appApi, waitFor } from '../../api/api.model';

export const getProfile = async (id) => {
  await waitFor(1000);

  return appApi.get(`/profile?authId=${id}`);
};

export const postProfile = (body) => {
  return appApi.post('profile', { json: true, body });
};

export const postTransaction = (profileId, body) => {
  return appApi.post(`profile/${profileId}/transaction`, { json: true, body });
};
