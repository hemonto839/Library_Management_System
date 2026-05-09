// ===============================
// 1. Data Arrays
// ===============================

const books = [
    {
        id: 1,
        title: "Clean Code",
        author: "Robert C. Martin",
        totalCopies: 5,
        availableCopies: 5,
    },
    {
        id: 2,
        title: "Database System Concepts",
        author: "Silberschatz",
        totalCopies: 3,
        availableCopies: 3,
    },
    {
        id: 3,
        title: "Computer Network",
        author: "Ross",
        totalCopies: 4,
        availableCopies: 4,
    },
];

const students = [
    {
        id: 1,
        name: "Mainul Hasan Asif",
        studentId: "2252421086",
        department: "CSE",
        email: "mainul@example.com",
    },
    {
        id: 2,
        name: "Rahim Uddin",
        studentId: "2252421001",
        department: "CSE",
        email: "rahim@example.com",
    },
    {
        id: 3,
        name: "Karim Ahmed",
        studentId: "2252421002",
        department: "EEE",
        email: "karim@example.com",
    },
];

const borrowRecords = [];


// ===============================
// 2. Helper Functions
// ===============================

function getNextId(array) {
    return array.length + 1;
}

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function getDueDate(daysToAdd) {
    const today = new Date();
    today.setDate(today.getDate() + daysToAdd);
    return today.toISOString().split("T")[0];
}

function calculateFine(dueDate, returnDate) {
    const due = new Date(dueDate);
    const returned = new Date(returnDate);

    if (returned <= due) {
        return 0;
    }

    const differenceInTime = returned - due;
    const lateDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));

    return lateDays * 10;
}


// ===============================
// 3. Book Functions
// ===============================

function getAllBooks() {
    return books;
}

function getBookById(bookId) {
    const book = books.find(function (book) {
        return book.id === bookId;
    });

    if (!book) {
        return {
            success: false,
            message: "Book not found",
            data: null,
        };
    }

    return {
        success: true,
        message: "Book found",
        data: book,
    };
}

function searchBook(keyword) {
    const result = books.filter(function (book) {
        return book.title.toLowerCase().includes(keyword.toLowerCase());
    });

    return result;
}

function addBook(bookData) {
    const newBook = {
        id: getNextId(books),
        title: bookData.title,
        author: bookData.author,
        totalCopies: bookData.totalCopies,
        availableCopies: bookData.availableCopies ?? bookData.totalCopies,
    };

    books.push(newBook);

    return {
        success: true,
        message: "Book added successfully",
        data: newBook,
    };
}

function updateBook(bookId, updatedData) {
    const book = books.find(function (book) {
        return book.id === bookId;
    });

    if (!book) {
        return {
            success: false,
            message: "Book not found",
            data: null,
        };
    }

    book.title = updatedData.title ?? book.title;
    book.author = updatedData.author ?? book.author;
    book.totalCopies = updatedData.totalCopies ?? book.totalCopies;
    book.availableCopies = updatedData.availableCopies ?? book.availableCopies;

    return {
        success: true,
        message: "Book updated successfully",
        data: book,
    };
}

function removeBook(bookId) {
    const bookIndex = books.findIndex(function (book) {
        return book.id === bookId;
    });

    if (bookIndex === -1) {
        return {
            success: false,
            message: "Book not found",
            data: null,
        };
    }

    const activeBorrow = borrowRecords.find(function (record) {
        return record.bookId === bookId && record.status === "borrowed";
    });

    if (activeBorrow) {
        return {
            success: false,
            message: "Cannot delete this book because it is currently borrowed",
            data: null,
        };
    }

    const deletedBook = books.splice(bookIndex, 1)[0];

    return {
        success: true,
        message: "Book removed successfully",
        data: deletedBook,
    };
}


// ===============================
// 4. Student Functions
// ===============================

function getAllStudents() {
    return students;
}

function findStudentById(studentId) {
    const student = students.find(function (student) {
        return student.id === studentId;
    });

    if (!student) {
        return {
            success: false,
            message: "Student not found",
            data: null,
        };
    }

    return {
        success: true,
        message: "Student found",
        data: student,
    };
}

function searchStudentByName(keyword) {
    const result = students.filter(function (student) {
        return student.name.toLowerCase().includes(keyword.toLowerCase());
    });

    return result;
}

function addStudent(studentData) {
    const newStudent = {
        id: getNextId(students),
        name: studentData.name,
        studentId: studentData.studentId,
        department: studentData.department,
        email: studentData.email,
    };

    students.push(newStudent);

    return {
        success: true,
        message: "Student added successfully",
        data: newStudent,
    };
}

function removeStudent(studentId) {
    const studentIndex = students.findIndex(function (student) {
        return student.id === studentId;
    });

    if (studentIndex === -1) {
        return {
            success: false,
            message: "Student not found",
            data: null,
        };
    }

    const activeBorrow = borrowRecords.find(function (record) {
        return record.studentId === studentId && record.status === "borrowed";
    });

    if (activeBorrow) {
        return {
            success: false,
            message: "Cannot delete this student because they currently have borrowed books",
            data: null,
        };
    }

    const deletedStudent = students.splice(studentIndex, 1)[0];

    return {
        success: true,
        message: "Student removed successfully",
        data: deletedStudent,
    };
}


// ===============================
// 5. Borrow / Return Functions
// ===============================

function borrowBook(studentId, bookId) {
    const student = students.find(function (student) {
        return student.id === studentId;
    });

    if (!student) {
        return {
            success: false,
            message: "Student not found",
            data: null,
        };
    }

    const book = books.find(function (book) {
        return book.id === bookId;
    });

    if (!book) {
        return {
            success: false,
            message: "Book not found",
            data: null,
        };
    }

    if (book.availableCopies <= 0) {
        return {
            success: false,
            message: "Book is not available",
            data: null,
        };
    }

    const alreadyBorrowed = borrowRecords.find(function (record) {
        return (
            record.studentId === studentId &&
            record.bookId === bookId &&
            record.status === "borrowed"
        );
    });

    if (alreadyBorrowed) {
        return {
            success: false,
            message: "This student already borrowed this book",
            data: null,
        };
    }

    const newRecord = {
        id: getNextId(borrowRecords),
        studentId: student.id,
        studentName: student.name,
        bookId: book.id,
        bookTitle: book.title,
        borrowDate: getTodayDate(),
        dueDate: getDueDate(14),
        returnDate: null,
        status: "borrowed",
        fineAmount: 0,
    };

    borrowRecords.push(newRecord);
    book.availableCopies -= 1;

    return {
        success: true,
        message: `${student.name} borrowed ${book.title}`,
        data: newRecord,
    };
}

function returnBook(recordId) {
    const record = borrowRecords.find(function (record) {
        return record.id === recordId;
    });

    if (!record) {
        return {
            success: false,
            message: "Borrow record not found",
            data: null,
        };
    }

    if (record.status === "returned") {
        return {
            success: false,
            message: "This book is already returned",
            data: null,
        };
    }

    const book = books.find(function (book) {
        return book.id === record.bookId;
    });

    if (!book) {
        return {
            success: false,
            message: "Book not found",
            data: null,
        };
    }

    record.returnDate = getTodayDate();
    record.fineAmount = calculateFine(record.dueDate, record.returnDate);
    record.status = "returned";

    book.availableCopies += 1;

    return {
        success: true,
        message: `${record.studentName} returned ${record.bookTitle}`,
        data: record,
    };
}

function showStudentBorrowHistory(studentId) {
    const history = borrowRecords.filter(function (record) {
        return record.studentId === studentId;
    });

    return history;
}


// ===============================
// 6. Report / Dashboard Functions
// ===============================

function getTotalBooks() {
    let total = 0;

    books.forEach(function (book) {
        total += book.totalCopies;
    });

    return total;
}

function getAvailableBooks() {
    let total = 0;

    books.forEach(function (book) {
        total += book.availableCopies;
    });

    return total;
}

function getBorrowedBooks() {
    return getTotalBooks() - getAvailableBooks();
}

function getTotalStudents() {
    return students.length;
}

function getTotalFineCollected() {
    let totalFine = 0;

    borrowRecords.forEach(function (record) {
        totalFine += record.fineAmount;
    });

    return totalFine;
}

function getDashboardSummary() {
    return {
        totalBooks: getTotalBooks(),
        availableBooks: getAvailableBooks(),
        borrowedBooks: getBorrowedBooks(),
        totalStudents: getTotalStudents(),
        totalBorrowRecords: borrowRecords.length,
        totalFineCollected: getTotalFineCollected(),
    };
}


// ===============================
// 7. Exports
// ===============================

module.exports = {
    books,
    students,
    borrowRecords,

    getAllBooks,
    getBookById,
    searchBook,
    addBook,
    updateBook,
    removeBook,

    getAllStudents,
    findStudentById,
    searchStudentByName,
    addStudent,
    removeStudent,

    borrowBook,
    returnBook,
    showStudentBorrowHistory,

    getDashboardSummary,
};