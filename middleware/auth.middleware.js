const jwt = require("jsonwebtoken");
const pool = require("../config/db");

// protect middleware
// Verifies the JWT token from the Authorization header.
// Attaches the authenticated user to req.user so downstream
// route handlers know who is making the request.
async function protect(req, res, next) {
    let token;

    // Expect: Authorization: Bearer <token>
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({
            message: "Not authorized, no token provided",
        });
    }

    try {
        // Verify token signature and expiry
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch fresh user data from DB (so revoked accounts are handled)
        const result = await pool.query(
            "SELECT id, name, email, role, student_id FROM users WHERE id = $1",
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Not authorized, user not found",
            });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Not authorized, invalid or expired token",
        });
    }
}

module.exports = { protect };
