const { Schema, model } = require("mongoose");

const transactionFields = {
  id: String,
  value: Number,
  type: String,
  sourceId: String,
  sourceType: String,
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
};

const historyFields = {
  sourceId: String,
  sourceType: String,
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
};

const _schema = new Schema({
  id: String,
  displayName: String,
  email: String,
  createdAt: {
    type: Date,
    default: () => Date.now(),
  },
  assets: {
    type: Number,
    default: 0,
  },
  authId: String,
  admin: Boolean,
  transactions: {
    type: [Object],
    default: [],
  },
  history: {
    type: [Object],
    default: [],
  },
});

module.exports = model("User", _schema);
