const { uid } = require("../../scripts/support.js");

class Voucher {
  id;
  voucher;
  tag;
  value;
  maxUsageNumber;
  used;
  createdBy;
  createdAt;
  expireAt;
  qrUrl;

  constructor({ ...props }) {
    Object.assign(
      this,
      {
        used: 0,
        maxUsageNumber: 1
      },
      props
    );

    if (this.id == null) {
      this.id = uid();
    }

    if (this.createdAt == null) {
      this.createdAt = Date.now();
    }
  }
}

module.exports = {
  Voucher,
};
