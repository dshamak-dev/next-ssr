const { uid } = require("../../scripts/support.js");

class Transaction {
  id;
  value;
  // add / remove
  type;
  sourceId;
  sourceType = "unknown";
  title = "anonymous";

  constructor(payload) {
    Object.assign(this, payload);

    if (this.id == null) {
      this.id = uid();
    }

    if (!this.createdAt) {
      this.createdAt = Date.now();
    }
  }

  apply(target) {
    const value = Number(this.value);

    switch (this.type) {
      case "add": {
        return target + value;
      }
      case "remove": {
        return target - value;
      }
      default: {
        return target;
      }
    }
  }
}

module.exports = {
  Transaction,
};
