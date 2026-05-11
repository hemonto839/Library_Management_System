const pool = require("../config/db");

const {
    isPositiveNumber,
} = require("../utils/validation");

// POST /borrow
// Borrow a book using PostgreSQL transaction
async function borrowBook(req, res) {
    const { studentId, bookId } = req.body;

    if (!isPositiveNumber(studentId)) {
        return res.status(400).json({
            message: "studentId must be a positive number",
        });
    }

    if (!isPositiveNumber(bookId)) {
        return res.status(400).json({
            message: "bookId must be a positive number",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Check student exists
        const studentResult = await client.query(
            "SELECT * FROM students WHERE id = $1",
            [studentId]
        );

        if (studentResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message: "Student not found",
            });
        }

        const student = studentResult.rows[0];

        // Check book exists and lock book row during transaction
        const bookResult = await client.query(
            "SELECT * FROM books WHERE id = $1 FOR UPDATE",
            [bookId]
        );

        if (bookResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message: "Book not found",
            });
        }

        const book = bookResult.rows[0];

        // Check availability
        if (book.available_copies <= 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "Book is not available",
            });
        }

        // Prevent same student borrowing same book twice before returning
        const alreadyBorrowed = await client.query(
            `SELECT * FROM borrow_records
             WHERE student_id = $1
             AND book_id = $2
             AND status = 'borrowed'`,
            [studentId, bookId]
        );

        if (alreadyBorrowed.rows.length > 0) {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "This student already borrowed this book",
            });
        }

        // Create borrow record
        const borrowResult = await client.query(
            `INSERT INTO borrow_records (student_id, book_id, due_date)
             VALUES ($1, $2, CURRENT_DATE + INTERVAL '14 days')
             RETURNING *`,
            [studentId, bookId]
        );

        // Decrease available copies
        await client.query(
            `UPDATE books
             SET available_copies = available_copies - 1
             WHERE id = $1`,
            [bookId]
        );

        await client.query("COMMIT");

        res.status(201).json({
            message: `${student.name} borrowed ${book.title}`,
            data: borrowResult.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");

        res.status(500).json({
            message: "Server error while borrowing book",
            error: error.message,
        });
    } finally {
        client.release();
    }
}

// POST /return
// Return a borrowed book using borrow record ID
async function returnBook(req, res) {
    const { recordId } = req.body;

    if (!isPositiveNumber(recordId)) {
        return res.status(400).json({
            message: "recordId must be a positive number",
        });
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Find borrow record with student and book details
        const recordResult = await client.query(
            `SELECT br.*, s.name AS student_name, b.title AS book_title
             FROM borrow_records br
             JOIN students s ON br.student_id = s.id
             JOIN books b ON br.book_id = b.id
             WHERE br.id = $1
             FOR UPDATE`,
            [recordId]
        );

        if (recordResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({
                message: "Borrow record not found",
            });
        }

        const record = recordResult.rows[0];

        if (record.status === "returned") {
            await client.query("ROLLBACK");
            return res.status(400).json({
                message: "This book is already returned",
            });
        }

        // Update borrow record with return date, fine, and returned status
        const updatedRecord = await client.query(
            `UPDATE borrow_records
             SET return_date = CURRENT_DATE,
                 fine_amount = GREATEST((CURRENT_DATE - due_date), 0) * 10,
                 status = 'returned'
             WHERE id = $1
             RETURNING *`,
            [recordId]
        );

        // Increase available copies
        await client.query(
            `UPDATE books
             SET available_copies = available_copies + 1
             WHERE id = $1`,
            [record.book_id]
        );

        await client.query("COMMIT");

        res.json({
            message: `${record.student_name} returned ${record.book_title}`,
            data: updatedRecord.rows[0],
        });
    } catch (error) {
        await client.query("ROLLBACK");

        res.status(500).json({
            message: "Server error while returning book",
            error: error.message,
        });
    } finally {
        client.release();
    }
}

// GET /students/:id/history
// Get borrow history for a specific student
async function getStudentHistory(req, res) {
    const studentId = Number(req.params.id);

    if (!isPositiveNumber(studentId)) {
        return res.status(400).json({
            message: "Student ID must be a positive number",
        });
    }

    try {
        // Check student exists
        const studentResult = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [studentId]
        );

        if (studentResult.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        // Fetch history with JOIN
        const historyResult = await pool.query(
            `SELECT
                br.id AS record_id,
                br.student_id,
                s.name AS student_name,
                br.book_id,
                b.title AS book_title,
                br.borrow_date,
                br.due_date,
                br.return_date,
                br.status,
                br.fine_amount
             FROM borrow_records br
             JOIN students s ON br.student_id = s.id
             JOIN books b ON br.book_id = b.id
             WHERE br.student_id = $1
             ORDER BY br.id ASC`,
            [studentId]
        );

        res.json({
            message: "Student borrow history fetched successfully",
            data: historyResult.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching student history",
            error: error.message,
        });
    }
}

module.exports = {
    borrowBook,
    returnBook,
    getStudentHistory,
};