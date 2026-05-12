// book.routes.js

const express = require("express");
const router = express.Router();

const bookController = require("../controllers/book.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizedRoles } = require("../middleware/role.middleware");

// Everyone logged in can view/search books
router.get("/", protect, bookController.getAllBooks);
router.get("/search", protect, bookController.searchBooks);
router.get("/:id", protect, bookController.getBookById);

// Admin and librarian can manage books
router.post(
    "/",
    protect,
    authorizedRoles("admin", "librarian"),
    bookController.addBook
);

router.put(
    "/:id",
    protect,
    authorizedRoles("admin", "librarian"),
    bookController.updateBook
);

router.delete(
    "/:id",
    protect,
    authorizedRoles("admin", "librarian"),
    bookController.deleteBook
);

module.exports = router;