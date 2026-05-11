const pool = require("../config/db");

// GET /reports/summary
// Fetch dashboard summary from PostgreSQL
async function getDashboardSummary(req, res) {
    try {
        // Total book copies
        const totalBooksResult = await pool.query(
            "SELECT COALESCE(SUM(total_copies), 0) AS total_books FROM books"
        );

        // Available book copies
        const availableBooksResult = await pool.query(
            "SELECT COALESCE(SUM(available_copies), 0) AS available_books FROM books"
        );

        // Total students
        const totalStudentsResult = await pool.query(
            "SELECT COUNT(*) AS total_students FROM students"
        );

        // Total borrow records
        const totalBorrowRecordsResult = await pool.query(
            "SELECT COUNT(*) AS total_borrow_records FROM borrow_records"
        );

        // Currently borrowed books
        const borrowedBooksResult = await pool.query(
            "SELECT COUNT(*) AS borrowed_books FROM borrow_records WHERE status = 'borrowed'"
        );

        // Total fine collected
        const totalFineResult = await pool.query(
            "SELECT COALESCE(SUM(fine_amount), 0) AS total_fine_collected FROM borrow_records"
        );

        res.json({
            message: "Dashboard summary fetched successfully",
            data: {
                totalBooks: Number(totalBooksResult.rows[0].total_books),
                availableBooks: Number(availableBooksResult.rows[0].available_books),
                borrowedBooks: Number(borrowedBooksResult.rows[0].borrowed_books),
                totalStudents: Number(totalStudentsResult.rows[0].total_students),
                totalBorrowRecords: Number(totalBorrowRecordsResult.rows[0].total_borrow_records),
                totalFineCollected: Number(totalFineResult.rows[0].total_fine_collected),
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching dashboard summary",
            error: error.message,
        });
    }
}

module.exports = {
    getDashboardSummary,
};