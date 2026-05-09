const express = require("express");

const {
    books,
    searchBook,
    addBook,
    borrowBook,
    returnBook
} = require("./library");

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", function (req, res) {
    res.send("Library Management API Home");
});

app.get("/health", function (req, res) {
    res.json({
        message: "Library Management API is running"
    });
});

app.get("/books", function (req, res) {
    res.json(books);
});

app.get("/books/search", function (req, res) {
    const keyword = req.query.keyword;

    if (!keyword) {
        return res.status(400).json({
            message: "Keyword is required"
        });
    }

    const result = searchBook(keyword);
    res.json(result);
});

app.post("/books", function (req, res) {
    const newBook = req.body;

    addBook(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
    res.send(newBook)
});

app.post("/borrow", function (req, res) {
    const { studentId, bookId } = req.body;

    borrowBook(studentId, bookId);

    res.json({
        message: "Borrow request processed"
    });
});

app.post("/return", function (req, res) {
    const { recordId } = req.body;

    returnBook(recordId);

    res.json({
        message: "Return request processed"
    });
});

app.listen(PORT, function () {
    console.log(`Server is listening on port ${PORT}`);
});