// report.routes.js

const express = require("express");
const router = express.Router();

const reportController = require("../controllers/report.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizedRoles } = require("../middleware/role.middleware");

// Admin and librarian can see dashboard summary
router.get(
    "/summary",
    protect,
    authorizedRoles("admin", "librarian"),
    reportController.getDashboardSummary
);

module.exports = router;