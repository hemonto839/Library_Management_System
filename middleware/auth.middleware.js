const jwt = require("jsonwebtoken");
const pool = require("../config/db");

async function protect (req, res, next) {
    try{
        const token = req.cookies.token;

        if(!token) {
            return res.status(401).json({
                message: "Not authenticated, Please try again",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            `SELECT id, name, email, role, student_id
             FROM users
             WHERE id = $1`,
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        req.user = result.rows[0];

        next();

    } catch(error){
        return res.status(401).json({
            message: "Invalid or expired token",
        });
    }
}

module.exports = {
    protect,
};