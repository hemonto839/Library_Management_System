const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const {
    isNonEmptyString,
    isValidEmail,
} = require("../utils/validation");

// Create JWT token
function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d",
        }
    );
}

// POST /auth/register
async function register(req, res) {
    const { name, email, password, role, studentId } = req.body;

    if (!isNonEmptyString(name)) {
        return res.status(400).json({ message: "Name is required" });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Valid email is required" });
    }

    if (!isNonEmptyString(password) || password.length < 6) {
        return res.status(400).json({
            message: "Password must be at least 6 characters",
        });
    }

    if (!["admin", "librarian", "student"].includes(role)) {
        return res.status(400).json({
            message: "Role must be admin, librarian, or student",
        });
    }

    if (role === "student" && studentId !== undefined && typeof studentId !== "number") {
        return res.status(400).json({
            message: "studentId must be a number if provided",
        });
    }

    try {
        // If role is student and studentId provided, check that student exists
        if (role === "student" && studentId !== undefined) {
            const studentResult = await pool.query(
                "SELECT * FROM students WHERE id = $1",
                [studentId]
            );

            if (studentResult.rows.length === 0) {
                return res.status(404).json({
                    message: "Linked student profile not found",
                });
            }
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, student_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, student_id, created_at`,
            [name, email, passwordHash, role, studentId || null]
        );

        res.status(201).json({
            message: "User registered successfully",
            data: result.rows[0],
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        res.status(500).json({
            message: "Server error while registering user",
            error: error.message,
        });
    }
}

// POST /auth/login
async function login(req, res) {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: "Valid email is required" });
    }

    if (!isNonEmptyString(password)) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = generateToken(user);

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.student_id,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Server error while logging in",
            error: error.message,
        });
    }
}

// GET /auth/me
async function getMe(req, res) {
    res.json({
        message: "Current user fetched successfully",
        user: req.user,
    });
}

module.exports = {
    register,
    login,
    getMe,
};