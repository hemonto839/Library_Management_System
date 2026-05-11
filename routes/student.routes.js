const express = require("express");
const router = express.Router();

const studentController = require("../controllers/student.controller");

router.get("/", studentController.getAllStudents);
router.get("/search", studentController.searchStudents);
router.get("/:id", studentController.getStudentById);
router.post("/", studentController.addStudent);
router.delete("/:id", studentController.deleteStudent);

module.exports = router;