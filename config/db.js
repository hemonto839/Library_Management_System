
// import dotenv file
require("dotenv").config();

// Import Pool from the pg package.
// Pool manages PostgreSQL database connections for us.
const { Pool } = require("pg");

// Create a new PostgreSQL connection pool.
// This tells Node.js how to connect to your PostgreSQL database.
const pool = new Pool({
    user: process.env.DB_USER, // PostgreSQL username. Default superuser is usually "postgres".
    host: process.env.DB_HOST, // Since PostgreSQL is installed on your own computer, host is localhost.
    database: process.env.DB_NAME, // This is the database name you created in pgAdmin.
    password: process.env.DB_PASSWORD, // This is your PostgreSQL password.
    port: Number(process.env.DB_PORT),  // Default PostgreSQL port.
});


// Export the pool so other files, like server.js, can use it.
module.exports = pool;