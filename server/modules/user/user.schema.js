const { Schema, model } = require("mongoose");

const _schema = new Schema({
  id: String,
  displayName: String,
  email: String,
  password: String,
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
  blockedAssets: {
    type: [Object],
    default: [],
  }
});

module.exports = model("User", _schema);
