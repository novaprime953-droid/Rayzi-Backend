const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ['host', 'agency', 'bd', 'bdLeader', 'superAdmin', 'manager', 'official', 'coinSeller'], required: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", default: null }, // Only for host invitations
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled', 'expired'], default: 'pending' },
    message: { type: String, default: "" },
    expiryDate: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Invitation", invitationSchema);
