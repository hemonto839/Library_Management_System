const pool = require("../config/db");

const {
    isPositiveNumber,
    isNonEmptyString,
    isValidEmail,
} = require("../utils/validation");

// GET /students
// Fetch all students from PostgreSQL
async function getAllStudents(req, res) {
    try {
        const result = await pool.query(
            "SELECT * FROM students ORDER BY id ASC"
        );

        res.json({
            message: "Students fetched successfully",
            data: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching students",
            error: error.message,
        });
    }
}

// GET /students/search?keyword=arka
// Search students by name
async function searchStudents(req, res) {
    const keyword = req.query.keyword;

    if (!isNonEmptyString(keyword)) {
        return res.status(400).json({
            message: "Keyword is required and must be a non-empty string",
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE name ILIKE $1 ORDER BY id ASC",
            [`%${keyword}%`]
        );

        res.json({
            message: "Student search completed successfully",
            data: result.rows,
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while searching students",
            error: error.message,
        });
    }
}

// GET /students/:id
// Fetch one student by database ID
async function getStudentById(req, res) {
    const studentId = Number(req.params.id);

    if (!isPositiveNumber(studentId)) {
        return res.status(400).json({
            message: "Student ID must be a positive number",
        });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        res.json({
            message: "Student fetched successfully",
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while fetching student",
            error: error.message,
        });
    }
}

// POST /students
// Add a new student
async function addStudent(req, res) {
    const { name, studentId, department, email } = req.body;

    if (!isNonEmptyString(name)) {
        return res.status(400).json({
            message: "Student name is required",
        });
    }

    if (!isNonEmptyString(studentId)) {
        return res.status(400).json({
            message: "Student university ID is required",
        });
    }

    if (!isNonEmptyString(department)) {
        return res.status(400).json({
            message: "Department is required",
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: "Valid email is required",
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO students (name, student_id, department, email)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [name, studentId, department, email]
        );

        res.status(201).json({
            message: "Student added successfully",
            data: result.rows[0],
        });
    } catch (error) {
        // 23505 = unique constraint violation
        // Example: duplicate student_id or email
        if (error.code === "23505") {
            return res.status(400).json({
                message: "Student ID or email already exists",
            });
        }

        res.status(500).json({
            message: "Server error while adding student",
            error: error.message,
        });
    }
}

// PUT /students/:id
// Update student information
async function updateStudent(req, res) {
    const id = Number(req.params.id);
    const { name, studentId, department, email } = req.body;

    if (!isPositiveNumber(id)) {
        return res.status(400).json({
            message: "Student ID must be a positive number",
        });
    }

    if (name !== undefined && !isNonEmptyString(name)) {
        return res.status(400).json({
            message: "Student name must be a non-empty string",
        });
    }

    if (studentId !== undefined && !isNonEmptyString(studentId)) {
        return res.status(400).json({
            message: "Student university ID must be a non-empty string",
        });
    }

    if (department !== undefined && !isNonEmptyString(department)) {
        return res.status(400).json({
            message: "Department must be a non-empty string",
        });
    }

    if (email !== undefined && !isValidEmail(email)) {
        return res.status(400).json({
            message: "Valid email is required",
        });
    }

    try {
        const existingStudent = await pool.query(
            "SELECT * FROM students WHERE id = $1",
            [id]
        );

        if (existingStudent.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        const currentStudent = existingStudent.rows[0];

        const updatedName = name ?? currentStudent.name;
        const updatedStudentId = studentId ?? currentStudent.student_id;
        const updatedDepartment = department ?? currentStudent.department;
        const updatedEmail = email ?? currentStudent.email;

        const result = await pool.query(
            `UPDATE students
             SET name = $1,
                 student_id = $2,
                 department = $3,
                 email = $4
             WHERE id = $5
             RETURNING *`,
            [
                updatedName,
                updatedStudentId,
                updatedDepartment,
                updatedEmail,
                id,
            ]
        );

        res.json({
            message: "Student updated successfully",
            data: result.rows[0],
        });

    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                message: "Student ID or email already exists",
            });
        }

        res.status(500).json({
            message: "Server error while updating student",
            error: error.message,
        });
    }
}

// DELETE /students/:id
// Delete a student if they have no active borrowed books
async function deleteStudent(req, res) {
    const studentId = Number(req.params.id);

    if (!isPositiveNumber(studentId)) {
        return res.status(400).json({
            message: "Student ID must be a positive number",
        });
    }

    try {
        const activeBorrow = await pool.query(
            `SELECT * FROM borrow_records
             WHERE student_id = $1 AND status = 'borrowed'`,
            [studentId]
        );

        if (activeBorrow.rows.length > 0) {
            return res.status(400).json({
                message: "Cannot delete this student because they currently have borrowed books",
            });
        }

        const result = await pool.query(
            "DELETE FROM students WHERE id = $1 RETURNING *",
            [studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Student not found",
            });
        }

        res.json({
            message: "Student deleted successfully",
            data: result.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while deleting student",
            error: error.message,
        });
    }
}

module.exports = {
    getAllStudents,
    searchStudents,
    getStudentById,
    addStudent,
    updateStudent,
    deleteStudent,
};