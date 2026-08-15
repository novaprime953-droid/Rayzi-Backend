const mongoose = require("mongoose");

const walletBalanceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    diamond: { type: Number, default: 0 },
    rCoin: { type: Number, default: 0 },
    availableRcoin: { type: Number, default: 0 },
    pendingRcoin: { type: Number, default: 0 },
    commissionRcoin: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("WalletBalance", walletBalanceSchema);
