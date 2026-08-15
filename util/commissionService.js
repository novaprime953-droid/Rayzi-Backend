const Commission = require("../server/commission/commission.model");
const WalletBalance = require("../server/wallet/walletBalance.model");
const Wallet = require("../server/wallet/wallet.model");
const User = require("../server/user/user.model");
const Agency = require("../agency/agency.model");
const AuditLog = require("../server/auditLog/auditLog.model");

exports.calculateAndDistribute = async (hostId, amount) => {
  try {
    const host = await User.findById(hostId).populate("agencyId");
    if (!host || host.role !== 'host') return;

    const commissions = await Commission.find();
    const commMap = {};
    commissions.forEach(c => commMap[c.role] = c.percentage || 0);

    // Hierarchy flow: Host -> Agency -> BD -> BD Leader -> Super Admin

    // 1. Agency
    if (host.agencyId) {
      const agency = await Agency.findById(host.agencyId);
      if (agency) {
        const agencyComm = (amount * (commMap['agency'] || 0)) / 100;
        await this.addCommission(agency.ownerId, agencyComm, 'AGENCY_COMMISSION', hostId);

        // 2. BD
        if (agency.bdId) {
          const bd = await User.findById(agency.bdId);
          if (bd) {
            const bdComm = (amount * (commMap['bd'] || 0)) / 100;
            await this.addCommission(bd._id, bdComm, 'BD_COMMISSION', hostId);

            // 3. BD Leader
            if (bd.managerId) {
              const bdLeader = await User.findById(bd.managerId);
              if (bdLeader && bdLeader.role === 'bdLeader') {
                const bdLeaderComm = (amount * (commMap['bdLeader'] || 0)) / 100;
                await this.addCommission(bdLeader._id, bdLeaderComm, 'BD_LEADER_COMMISSION', hostId);

                // 4. Super Admin
                if (bdLeader.managerId) {
                  const superAdmin = await User.findById(bdLeader.managerId);
                  if (superAdmin && superAdmin.role === 'superAdmin') {
                    const saComm = (amount * (commMap['superAdmin'] || 0)) / 100;
                    await this.addCommission(superAdmin._id, saComm, 'SUPER_ADMIN_COMMISSION', hostId);
                  }
                }
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error("Critical Commission Error:", error);
  }
};

exports.addCommission = async (userId, amount, type, sourceUserId) => {
  if (amount <= 0) return;

  const session = await WalletBalance.startSession();
  try {
    await session.withTransaction(async () => {
      await WalletBalance.findOneAndUpdate(
        { userId },
        { $inc: { commissionRcoin: amount, availableRcoin: amount, rCoin: amount } },
        { upsert: true, session }
      );

      const transaction = new Wallet({
        userId,
        type: 8,
        rCoin: amount,
        otherUserId: sourceUserId,
        date: new Date().toISOString(),
        isIncome: true
      });
      await transaction.save({ session });

      const log = new AuditLog({
        actorId: sourceUserId,
        action: type,
        targetId: userId,
        onModel: "User",
        newValue: amount
      });
      await log.save({ session });
    });
  } finally {
    session.endSession();
  }
};
