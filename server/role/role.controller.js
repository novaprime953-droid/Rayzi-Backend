const User = require("../user/user.model");
const Agency = require("../agency/agency.model");
const Invitation = require("../invitation/invitation.model");
const AuditLog = require("../auditLog/auditLog.model");
const Commission = require("../commission/commission.model");
const Wallet = require("../wallet/wallet.model");
const WalletBalance = require("../wallet/walletBalance.model");
const Work = require("../work/work.model");
const SalaryPolicy = require("../work/salaryPolicy.model");
const mongoose = require("mongoose");
const FCM = require("fcm-node");
const config = require("../../config");
const fcm = new FCM(config.SERVER_KEY);

// Helper for sending notifications
const sendNotification = (receiver, title, message, type, data = {}) => {
  if (!receiver.fcmToken) return;
  const messageObj = {
    to: receiver.fcmToken,
    notification: { title, body: message },
    data: { ...data, type }
  };
  fcm.send(messageObj, (err, response) => {
    if (err) console.error("Notification Error:", err);
  });
};

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

    // Ensure wallet balance exists
    await WalletBalance.findOneAndUpdate(
      { userId: user._id },
      { $setOnInsert: { userId: user._id } },
      { upsert: true, new: true }
    );

    // Log the action
    const log = new AuditLog({
      actorId: req.body.adminId || req.body.ownerId, // actor's id
      action: "Role Assigned",
      targetId: user._id,
      onModel: "User",
      oldValue: oldRole,
      newValue: role
    });
    await log.save();

    // Notify user
    sendNotification(user, "Role Assigned", `You have been assigned the role of ${role}`, "ROLE_ASSIGNED");

    return res.status(200).json({ status: true, message: "Role assigned successfully", data: user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Invite User to a Role
exports.sendInvitation = async (req, res) => {
  try {
    const { senderId, receiverId, role, agencyId, message } = req.body;

    const sender = await User.findById(senderId);
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
      status: 'pending',
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days expiry
    });
    await invitation.save();

    // Notify receiver
    sendNotification(receiver, "Role Invitation", `${sender.name} has invited you to join as ${role}`, "ROLE_INVITATION", { invitationId: invitation._id.toString() });

    return res.status(200).json({ status: true, message: "Invitation sent successfully", data: invitation });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Handle Invitation (Accept/Decline)
exports.handleInvitation = async (req, res) => {
  try {
    const { invitationId, status, agencyData } = req.body;
    const invitation = await Invitation.findById(invitationId).populate("senderId receiverId");

    if (!invitation) return res.status(200).json({ status: false, message: "Invitation not found" });
    if (invitation.status !== 'pending') return res.status(200).json({ status: false, message: "Invitation already processed" });

    if (invitation.expiryDate && invitation.expiryDate < new Date()) {
      invitation.status = 'expired';
      await invitation.save();
      return res.status(200).json({ status: false, message: "Invitation has expired" });
    }

    invitation.status = status;
    await invitation.save();

    if (status === 'accepted') {
      const user = invitation.receiverId;
      user.role = invitation.role;
      user.managerId = invitation.senderId._id;

      if (invitation.role === 'agency' && agencyData) {
        const agency = new Agency({
          name: agencyData.name,
          ownerId: user._id,
          bdId: invitation.senderId._id,
          whatsapp: agencyData.whatsapp,
          bio: agencyData.bio,
          image: agencyData.image
        });
        await agency.save();
        user.agencyId = agency._id;
      }

      if (invitation.role === 'host') {
        user.agencyId = invitation.agencyId;
        await Agency.findByIdAndUpdate(invitation.agencyId, { $inc: { hostCount: 1 } });
      }

      await user.save();

      // Ensure wallet balance exists
      await WalletBalance.findOneAndUpdate(
        { userId: user._id },
        { $setOnInsert: { userId: user._id } },
        { upsert: true }
      );

      // Notify sender
      sendNotification(invitation.senderId, "Invitation Accepted", `${user.name} has accepted your invitation for ${invitation.role}`, "INVITATION_ACCEPTED");
    } else {
      // Notify sender of decline
      sendNotification(invitation.senderId, "Invitation Declined", `${invitation.receiverId.name} has declined your invitation for ${invitation.role}`, "INVITATION_DECLINED");
    }

    return res.status(200).json({ status: true, message: `Invitation ${status}`, data: invitation });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Role Suspension/Reactivation
exports.toggleRoleStatus = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(200).json({ status: false, message: "User not found" });

    const oldStatus = user.roleStatus;
    user.roleStatus = user.roleStatus === 'active' ? 'suspended' : 'active';
    user.roleSuspensionReason = user.roleStatus === 'suspended' ? reason : "";
    await user.save();

    const log = new AuditLog({
      actorId: req.body.adminId || req.body.ownerId,
      action: `Role ${user.roleStatus === 'active' ? 'Reactivated' : 'Suspended'}`,
      targetId: user._id,
      onModel: "User",
      oldValue: oldStatus,
      newValue: user.roleStatus
    });
    await log.save();

    sendNotification(user, "Role Status Updated", `Your role access has been ${user.roleStatus}`, "ROLE_STATUS_UPDATE");

    return res.status(200).json({ status: true, message: `Role ${user.roleStatus} successfully`, data: user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Search User for Invitation
exports.searchUser = async (req, res) => {
  try {
    const { uniqueId } = req.query;
    const user = await User.findOne({ uniqueId }).select("name uniqueId image role country gender age");
    if (!user) return res.status(200).json({ status: false, message: "User not found" });

    return res.status(200).json({ status: true, message: "User found", data: user });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Get Dashboard Data for Role Center
exports.getCenterData = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await User.findById(userId).populate("agencyId managerId");
    if (!user) return res.status(200).json({ status: false, message: "User not found" });

    const balance = await WalletBalance.findOne({ userId: user._id });

    let data = {
      user: {
        name: user.name,
        role: user.role,
        image: user.image,
        uniqueId: user.uniqueId,
        balance: balance
      }
    };

    if (user.role === 'host') {
      data.agency = await Agency.findById(user.agencyId);
      data.work = await Work.find({ userId: user._id }).sort({ createdAt: -1 }).limit(30);
      data.salaryPolicy = await SalaryPolicy.find({ role: 'host', status: 'active' });
    }
    else if (user.role === 'agency') {
      const agency = await Agency.findOne({ ownerId: user._id });
      data.agency = agency;
      data.hosts = await User.find({ agencyId: agency._id, role: 'host' });
      data.requests = await Invitation.find({ agencyId: agency._id, role: 'host', status: 'pending' }).populate("receiverId");
      data.workData = await Work.find({ agencyId: agency._id }).sort({ createdAt: -1 }).limit(50);
    }
    else if (user.role === 'bd') {
      data.agencies = await Agency.find({ bdId: user._id });
      data.requests = await Invitation.find({ senderId: user._id, role: 'agency', status: 'pending' }).populate("receiverId");
    }
    else if (user.role === 'bdLeader') {
      data.bds = await User.find({ managerId: user._id, role: 'bd' });
      data.agencies = await Agency.find({ bdId: { $in: (await User.find({ managerId: user._id, role: 'bd' })).map(u => u._id) } });
    }
    else if (user.role === 'superAdmin') {
      data.bdLeaders = await User.find({ managerId: user._id, role: 'bdLeader' });
      data.bds = await User.find({ role: 'bd' });
      data.agencies = await Agency.find();
    }
    else if (user.role === 'official' || user.role === 'manager') {
      data.assignedUsers = await User.find({ managerId: user._id });
      data.tasks = []; // Placeholder for tasks
    }
    else if (user.role === 'coinSeller') {
      data.transactions = await Wallet.find({ userId: user._id, type: 2 }).limit(50);
      data.customers = await User.find({ managerId: user._id });
    }
    else if (user.role === 'owner') {
      data.summary = {
        totalUsers: await User.countDocuments(),
        totalAgencies: await Agency.countDocuments(),
        totalHosts: await User.countDocuments({ role: 'host' }),
      };
    }

    return res.status(200).json({ status: true, message: "Data fetched", data });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
