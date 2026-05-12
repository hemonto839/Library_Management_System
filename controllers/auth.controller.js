const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../config/db");

const {
    isNonEmptyString,
    isValidEmail,
} = require("../utils/validation");

// Register
async function register(req, res) {
    const { name, email, password, role, student_id } = req.body;

    if (!isNonEmptyString(name)) {
        return res.status(400).json({
            message: "Name is required",
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: "Valid email is required",
        });
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

    // Only student role needs student_id
    // This student_id means students.id from students table
    if (role === "student") {
        if (!student_id) {
            return res.status(400).json({
                message: "Student database ID is required for student role",
            });
        }

        if (typeof student_id !== "number") {
            return res.status(400).json({
                message: "student_id must be a number",
            });
        }
    }

    try {
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role, student_id)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, email, role, student_id, created_at`,
            [
                name,
                email,
                password_hash,
                role,
                role === "student" ? student_id : null,
            ]
        );

        res.status(201).json({
            message: "User registered successfully",
            user: result.rows[0],
        });

    } catch (error) {
        console.error(error);

        if (error.code === "23505") {
            return res.status(400).json({
                message: "Email already exists",
            });
        }

        if (error.code === "23503") {
            return res.status(400).json({
                message: "Invalid student database ID. Student does not exist.",
            });
        }

        res.status(500).json({
            message: "Server error during registration",
        });
    }
}

// Login
async function login(req, res) {
    const { email, password } = req.body;

    if (!isValidEmail(email)) {
        return res.status(400).json({
            message: "Valid email is required",
        });
    }

    if (!isNonEmptyString(password)) {
        return res.status(400).json({
            message: "Password is required",
        });
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

        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d",
            }
        );

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
        });

        res.json({
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                student_id: user.student_id,
            },
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error during login",
        });
    }
}

// Logout User
function logout(req, res) {
    res.clearCookie("token");

    res.json({
        message: "Logout successful",
    });
}

// Current Logged in User
function getMe(req, res) {
    res.json({
        user: req.user,
    });
}

module.exports = {
    register,
    login,
    logout,
    getMe,
};