const express = require("express");
const router = express.Router();
const RoleController = require("./role.controller");
const checkAccessWithKey = require("../../checkAccess");

router.post("/assign", checkAccessWithKey(), RoleController.assignRole);
router.post("/invite", checkAccessWithKey(), RoleController.sendInvitation);
router.post("/handleInvitation", checkAccessWithKey(), RoleController.handleInvitation);
router.get("/center", checkAccessWithKey(), RoleController.getCenterData);

module.exports = router;
