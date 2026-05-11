const express = require("express");
const router = express.Router();

const borrowController = require("../controllers/borrow.controller");

router.post("/borrow", borrowController.borrowBook);
router.post("/return", borrowController.returnBook);
router.get("/students/:id/history", borrowController.getStudentHistory);

module.exports = router;