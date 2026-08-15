const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    referralBonus: { type: Number, default: 50 },
    loginBonus: { type: Number, default: 50 },
    agoraKey: { type: String, default: "" },
    agoraCertificate: { type: String, default: "" },
    maxSecondForVideo: { type: Number, default: 30 },
    privacyPolicyLink: { type: String, default: "" },
    privacyPolicyText: { type: String, default: "" },
    chatCharge: { type: Number, default: 10 },
    callCharge: { type: Number, default: 10 },
    googlePlayEmail: { type: String, default: "" },
    googlePlayKey: { type: String, default: "" },
    googlePlaySwitch: { type: Boolean, default: false },
    stripeSwitch: { type: Boolean, default: false },
    stripePublishableKey: { type: String, default: "" },
    stripeSecretKey: { type: String, default: "" },
    currency: { type: String, default: "$" },
    rCoinForCashOut: { type: Number, default: 20 },
    rCoinForDiamond: { type: Number, default: 20 },
    isAppActive: { type: Boolean, default: true },
    paymentGateway: { type: Array, default: [] },
    minRcoinForCashOut: { type: Number, default: 200 }, // minimum rCoin for withdraw [redeem]
    freeDiamondForAd: { type: Number, default: 20 },
    maxAdPerDay: { type: Number, default: 3 },

    // Integrated Payment Gateways
    paypalAndroidEnabled: { type: Boolean, default: false },
    paypalClientId: { type: String, default: "" },
    paypalSecretKey: { type: String, default: "" },
    razorPayAndroidEnabled: { type: Boolean, default: false },
    razorPayId: { type: String, default: "" },
    razorSecretKey: { type: String, default: "" },
    cashfreeAndroidEnabled: { type: Boolean, default: false },
    cashfreeClientId: { type: String, default: "" },
    cashfreeClientSecret: { type: String, default: "" },
    paystackAndroidEnabled: { type: Boolean, default: false },
    paystackPublicKey: { type: String, default: "" },
    paystackSecretKey: { type: String, default: "" },
    isFlutterwaveEnabled: { type: Boolean, default: false },
    flutterWaveId: { type: String, default: "" },

    // Integrated Rates & API Keys
    femaleCallCharge: { type: Number, default: 0 },
    maleCallCharge: { type: Number, default: 0 },
    audioCallChargeMale: { type: Number, default: 0 },
    audioCallChargeFemale: { type: Number, default: 0 },
    bothRandomCallRate: { type: Number, default: 0 },
    maleRandomCallRate: { type: Number, default: 0 },
    femaleRandomCallRate: { type: Number, default: 0 },
    locationApiKey: { type: String, default: "" },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

module.exports = mongoose.model("Setting", settingSchema);
