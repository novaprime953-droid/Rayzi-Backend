const Commission = require("./commission.model");

exports.getCommissions = async (req, res) => {
  try {
    const commissions = await Commission.find();
    return res.status(200).json({ status: true, data: commissions });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.updateCommission = async (req, res) => {
  try {
    const { role, percentage } = req.body;
    let commission = await Commission.findOne({ role });
    if (commission) {
      commission.percentage = percentage;
    } else {
      commission = new Commission({ role, percentage });
    }
    await commission.save();
    return res.status(200).json({ status: true, message: "Commission updated", data: commission });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};
