const pool = require("../config/db");

const {
    isPositiveNumber,
    isNonEmptyString,
} = require("../utils/validation");

async function getAllBooks(req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM books ORDER BY id ASC"
        );

        res.json({
            message: "Books fetched successfully",
            data: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching books",
            error: error.message,
        });
    }
}

async function searchBooks(req, res) {
    const keyword = req.query.keyword;

    if (!isNonEmptyString(keyword)) {
        return res.status(400).json({
            message: "Keyword is required and must be a non-empty string",
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM books WHERE title ILIKE $1 ORDER BY id ASC",
            [`%${keyword}%`]
        );

        res.json({
            message: "Search completed successfully",
            data: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while searching books",
            error: error.message,
        });
    }
}

async function getBookById(req, res) {
    const bookId = Number(req.params.id);

    if (!isPositiveNumber(bookId)) {
        return res.status(400).json({
            message: "Book ID must be a positive number",
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM books WHERE id = $1",
            [bookId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        res.json({
            message: "Book fetched successfully",
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching book",
            error: error.message,
        });
    }
}

async function addBook(req, res) {
    const { title, author, totalCopies, availableCopies } = req.body;

    if (!isNonEmptyString(title)) {
        return res.status(400).json({
            message: "Book title is required",
        });
    }

    if (!isNonEmptyString(author)) {
        return res.status(400).json({
            message: "Book author is required",
        });
    }

    if (!isPositiveNumber(totalCopies)) {
        return res.status(400).json({
            message: "totalCopies must be a positive number",
        });
    }

    const finalAvailableCopies =
        availableCopies === undefined ? totalCopies : availableCopies;

    if (
        !Number.isInteger(finalAvailableCopies) ||
        finalAvailableCopies < 0 ||
        finalAvailableCopies > totalCopies
    ) {
        return res.status(400).json({
            message: "availableCopies must be between 0 and totalCopies",
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO books (title, author, total_copies, available_copies)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [title, author, totalCopies, finalAvailableCopies]
        );

        res.status(201).json({
            message: "Book added successfully",
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while adding book",
            error: error.message,
        });
    }
}

async function updateBook(req, res) {
    const bookId = Number(req.params.id);
    const { title, author, totalCopies, availableCopies } = req.body;

    if (!isPositiveNumber(bookId)) {
        return res.status(400).json({
            message: "Book ID must be a positive number",
        });
    }

    if (title !== undefined && !isNonEmptyString(title)) {
        return res.status(400).json({
            message: "Book title must be a non-empty string",
        });
    }

    if (author !== undefined && !isNonEmptyString(author)) {
        return res.status(400).json({
            message: "Book author must be a non-empty string",
        });
    }

    if (totalCopies !== undefined && !isPositiveNumber(totalCopies)) {
        return res.status(400).json({
            message: "totalCopies must be a positive number",
        });
    }

    if (
        availableCopies !== undefined &&
        (!Number.isInteger(availableCopies) || availableCopies < 0)
    ) {
        return res.status(400).json({
            message: "availableCopies must be zero or a positive number",
        });
    }

    try {
        const existingBook = await pool.query(
            "SELECT * FROM books WHERE id = $1",
            [bookId]
        );

        if (existingBook.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        const currentBook = existingBook.rows[0];

        const updatedTitle = title ?? currentBook.title;
        const updatedAuthor = author ?? currentBook.author;
        const updatedTotalCopies = totalCopies ?? currentBook.total_copies;
        const updatedAvailableCopies =
            availableCopies ?? currentBook.available_copies;

        if (updatedAvailableCopies > updatedTotalCopies) {
            return res.status(400).json({
                message: "availableCopies cannot be greater than totalCopies",
            });
        }

        const result = await pool.query(
            `UPDATE books
             SET title = $1,
                 author = $2,
                 total_copies = $3,
                 available_copies = $4
             WHERE id = $5
             RETURNING *`,
            [
                updatedTitle,
                updatedAuthor,
                updatedTotalCopies,
                updatedAvailableCopies,
                bookId,
            ]
        );

        res.json({
            message: "Book updated successfully",
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while updating book",
            error: error.message,
        });
    }
}

async function deleteBook(req, res) {
    const bookId = Number(req.params.id);

    if (!isPositiveNumber(bookId)) {
        return res.status(400).json({
            message: "Book ID must be a positive number",
        });
    }

    try {
        const activeBorrow = await pool.query(
            `SELECT * FROM borrow_records
             WHERE book_id = $1 AND status = 'borrowed'`,
            [bookId]
        );

        if (activeBorrow.rows.length > 0) {
            return res.status(400).json({
                message: "Cannot delete this book because it is currently borrowed",
            });
        }

        const result = await pool.query(
            "DELETE FROM books WHERE id = $1 RETURNING *",
            [bookId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found",
            });
        }

        res.json({
            message: "Book deleted successfully",
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while deleting book",
            error: error.message,
        });
    }
}

module.exports = {
    getAllBooks,
    searchBooks,
    getBookById,
    addBook,
    updateBook,
    deleteBook,
};