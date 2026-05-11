const pool = require("./config/db");

async function testConnection() {
    try {
        const result = await pool.query("SELECT * FROM books");
        console.log(result.rows);
    } catch (error) {
        console.log("Database connection error:", error.message);
    }
}

testConnection();