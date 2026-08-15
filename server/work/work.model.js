const mongoose = require("mongoose");

const workSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", default: null },
    date: { type: String, required: true }, // YYYY-MM-DD
    coins: { type: Number, default: 0 },
    seconds: { type: Number, default: 0 }, // Duration in seconds
    isLive: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Work", workSchema);
