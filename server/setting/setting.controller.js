const Setting = require("./setting.model");

// get setting data
exports.index = async (req, res) => {
  try {
    const setting = await Setting.findOne({});

    if (!setting) return res.status(200).json({ status: false, message: "No data found!" });

    return res.status(200).json({ status: true, message: "Success!!", setting })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" })
  }
}

exports.store = async (req, res) => {
  try {
    const setting = new Setting();
    setting.referralBonus = 20;
    await setting.save();
    return res.status(200).json({ status: true, message: "Success!!", setting })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
}

// update the setting data
exports.update = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.settingId);
    if (!setting) return res.status(200).json({ status: false, message: "Setting data does not Exist!" });

    // Existing fields
    setting.referralBonus = req.body.referralBonus ?? setting.referralBonus;
    setting.agoraKey = req.body.agoraKey ?? setting.agoraKey;
    setting.agoraCertificate = req.body.agoraCertificate ?? setting.agoraCertificate;
    setting.maxSecondForVideo = req.body.maxSecondForVideo ?? setting.maxSecondForVideo;
    setting.privacyPolicyLink = req.body.privacyPolicyLink ?? setting.privacyPolicyLink;
    setting.privacyPolicyText = req.body.privacyPolicyText ?? setting.privacyPolicyText;
    setting.chatCharge = req.body.chatCharge ?? setting.chatCharge;
    setting.callCharge = req.body.callCharge ?? setting.callCharge;
    setting.googlePlayEmail = req.body.googlePlayEmail ?? setting.googlePlayEmail;
    setting.googlePlayKey = req.body.googlePlayKey ?? setting.googlePlayKey;
    setting.stripePublishableKey = req.body.stripePublishableKey ?? setting.stripePublishableKey;
    setting.stripeSecretKey = req.body.stripeSecretKey ?? setting.stripeSecretKey;
    setting.currency = req.body.currency ?? setting.currency;
    setting.rCoinForCashOut = req.body.rCoinForCaseOut ?? setting.rCoinForCashOut;
    setting.rCoinForDiamond = req.body.rCoinForDiamond ?? setting.rCoinForDiamond;
    setting.minRcoinForCashOut = req.body.minRcoinForCaseOut ?? setting.minRcoinForCashOut;
    setting.paymentGateway = req.body.paymentGateway ?? setting.paymentGateway;
    setting.loginBonus = req.body.loginBonus ?? setting.loginBonus;

    // New Fields Sync
    setting.paypalClientId = req.body.paypalClientId ?? setting.paypalClientId;
    setting.paypalSecretKey = req.body.paypalSecretKey ?? setting.paypalSecretKey;
    setting.razorPayId = req.body.razorPayId ?? setting.razorPayId;
    setting.razorSecretKey = req.body.razorSecretKey ?? setting.razorSecretKey;
    setting.cashfreeClientId = req.body.cashfreeClientId ?? setting.cashfreeClientId;
    setting.cashfreeClientSecret = req.body.cashfreeClientSecret ?? setting.cashfreeClientSecret;
    setting.paystackPublicKey = req.body.paystackPublicKey ?? setting.paystackPublicKey;
    setting.paystackSecretKey = req.body.paystackSecretKey ?? setting.paystackSecretKey;
    setting.flutterWaveId = req.body.flutterWaveId ?? setting.flutterWaveId;

    setting.femaleCallCharge = req.body.femaleCallCharge ?? setting.femaleCallCharge;
    setting.maleCallCharge = req.body.maleCallCharge ?? setting.maleCallCharge;
    setting.audioCallChargeMale = req.body.audioCallChargeMale ?? setting.audioCallChargeMale;
    setting.audioCallChargeFemale = req.body.audioCallChargeFemale ?? setting.audioCallChargeFemale;
    setting.bothRandomCallRate = req.body.bothRandomCallRate ?? setting.bothRandomCallRate;
    setting.maleRandomCallRate = req.body.maleRandomCallRate ?? setting.maleRandomCallRate;
    setting.femaleRandomCallRate = req.body.femaleRandomCallRate ?? setting.femaleRandomCallRate;
    setting.locationApiKey = req.body.locationApiKey ?? setting.locationApiKey;

    await setting.save();
    return res.status(200).json({ status: true, message: "Success!!", setting })

  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" });
  }
}

// handle setting switch
exports.handleSwitch = async (req, res) => {
  try {
    const setting = await Setting.findById(req.params.settingId);
    if (!setting) return res.status(200).json({ status: false, message: "Setting data does not Exist!" });

    const { type } = req.query;
    switch (type) {
      case "googlePlay": setting.googlePlaySwitch = !setting.googlePlaySwitch; break;
      case "stripe": setting.stripeSwitch = !setting.stripeSwitch; break;
      case "paypal": setting.paypalAndroidEnabled = !setting.paypalAndroidEnabled; break;
      case "razorpay": setting.razorPayAndroidEnabled = !setting.razorPayAndroidEnabled; break;
      case "cashfree": setting.cashfreeAndroidEnabled = !setting.cashfreeAndroidEnabled; break;
      case "paystack": setting.paystackAndroidEnabled = !setting.paystackAndroidEnabled; break;
      case "flutterwave": setting.isFlutterwaveEnabled = !setting.isFlutterwaveEnabled; break;
      case "app active": setting.isAppActive = !setting.isAppActive; break;
      default: break;
    }

    await setting.save();
    return res.status(200).json({ status: true, message: "Success!!", setting })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Server Error" })
  }
}
