const Invitation = require("./invitation.model");
const User = require("../user/user.model");
const Agency = require("../agency/agency.model");

// Send invitation from BD to User to become an Agency
exports.inviteAgency = async (req, res) => {
  try {
    const { bdId, userId, message } = req.body;

    const bdUser = await User.findById(bdId);
    if (!bdUser || bdUser.role !== 'bd') {
      return res.status(200).json({ status: false, message: "Only BD users can invite agencies." });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(200).json({ status: false, message: "Target user not found." });
    }

    if (targetUser.role !== 'user') {
      return res.status(200).json({ status: false, message: "User already has a role assigned." });
    }

    const existingInvite = await Invitation.findOne({
      senderId: bdId,
      receiverId: userId,
      role: 'agency',
      status: 'pending'
    });

    if (existingInvite) {
      return res.status(200).json({ status: false, message: "Invitation already sent to this user." });
    }

    const invitation = new Invitation({
      senderId: bdId,
      receiverId: userId,
      role: 'agency',
      message: message || "You are invited to become an Agency.",
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
    });

    await invitation.save();
    return res.status(200).json({ status: true, message: "Invitation sent successfully.", data: invitation });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Accept agency invitation
exports.acceptAgencyInvitation = async (req, res) => {
  try {
    const { invitationId } = req.body;

    const invitation = await Invitation.findById(invitationId);
    if (!invitation || invitation.status !== 'pending') {
      return res.status(200).json({ status: false, message: "Invalid or expired invitation." });
    }

    const user = await User.findById(invitation.receiverId);
    if (!user) return res.status(200).json({ status: false, message: "User not found." });

    // Create Agency object
    const agency = new Agency({
      name: user.name + "'s Agency",
      ownerId: user._id,
      bdId: invitation.senderId,
      whatsapp: "", // To be filled later
      bio: invitation.message
    });
    await agency.save();

    // Update User Role
    user.role = 'agency';
    user.agencyId = agency._id;
    user.managerId = invitation.senderId;
    await user.save();

    invitation.status = 'accepted';
    await invitation.save();

    return res.status(200).json({ status: true, message: "Invitation accepted. You are now an Agency.", data: agency });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get invitations for a BD
exports.getBdInvitations = async (req, res) => {
  try {
    const { bdId } = req.query;
    const invitations = await Invitation.find({ senderId: bdId }).populate("receiverId");
    return res.status(200).json({ status: true, data: invitations });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
