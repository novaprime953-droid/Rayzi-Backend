const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../server/user/user.model");

exports.isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ status: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.JWT_SECRET || "rayzi_secret");

    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ status: false, message: "User not found" });
    }

    if (user.isBlock) {
      return res.status(403).json({ status: false, message: "User is blocked" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ status: false, message: "Invalid token" });
  }
};

exports.hasRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: false, message: "Unauthorized role access" });
    }
    if (req.user.roleStatus === 'suspended') {
        return res.status(403).json({ status: false, message: "Your role access is suspended" });
    }
    next();
  };
};
