const express = require("express");
const { Voucher } = require("./voucher.model.js");
const { get, post, update } = require("./voucher.controller.js");

const router = express.Router();

const baseUrl = "/vouchers";

router.get(`${baseUrl}`, async (req, res) => {
  const list = await get();

  res.status(200).json(list || []);
});

router.post(`${baseUrl}`, async (req, res) => {
  const body = req.body;

  const voucher = await post(body);

  res.status(200).json(voucher);
});

router.put(`${baseUrl}/:id`, async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const voucher = await update({ id }, body);

  res.status(200).json(voucher);
});

module.exports = router;
