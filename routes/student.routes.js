// student.routes.js

const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizedRoles } = require("../middleware/role.middleware");

// Admin and librarian can view/search students
router.get(
    "/",
    protect,
    authorizedRoles("admin", "librarian"),
    studentController.getAllStudents
);

router.get(
    "/search",
    protect,
    authorizedRoles("admin", "librarian"),
    studentController.searchStudents
);

router.get(
    "/:id",
    protect,
    authorizedRoles("admin", "librarian"),
    studentController.getStudentById
);

// Only admin can add/delete students
router.post(
    "/",
    protect,
    authorizedRoles("admin"),
    studentController.addStudent
);

router.put(
    "/:id",
    protect,
    authorizedRoles("admin"),
    studentController.updateStudent
);

router.delete(
    "/:id",
    protect,
    authorizedRoles("admin"),
    studentController.deleteStudent
);

module.exports = router;