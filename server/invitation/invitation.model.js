const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ['host', 'agency', 'bd', 'bdLeader', 'superAdmin'], required: true },
    agencyId: { type: mongoose.Schema.Types.ObjectId, ref: "Agency", default: null }, // Only for host invitations
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'cancelled'], default: 'pending' },
    message: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Invitation", invitationSchema);
