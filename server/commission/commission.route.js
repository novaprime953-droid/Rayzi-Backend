const express = require("express");
const router = express.Router();
const CommissionController = require("./commission.controller");
const checkAccessWithKey = require("../../checkAccess");

router.get("/", checkAccessWithKey(), CommissionController.getCommissions);
router.post("/update", checkAccessWithKey(), CommissionController.updateCommission);

module.exports = router;
