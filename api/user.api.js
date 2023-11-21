import { get, post } from "./api.model.js";

export const getUser = async (domain, id) => {
  return get(domain, `users/${id}`).then((res) => res.json());
};

export const getUserBalance = async (domain, id) => {
  return get(domain, `users/${id}/balance`)
    .then((res) => res.json())
    .then(({ value }) => value || 0)
    .catch((err) => 0);
};

export const setUserTransaction = async (domain, id, body) => {
  return post(domain, `users/${id}/transaction`, null, JSON.stringify(body));
};
