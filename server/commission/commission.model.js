const mongoose = require("mongoose");

const commissionSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['host', 'agency', 'bd', 'bdLeader', 'superAdmin'], required: true, unique: true },
    percentage: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Commission", commissionSchema);
