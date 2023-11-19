import { API_PATH } from "./api.model.js";

export const getUser = async (id) => {
  return fetch(`${API_PATH}/users/${id}`).then(res => res.json());
};
