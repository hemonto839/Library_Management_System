require("dotenv").config();


const express = require("express");

const authRoutes = require("./routes/auth.routes");
const bookRoutes = require("./routes/book.routes");
const studentRoutes = require("./routes/student.routes");
const borrowRoutes = require("./routes/borrow.routes");
const reportRoutes = require("./routes/report.routes");
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json());
app.use(express.static("public"));

// Basic route
app.get("/", function (req, res) {
    res.redirect("/login.html");
});

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



