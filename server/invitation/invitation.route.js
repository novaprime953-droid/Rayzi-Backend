const express = require("express");
const router = express.Router();
const InvitationController = require("./invitation.controller");
const checkAccessWithKey = require("../../checkAccess");

router.post("/inviteAgency", checkAccessWithKey(), InvitationController.inviteAgency);
router.post("/acceptAgency", checkAccessWithKey(), InvitationController.acceptAgencyInvitation);
router.get("/bd", checkAccessWithKey(), InvitationController.getBdInvitations);

module.exports = router;
