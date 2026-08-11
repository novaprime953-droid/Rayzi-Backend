const User = require("../user/user.model");
const Agency = require("../agency/agency.model");
const Invitation = require("../invitation/invitation.model");
const AuditLog = require("../auditLog/auditLog.model");
const Commission = require("../commission/commission.model");
const Wallet = require("../wallet/wallet.model");
const mongoose = require("mongoose");

// Role Assignment (Owner/Admin only)
exports.assignRole = async (req, res) => {
  try {
    const { userId, role, managerId } = req.body;
    if (!userId || !role) {
      return res.status(200).json({ status: false, message: "UserId and role are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(200).json({ status: false, message: "User not found" });

    const oldRole = user.role;
    user.role = role;
    if (managerId) user.managerId = managerId;
    await user.save();

    // Log the action
    const log = new AuditLog({
      actorId: req.body.adminId || req.body.userId, // owner id
      action: "Role Assigned",
      targetId: user._id,
      onModel: "User",
      oldValue: oldRole,
      newValue: role
    });
    await log.save();

    return res.status(200).json({ status: true, message: "Role assigned successfully", data: user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Invite User to a Role
exports.sendInvitation = async (req, res) => {
  try {
    const { senderId, receiverId, role, agencyId, message } = req.body;

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(200).json({ status: false, message: "Receiver not found" });

    // Prevent duplicate pending invitations
    const existing = await Invitation.findOne({ receiverId, role, status: 'pending' });
    if (existing) return res.status(200).json({ status: false, message: "An invitation is already pending for this user" });

    const invitation = new Invitation({
      senderId,
      receiverId,
      role,
      agencyId,
      message,
      status: 'pending'
    });
    await invitation.save();

    // In a real app, send FCM notification here
    // ...

    return res.status(200).json({ status: true, message: "Invitation sent successfully", data: invitation });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Handle Invitation (Accept/Decline)
exports.handleInvitation = async (req, res) => {
  try {
    const { invitationId, status, agencyData } = req.body; // agencyData for agency setup
    const invitation = await Invitation.findById(invitationId);

    if (!invitation) return res.status(200).json({ status: false, message: "Invitation not found" });
    if (invitation.status !== 'pending') return res.status(200).json({ status: false, message: "Invitation already processed" });

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
      const user = await User.findById(invitation.receiverId);
      user.role = invitation.role;
      user.managerId = invitation.senderId;

      if (invitation.role === 'agency' && agencyData) {
        const agency = new Agency({
          name: agencyData.name,
          ownerId: user._id,
          bdId: invitation.senderId,
          whatsapp: agencyData.whatsapp,
          bio: agencyData.bio,
          image: agencyData.image
        });
        await agency.save();
        user.agencyId = agency._id;
      }

      if (invitation.role === 'host') {
        user.agencyId = invitation.agencyId;
        // Update host count in agency
        await Agency.findByIdAndUpdate(invitation.agencyId, { $inc: { hostCount: 1 } });
      }

      await user.save();
    }

    return res.status(200).json({ status: true, message: `Invitation ${status}`, data: invitation });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get Dashboard Data for Role Center
exports.getCenterData = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId).populate("agencyId");
    if (!user) return res.status(200).json({ status: false, message: "User not found" });

    let data = {
      user: {
        name: user.name,
        role: user.role,
        image: user.image,
        uniqueId: user.uniqueId
      }
    };

    if (user.role === 'host') {
      data.agency = user.agencyId;
      // Get work history
      // data.work = ...
    } else if (user.role === 'agency') {
      data.hosts = await User.find({ agencyId: user.agencyId, role: 'host' });
      data.agency = user.agencyId;
      data.requests = await Invitation.find({ agencyId: user.agencyId, role: 'host', status: 'pending' }).populate("receiverId");
    } else if (user.role === 'bd') {
      data.agencies = await Agency.find({ bdId: user._id });
    } else if (user.role === 'bdLeader') {
      data.bds = await User.find({ managerId: user._id, role: 'bd' });
    } else if (user.role === 'superAdmin') {
      data.bdLeaders = await User.find({ managerId: user._id, role: 'bdLeader' });
    }

    return res.status(200).json({ status: true, message: "Data fetched", data });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
