const express = require("express");
const router = express.Router();
const RoleController = require("./role.controller");
const checkAccessWithKey = require("../../checkAccess");
const { isAuth, hasRole } = require("../../middleware/auth");

// Public/Shared
router.get("/center", isAuth, RoleController.getCenterData);
router.get("/search", isAuth, RoleController.searchUser);

// Management
router.post("/assign", checkAccessWithKey(), RoleController.assignRole);
router.post("/toggleStatus", checkAccessWithKey(), RoleController.toggleRoleStatus);

// Invitations
router.post("/invite", isAuth, RoleController.sendInvitation);
router.post("/handleInvitation", isAuth, RoleController.handleInvitation);

module.exports = router;
