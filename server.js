require("dotenv").config();


const express = require("express");

const authRoutes = require("./routes/auth.routes");
const bookRoutes = require("./routes/book.routes");
const studentRoutes = require("./routes/student.routes");
const borrowRoutes = require("./routes/borrow.routes");
const reportRoutes = require("./routes/report.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static("public"));

// // Basic route
// app.get("/", function (req, res) {
//     res.send("Library Management API Home");
// });

// Health route
app.get("/health", function (req, res) {
    res.json({
        message: "Library Management API is running",
    });
});

// Route groups
app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/students", studentRoutes);
app.use("/", borrowRoutes);
app.use("/reports", reportRoutes);

// Server start
app.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT}`);
});





// require("dotenv").config();

// // Import Express framework.
// const express = require("express");


// // Import PostgreSQL connection pool.
// const pool = require("./config/db");

// // Create Express app.
// const app = express();

// // Server port.
// const PORT = process.env.PORT || 5000;

// // This middleware allows Express to read JSON body data from Postman/frontend.
// // Without this, req.body will be undefined.
// app.use(express.json());





// // ===============================
// // Basic Routes
// // ===============================

// // Home route.
// // This is just to check whether API is reachable.
// app.get("/", function (req, res) {
//     res.send("Library Management API Home");
// });

// // Health route.
// // Used to confirm the server is running properly.
// app.get("/health", function (req, res) {
//     res.json({
//         message: "Library Management API is running",
//     });
// });


// // ===============================
// // Book Routes - PostgreSQL Version
// // ===============================

// // GET /books
// // Fetch all books from PostgreSQL database.
// // Old version used: library.getAllBooks()
// // New version uses: SELECT * FROM books
// app.get("/books", async function (req, res) {
//     try {
//         const result = await pool.query(
//             "SELECT * FROM books ORDER BY id ASC"
//         );

//         res.json({
//             message: "Books fetched successfully",
//             data: result.rows,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while fetching books",
//             error: error.message,
//         });
//     }
// });


// // GET /books/search?keyword=clean
// // Search books by title using PostgreSQL ILIKE.
// // ILIKE means case-insensitive search.
// // Example: clean, Clean, CLEAN all work.
// app.get("/books/search", async function (req, res) {
//     const keyword = req.query.keyword;

//     if (!isNonEmptyString(keyword)) {
//         return res.status(400).json({
//             message: "Keyword is required and must be a non-empty string",
//         });
//     }

//     try {
//         const result = await pool.query(
//             "SELECT * FROM books WHERE title ILIKE $1 ORDER BY id ASC",
//             [`%${keyword}%`]
//         );

//         res.json({
//             message: "Search completed successfully",
//             data: result.rows,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while searching books",
//             error: error.message,
//         });
//     }
// });


// // GET /books/:id
// // Fetch one book by ID from PostgreSQL.
// // Example: GET /books/1
// app.get("/books/:id", async function (req, res) {
//     const bookId = Number(req.params.id);

//     if (!isPositiveNumber(bookId)) {
//         return res.status(400).json({
//             message: "Book ID must be a positive number",
//         });
//     }

//     try {
//         const result = await pool.query(
//             "SELECT * FROM books WHERE id = $1",
//             [bookId]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: "Book not found",
//             });
//         }

//         res.json({
//             message: "Book fetched successfully",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while fetching book",
//             error: error.message,
//         });
//     }
// });


// // POST /books
// // Add a new book into PostgreSQL.
// // User does NOT send id anymore.
// // PostgreSQL automatically creates id using SERIAL.
// app.post("/books", async function (req, res) {
//     const { title, author, totalCopies, availableCopies } = req.body;

//     if (!isNonEmptyString(title)) {
//         return res.status(400).json({
//             message: "Book title is required",
//         });
//     }

//     if (!isNonEmptyString(author)) {
//         return res.status(400).json({
//             message: "Book author is required",
//         });
//     }

//     if (!isPositiveNumber(totalCopies)) {
//         return res.status(400).json({
//             message: "totalCopies must be a positive number",
//         });
//     }

//     // If user does not provide availableCopies,
//     // we automatically make it equal to totalCopies.
//     const finalAvailableCopies =
//         availableCopies === undefined ? totalCopies : availableCopies;

//     if (
//         !Number.isInteger(finalAvailableCopies) ||
//         finalAvailableCopies < 0 ||
//         finalAvailableCopies > totalCopies
//     ) {
//         return res.status(400).json({
//             message: "availableCopies must be between 0 and totalCopies",
//         });
//     }

//     try {
//         const result = await pool.query(
//             `INSERT INTO books (title, author, total_copies, available_copies)
//              VALUES ($1, $2, $3, $4)
//              RETURNING *`,
//             [title, author, totalCopies, finalAvailableCopies]
//         );

//         res.status(201).json({
//             message: "Book added successfully",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while adding book",
//             error: error.message,
//         });
//     }
// });


// // PUT /books/:id
// // Update an existing book in PostgreSQL.
// // Example: PUT /books/1
// // User may send title, author, totalCopies, availableCopies.
// // If any field is missing, old value will remain.
// app.put("/books/:id", async function (req, res) {
//     const bookId = Number(req.params.id);
//     const { title, author, totalCopies, availableCopies } = req.body;

//     if (!isPositiveNumber(bookId)) {
//         return res.status(400).json({
//             message: "Book ID must be a positive number",
//         });
//     }

//     if (title !== undefined && !isNonEmptyString(title)) {
//         return res.status(400).json({
//             message: "Book title must be a non-empty string",
//         });
//     }

//     if (author !== undefined && !isNonEmptyString(author)) {
//         return res.status(400).json({
//             message: "Book author must be a non-empty string",
//         });
//     }

//     if (totalCopies !== undefined && !isPositiveNumber(totalCopies)) {
//         return res.status(400).json({
//             message: "totalCopies must be a positive number",
//         });
//     }

//     if (
//         availableCopies !== undefined &&
//         (!Number.isInteger(availableCopies) || availableCopies < 0)
//     ) {
//         return res.status(400).json({
//             message: "availableCopies must be zero or a positive number",
//         });
//     }

//     try {
//         // First, check whether the book exists.
//         const existingBook = await pool.query(
//             "SELECT * FROM books WHERE id = $1",
//             [bookId]
//         );

//         if (existingBook.rows.length === 0) {
//             return res.status(404).json({
//                 message: "Book not found",
//             });
//         }

//         const currentBook = existingBook.rows[0];

//         // If user gives new value, use it.
//         // Otherwise keep old value.
//         const updatedTitle = title ?? currentBook.title;
//         const updatedAuthor = author ?? currentBook.author;
//         const updatedTotalCopies = totalCopies ?? currentBook.total_copies;
//         const updatedAvailableCopies =
//             availableCopies ?? currentBook.available_copies;

//         if (updatedAvailableCopies > updatedTotalCopies) {
//             return res.status(400).json({
//                 message: "availableCopies cannot be greater than totalCopies",
//             });
//         }

//         const result = await pool.query(
//             `UPDATE books
//              SET title = $1,
//                  author = $2,
//                  total_copies = $3,
//                  available_copies = $4
//              WHERE id = $5
//              RETURNING *`,
//             [
//                 updatedTitle,
//                 updatedAuthor,
//                 updatedTotalCopies,
//                 updatedAvailableCopies,
//                 bookId,
//             ]
//         );

//         res.json({
//             message: "Book updated successfully",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while updating book",
//             error: error.message,
//         });
//     }
// });


// // DELETE /books/:id
// // Delete a book from PostgreSQL.
// // Before deleting, we check if the book is currently borrowed.
// // If borrowed, we do not delete it.
// app.delete("/books/:id", async function (req, res) {
//     const bookId = Number(req.params.id);

//     if (!isPositiveNumber(bookId)) {
//         return res.status(400).json({
//             message: "Book ID must be a positive number",
//         });
//     }

//     try {
//         // Check if this book has any active borrow record.
//         const activeBorrow = await pool.query(
//             `SELECT * FROM borrow_records
//              WHERE book_id = $1 AND status = 'borrowed'`,
//             [bookId]
//         );

//         if (activeBorrow.rows.length > 0) {
//             return res.status(400).json({
//                 message: "Cannot delete this book because it is currently borrowed",
//             });
//         }

//         const result = await pool.query(
//             "DELETE FROM books WHERE id = $1 RETURNING *",
//             [bookId]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: "Book not found",
//             });
//         }

//         res.json({
//             message: "Book deleted successfully",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while deleting book",
//             error: error.message,
//         });
//     }
// });


// // ===============================
// // Student Routes - PostgreSQL Version
// // ===============================

// // GET /students
// // Fetch all students from PostgreSQL.
// app.get("/students", async function (req, res) {
//     try {
//         const result = await pool.query(
//             "SELECT * FROM students ORDER BY id ASC"
//         );

//         res.json({
//             message: "Students fetched successfully",
//             data: result.rows,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while fetching students",
//             error: error.message,
//         });
//     }
// });


// // GET /students/search?keyword=arka
// // Search students by name using PostgreSQL ILIKE.
// app.get("/students/search", async function (req, res) {
//     const keyword = req.query.keyword;

//     if (!isNonEmptyString(keyword)) {
//         return res.status(400).json({
//             message: "Keyword is required and must be a non-empty string",
//         });
//     }

//     try {
//         const result = await pool.query(
//             "SELECT * FROM students WHERE name ILIKE $1 ORDER BY id ASC",
//             [`%${keyword}%`]
//         );

//         res.json({
//             message: "Student search completed successfully",
//             data: result.rows,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while searching students",
//             error: error.message,
//         });
//     }
// });


// // GET /students/:id
// // Fetch one student by internal database ID.
// app.get("/students/:id", async function (req, res) {
//     const studentId = Number(req.params.id);

//     if (!isPositiveNumber(studentId)) {
//         return res.status(400).json({
//             message: "Student ID must be a positive number",
//         });
//     }

//     try {
//         const result = await pool.query(
//             "SELECT * FROM students WHERE id = $1",
//             [studentId]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: "Student not found",
//             });
//         }

//         res.json({
//             message: "Student fetched successfully",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while fetching student",
//             error: error.message,
//         });
//     }
// });


// // POST /students
// // Add a new student.
// // User does not send internal id. PostgreSQL auto-generates it.
// app.post("/students", async function (req, res) {
//     const { name, studentId, department, email } = req.body;

//     if (!isNonEmptyString(name)) {
//         return res.status(400).json({
//             message: "Student name is required",
//         });
//     }

//     if (!isNonEmptyString(studentId)) {
//         return res.status(400).json({
//             message: "Student university ID is required",
//         });
//     }

//     if (!isNonEmptyString(department)) {
//         return res.status(400).json({
//             message: "Department is required",
//         });
//     }

//     if (!isValidEmail(email)) {
//         return res.status(400).json({
//             message: "Valid email is required",
//         });
//     }

//     try {
//         const result = await pool.query(
//             `INSERT INTO students (name, student_id, department, email)
//              VALUES ($1, $2, $3, $4)
//              RETURNING *`,
//             [name, studentId, department, email]
//         );

//         res.status(201).json({
//             message: "Student added successfully",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         // PostgreSQL error code 23505 means UNIQUE constraint violation.
//         // Example: same email or same student_id already exists.
//         if (error.code === "23505") {
//             return res.status(400).json({
//                 message: "Student ID or email already exists",
//             });
//         }

//         res.status(500).json({
//             message: "Server error while adding student",
//             error: error.message,
//         });
//     }
// });


// // DELETE /students/:id
// // Delete student by internal database ID.
// // Before deleting, check if student has active borrowed books.
// app.delete("/students/:id", async function (req, res) {
//     const studentId = Number(req.params.id);

//     if (!isPositiveNumber(studentId)) {
//         return res.status(400).json({
//             message: "Student ID must be a positive number",
//         });
//     }

//     try {
//         const activeBorrow = await pool.query(
//             `SELECT * FROM borrow_records
//              WHERE student_id = $1 AND status = 'borrowed'`,
//             [studentId]
//         );

//         if (activeBorrow.rows.length > 0) {
//             return res.status(400).json({
//                 message: "Cannot delete this student because they currently have borrowed books",
//             });
//         }

//         const result = await pool.query(
//             "DELETE FROM students WHERE id = $1 RETURNING *",
//             [studentId]
//         );

//         if (result.rows.length === 0) {
//             return res.status(404).json({
//                 message: "Student not found",
//             });
//         }

//         res.json({
//             message: "Student deleted successfully",
//             data: result.rows[0],
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while deleting student",
//             error: error.message,
//         });
//     }
// });

// // ===============================
// // Borrow / Return Routes - PostgreSQL Version
// // ===============================

// // POST /borrow
// // Allows a student to borrow a book.
// // This uses a PostgreSQL transaction because we need to:
// // 1. Insert borrow record
// // 2. Decrease available copies
// // Both should succeed together, or both should fail together.
// app.post("/borrow", async function (req, res) {
//     const { studentId, bookId } = req.body;

//     if (!isPositiveNumber(studentId)) {
//         return res.status(400).json({
//             message: "studentId must be a positive number",
//         });
//     }

//     if (!isPositiveNumber(bookId)) {
//         return res.status(400).json({
//             message: "bookId must be a positive number",
//         });
//     }

//     // Get a database client from the pool.
//     const client = await pool.connect();

//     try {
//         // Start transaction.
//         await client.query("BEGIN");

//         // Check if student exists.
//         const studentResult = await client.query(
//             "SELECT * FROM students WHERE id = $1",
//             [studentId]
//         );

//         if (studentResult.rows.length === 0) {
//             await client.query("ROLLBACK");
//             return res.status(404).json({
//                 message: "Student not found",
//             });
//         }

//         const student = studentResult.rows[0];

//         // Check if book exists.
//         // FOR UPDATE locks this book row during the transaction.
//         // This helps prevent two users from borrowing the last copy at the same time.
//         const bookResult = await client.query(
//             "SELECT * FROM books WHERE id = $1 FOR UPDATE",
//             [bookId]
//         );

//         if (bookResult.rows.length === 0) {
//             await client.query("ROLLBACK");
//             return res.status(404).json({
//                 message: "Book not found",
//             });
//         }

//         const book = bookResult.rows[0];

//         // Check if book has available copies.
//         if (book.available_copies <= 0) {
//             await client.query("ROLLBACK");
//             return res.status(400).json({
//                 message: "Book is not available",
//             });
//         }

//         // Check if this student already borrowed this same book and has not returned it yet.
//         const alreadyBorrowed = await client.query(
//             `SELECT * FROM borrow_records
//              WHERE student_id = $1
//              AND book_id = $2
//              AND status = 'borrowed'`,
//             [studentId, bookId]
//         );

//         if (alreadyBorrowed.rows.length > 0) {
//             await client.query("ROLLBACK");
//             return res.status(400).json({
//                 message: "This student already borrowed this book",
//             });
//         }

//         // Insert borrow record.
//         const borrowResult = await client.query(
//             `INSERT INTO borrow_records (student_id, book_id, due_date)
//              VALUES ($1, $2, CURRENT_DATE + INTERVAL '14 days')
//              RETURNING *`,
//             [studentId, bookId]
//         );

//         // Decrease available copies.
//         await client.query(
//             `UPDATE books
//              SET available_copies = available_copies - 1
//              WHERE id = $1`,
//             [bookId]
//         );

//         // Commit transaction.
//         await client.query("COMMIT");

//         res.status(201).json({
//             message: `${student.name} borrowed ${book.title}`,
//             data: borrowResult.rows[0],
//         });
//     } catch (error) {
//         // If anything unexpected goes wrong, undo all transaction work.
//         await client.query("ROLLBACK");

//         res.status(500).json({
//             message: "Server error while borrowing book",
//             error: error.message,
//         });
//     } finally {
//         // Always release client back to pool.
//         client.release();
//     }
// });


// // POST /return
// // Returns a borrowed book.
// // This also uses transaction because we need to:
// // 1. Update borrow record
// // 2. Increase available copies
// app.post("/return", async function (req, res) {
//     const { recordId } = req.body;

//     if (!isPositiveNumber(recordId)) {
//         return res.status(400).json({
//             message: "recordId must be a positive number",
//         });
//     }

//     const client = await pool.connect();

//     try {
//         await client.query("BEGIN");

//         // Find active borrow record.
//         const recordResult = await client.query(
//             `SELECT br.*, s.name AS student_name, b.title AS book_title
//              FROM borrow_records br
//              JOIN students s ON br.student_id = s.id
//              JOIN books b ON br.book_id = b.id
//              WHERE br.id = $1
//              FOR UPDATE`,
//             [recordId]
//         );

//         if (recordResult.rows.length === 0) {
//             await client.query("ROLLBACK");
//             return res.status(404).json({
//                 message: "Borrow record not found",
//             });
//         }

//         const record = recordResult.rows[0];

//         if (record.status === "returned") {
//             await client.query("ROLLBACK");
//             return res.status(400).json({
//                 message: "This book is already returned",
//             });
//         }

//         // Calculate fine in PostgreSQL.
//         // If CURRENT_DATE > due_date, fine = late days * 10.
//         // Otherwise fine = 0.
//         const updatedRecord = await client.query(
//             `UPDATE borrow_records
//              SET return_date = CURRENT_DATE,
//                  fine_amount = GREATEST((CURRENT_DATE - due_date), 0) * 10,
//                  status = 'returned'
//              WHERE id = $1
//              RETURNING *`,
//             [recordId]
//         );

//         // Increase available copies.
//         await client.query(
//             `UPDATE books
//              SET available_copies = available_copies + 1
//              WHERE id = $1`,
//             [record.book_id]
//         );

//         await client.query("COMMIT");

//         res.json({
//             message: `${record.student_name} returned ${record.book_title}`,
//             data: updatedRecord.rows[0],
//         });
//     } catch (error) {
//         await client.query("ROLLBACK");

//         res.status(500).json({
//             message: "Server error while returning book",
//             error: error.message,
//         });
//     } finally {
//         client.release();
//     }
// });


// // GET /students/:id/history
// // Shows borrow history of one student using JOIN.
// // This gives student + book information together.
// app.get("/students/:id/history", async function (req, res) {
//     const studentId = Number(req.params.id);

//     if (!isPositiveNumber(studentId)) {
//         return res.status(400).json({
//             message: "Student ID must be a positive number",
//         });
//     }

//     try {
//         // First check student exists.
//         const studentResult = await pool.query(
//             "SELECT * FROM students WHERE id = $1",
//             [studentId]
//         );

//         if (studentResult.rows.length === 0) {
//             return res.status(404).json({
//                 message: "Student not found",
//             });
//         }

//         const historyResult = await pool.query(
//             `SELECT
//                 br.id AS record_id,
//                 br.student_id,
//                 s.name AS student_name,
//                 br.book_id,
//                 b.title AS book_title,
//                 br.borrow_date,
//                 br.due_date,
//                 br.return_date,
//                 br.status,
//                 br.fine_amount
//              FROM borrow_records br
//              JOIN students s ON br.student_id = s.id
//              JOIN books b ON br.book_id = b.id
//              WHERE br.student_id = $1
//              ORDER BY br.id ASC`,
//             [studentId]
//         );

//         res.json({
//             message: "Student borrow history fetched successfully",
//             data: historyResult.rows,
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while fetching student history",
//             error: error.message,
//         });
//     }
// });

// // ===============================
// // Report Routes - PostgreSQL Version
// // ===============================

// // GET /reports/summary
// // Shows dashboard summary using PostgreSQL data.
// app.get("/reports/summary", async function (req, res) {
//     try {
//         // Total copies of all books
//         const totalBooksResult = await pool.query(
//             "SELECT COALESCE(SUM(total_copies), 0) AS total_books FROM books"
//         );

//         // Total available copies
//         const availableBooksResult = await pool.query(
//             "SELECT COALESCE(SUM(available_copies), 0) AS available_books FROM books"
//         );

//         // Total students
//         const totalStudentsResult = await pool.query(
//             "SELECT COUNT(*) AS total_students FROM students"
//         );

//         // Total borrow records
//         const totalBorrowRecordsResult = await pool.query(
//             "SELECT COUNT(*) AS total_borrow_records FROM borrow_records"
//         );

//         // Currently borrowed books
//         const borrowedBooksResult = await pool.query(
//             "SELECT COUNT(*) AS borrowed_books FROM borrow_records WHERE status = 'borrowed'"
//         );

//         // Total fine collected
//         const totalFineResult = await pool.query(
//             "SELECT COALESCE(SUM(fine_amount), 0) AS total_fine_collected FROM borrow_records"
//         );

//         res.json({
//             message: "Dashboard summary fetched successfully",
//             data: {
//                 totalBooks: Number(totalBooksResult.rows[0].total_books),
//                 availableBooks: Number(availableBooksResult.rows[0].available_books),
//                 borrowedBooks: Number(borrowedBooksResult.rows[0].borrowed_books),
//                 totalStudents: Number(totalStudentsResult.rows[0].total_students),
//                 totalBorrowRecords: Number(totalBorrowRecordsResult.rows[0].total_borrow_records),
//                 totalFineCollected: Number(totalFineResult.rows[0].total_fine_collected),
//             },
//         });
//     } catch (error) {
//         res.status(500).json({
//             message: "Server error while fetching dashboard summary",
//             error: error.message,
//         });
//     }
// });


// // ===============================
// // Server Start
// // ===============================

// app.listen(PORT, function () {
//     console.log(`Server is listening on port ${PORT}`);
// });