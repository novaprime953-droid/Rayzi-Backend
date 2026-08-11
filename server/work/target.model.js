const mongoose = require("mongoose");

const targetSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: "SalaryPolicy", required: true },
    currentCoins: { type: Number, default: 0 },
    currentHours: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    startDate: Date,
    endDate: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Target", targetSchema);
