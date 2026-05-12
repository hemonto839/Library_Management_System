// borrow.routes.js

const express = require("express");
const router = express.Router();

const borrowController = require("../controllers/borrow.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizedRoles } = require("../middleware/role.middleware");

// Only admin and librarian can borrow/return books for students
router.post(
    "/borrow",
    protect,
    authorizedRoles("admin", "librarian"),
    borrowController.borrowBook
);

router.post(
    "/return",
    protect,
    authorizedRoles("admin", "librarian"),
    borrowController.returnBook
);

// Admin and librarian can check any student's history
// Student history self-check should be controlled later in controller
router.get(
    "/students/:id/history",
    protect,
    authorizedRoles("admin", "librarian", "student"),
    borrowController.getStudentHistory
);

module.exports = router;