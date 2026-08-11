const Agency = require("./agency.model");
const User = require("../user/user.model");

exports.getAgencies = async (req, res) => {
  try {
    const agencies = await Agency.find().populate("ownerId bdId");
    return res.status(200).json({ status: true, data: agencies });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.createAgency = async (req, res) => {
  try {
    const { name, ownerId, bdId, whatsapp, bio, image } = req.body;

    const owner = await User.findById(ownerId);
    if (!owner) return res.status(200).json({ status: false, message: "User not found" });

    const agency = new Agency({ name, ownerId, bdId, whatsapp, bio, image });
    await agency.save();

    owner.role = "agency";
    owner.agencyId = agency._id;
    owner.managerId = bdId;
    await owner.save();

    return res.status(200).json({ status: true, message: "Agency created", data: agency });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getAgencyHosts = async (req, res) => {
  try {
    const { agencyId } = req.query;
    const hosts = await User.find({ agencyId, role: "host" });
    return res.status(200).json({ status: true, data: hosts });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
