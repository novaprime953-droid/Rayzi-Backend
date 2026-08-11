const mongoose = require("mongoose");

const agencySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bdId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    image: { type: String, default: "" },
    bio: { type: String, default: "" },
    whatsapp: { type: String, required: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    hostCount: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Agency", agencySchema);
