const mongoose = require("mongoose");

const salaryPolicySchema = new mongoose.Schema(
  {
    targetCoins: { type: Number, required: true },
    salary: { type: Number, required: true },
    commissionPercentage: { type: Number, default: 0 },
    minHours: { type: Number, default: 0 },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("SalaryPolicy", salaryPolicySchema);
