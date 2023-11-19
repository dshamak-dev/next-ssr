import { get } from "./api.model.js";

export const getUser = async (domain, id) => {
  return get(domain, `users/${id}`).then(res => res.json());
};
