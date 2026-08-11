const express = require("express");
const router = express.Router();
const AgencyController = require("./agency.controller");
const checkAccessWithKey = require("../../checkAccess");

router.get("/", checkAccessWithKey(), AgencyController.getAgencies);
router.post("/create", checkAccessWithKey(), AgencyController.createAgency);
router.get("/hosts", checkAccessWithKey(), AgencyController.getAgencyHosts);

module.exports = router;
