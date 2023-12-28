const { find, update } = require("./voucher.controller.js");
const { Voucher } = require("./voucher.model.js");

const VoucherActionType = {
  Create: 0,
  Use: 1,
  Disable: 2,
  Activate: 3,
  Remove: 4,
};

const createVoucher = async (payload) => {
  let error = null;

  if (payload == null || !payload.tag || !payload.value) {
    error = 'invalid data';

    return Promise.reject(error);
  }

  const voucher = await find({ tag: payload?.tag });

  if (voucher) {
    error = 'this tag already used';

    return Promise.reject(error);
  }

  return new Voucher(payload);
};
const useVoucher = async (payload) => {
  const voucher = await find({ tag: payload?.tag });
  let error = null;

  // todo: check expire date and active state
  if (!voucher || voucher.used === voucher.maxUsageNumber) {
    error = "invalid request";

    return Promise.reject(error);
  }

  const nextVoucher = new Voucher(voucher);
  nextVoucher.used += 1;

  if (error) {
    Promise.reject(error);
  }

  return nextVoucher;
};
const updateVoucherStatus = async (voucher, nextStatus) => {};
const removeVoucher = async (voucher) => {};

const actions = {
  [VoucherActionType.Create]: createVoucher,
  [VoucherActionType.Use]: useVoucher,
};

const reducer = async (actionType, payload, save = true) => {
  const handler = actions[actionType];
  let error = null;
  let response = null;

  if (!handler) {
    error = "invalid action";

    return [error, response];
  }

  response = await handler(payload).catch((err) => {
    error = err.message;

    return null;
  });

  if (save && response?.id) {
    response = await update({ id: response.id }, response);
  }

  return [error, response];
};

module.exports = {
  reducer,
  VoucherActionType,
};
