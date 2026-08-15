const mongoose = require("mongoose");

const salaryPolicySchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['host', 'agency', 'bd', 'bdLeader'], required: true },
    target: { type: Number, default: 0 },
    salary: { type: Number, default: 0 },
    commission: { type: Number, default: 0 },
    period: { type: String, enum: ['daily', 'weekly', 'monthly'], default: 'monthly' },
    minRequirements: { type: String, default: "" },
    status: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("SalaryPolicy", salaryPolicySchema);
