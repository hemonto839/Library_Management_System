const API_BASE_URL = "";

function showMessage(data) {
    document.getElementById("messageBox").textContent = JSON.stringify(data, null, 2);
}

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/reports/summary`);
        const result = await response.json();

        const data = result.data;

        document.getElementById("dashboardCards").innerHTML = `
            <div class="card">
                <h3>Total Books</h3>
                <p>${data.totalBooks}</p>
            </div>
            <div class="card">
                <h3>Available Books</h3>
                <p>${data.availableBooks}</p>
            </div>
            <div class="card">
                <h3>Borrowed Books</h3>
                <p>${data.borrowedBooks}</p>
            </div>
            <div class="card">
                <h3>Total Students</h3>
                <p>${data.totalStudents}</p>
            </div>
            <div class="card">
                <h3>Borrow Records</h3>
                <p>${data.totalBorrowRecords}</p>
            </div>
            <div class="card">
                <h3>Total Fine</h3>
                <p>${data.totalFineCollected}</p>
            </div>
        `;
    } catch (error) {
        showMessage({ error: error.message });
    }
}

async function loadBooks() {
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        const result = await response.json();

        const rows = result.data.map(function (book) {
            return `
                <tr>
                    <td>${book.id}</td>
                    <td>${book.title}</td>
                    <td>${book.author}</td>
                    <td>${book.total_copies}</td>
                    <td>${book.available_copies}</td>
                </tr>
            `;
        }).join("");

        document.getElementById("booksTable").innerHTML = rows;
    } catch (error) {
        showMessage({ error: error.message });
    }
}

async function loadStudents() {
    try {
        const response = await fetch(`${API_BASE_URL}/students`);
        const result = await response.json();

        const rows = result.data.map(function (student) {
            return `
                <tr>
                    <td>${student.id}</td>
                    <td>${student.name}</td>
                    <td>${student.student_id}</td>
                    <td>${student.department}</td>
                    <td>${student.email}</td>
                </tr>
            `;
        }).join("");

        document.getElementById("studentsTable").innerHTML = rows;
    } catch (error) {
        showMessage({ error: error.message });
    }
}

document.getElementById("addBookForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const title = document.getElementById("bookTitle").value;
    const author = document.getElementById("bookAuthor").value;
    const totalCopies = Number(document.getElementById("totalCopies").value);
    const availableCopiesValue = document.getElementById("availableCopies").value;

    const body = {
        title,
        author,
        totalCopies,
    };

    if (availableCopiesValue !== "") {
        body.availableCopies = Number(availableCopiesValue);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        showMessage(result);

        this.reset();
        loadBooks();
        loadDashboard();
    } catch (error) {
        showMessage({ error: error.message });
    }
});

document.getElementById("addStudentForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const body = {
        name: document.getElementById("studentName").value,
        studentId: document.getElementById("studentUniversityId").value,
        department: document.getElementById("studentDepartment").value,
        email: document.getElementById("studentEmail").value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        showMessage(result);

        this.reset();
        loadStudents();
        loadDashboard();
    } catch (error) {
        showMessage({ error: error.message });
    }
});

document.getElementById("borrowForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const body = {
        studentId: Number(document.getElementById("borrowStudentId").value),
        bookId: Number(document.getElementById("borrowBookId").value),
    };

    try {
        const response = await fetch(`${API_BASE_URL}/borrow`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        showMessage(result);

        this.reset();
        loadBooks();
        loadDashboard();
    } catch (error) {
        showMessage({ error: error.message });
    }
});

document.getElementById("returnForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const body = {
        recordId: Number(document.getElementById("returnRecordId").value),
    };

    try {
        const response = await fetch(`${API_BASE_URL}/return`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        showMessage(result);

        this.reset();
        loadBooks();
        loadDashboard();
    } catch (error) {
        showMessage({ error: error.message });
    }
});

loadDashboard();
loadBooks();
loadStudents();