// ─── dashboard.js ─────────────────────────────────────────────────────────────
// Role-based navigation and all section logic.

// ── Init ─────────────────────────────────────────────────────────────────────
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    currentUser = requireAuth();
    if (!currentUser) return;
    renderSidebar();
    renderUserCard();
    navigateTo("dashboard");
    loadDashboard();
});

function logout() {
    clearAuth();
    location.href = "/index.html";
}

// ── Sidebar nav config by role ────────────────────────────────────────────────
const NAV = {
    admin: [
        { id: "dashboard", icon: "📊", label: "Dashboard" },
        { id: "books",     icon: "📚", label: "Books" },
        { id: "students",  icon: "🎓", label: "Students" },
        { id: "borrow",    icon: "📖", label: "Borrow / Return" },
    ],
    librarian: [
        { id: "dashboard", icon: "📊", label: "Dashboard" },
        { id: "books",     icon: "📚", label: "Books" },
        { id: "borrow",    icon: "📖", label: "Borrow / Return" },
    ],
    student: [
        { id: "browse",      icon: "🔍", label: "Browse Books" },
        { id: "my-history",  icon: "📋", label: "My History" },
    ],
};

function renderSidebar() {
    const role = currentUser.role;
    const items = NAV[role] || [];
    const nav = document.getElementById("sidebar-nav");
    nav.innerHTML = items.map(item => `
        <button class="nav-item" id="nav-${item.id}" onclick="navigateTo('${item.id}')">
            <span class="nav-icon">${item.icon}</span>
            ${item.label}
        </button>
    `).join("");
}

function renderUserCard() {
    const name = currentUser.name || currentUser.email || "User";
    document.getElementById("user-av").textContent = name.charAt(0).toUpperCase();
    document.getElementById("user-name").textContent = name;
    document.getElementById("user-role").textContent = currentUser.role;
}

// ── Navigation ────────────────────────────────────────────────────────────────
const SECTION_TITLES = {
    dashboard:  "📊 Dashboard",
    books:      "📚 Books",
    students:   "🎓 Students",
    borrow:     "📖 Borrow & Return",
    browse:     "🔍 Browse Books",
    "my-history": "📋 My Borrow History",
};

function navigateTo(sectionId) {
    // hide all sections
    document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
    // deactivate all nav items
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));

    const sec = document.getElementById(`sec-${sectionId}`);
    if (sec) sec.classList.add("active");

    const navBtn = document.getElementById(`nav-${sectionId}`);
    if (navBtn) navBtn.classList.add("active");

    document.getElementById("topbar-title").textContent = SECTION_TITLES[sectionId] || sectionId;

    // Lazy load data when navigating
    if (sectionId === "dashboard") loadDashboard();
    if (sectionId === "books")     loadBooks();
    if (sectionId === "students")  loadStudents();
    if (sectionId === "browse")    loadBrowse();
    if (sectionId === "my-history") loadMyHistory();
}

// ─── SECTION: DASHBOARD ───────────────────────────────────────────────────────
async function loadDashboard() {
    try {
        const data = await api.get("/reports/summary");
        const d = data.data;
        document.getElementById("stat-books").textContent    = d.totalBooks;
        document.getElementById("stat-avail").textContent    = d.availableBooks;
        document.getElementById("stat-borrowed").textContent = d.borrowedBooks;
        document.getElementById("stat-students").textContent = d.totalStudents;
        document.getElementById("stat-fine").textContent     = d.totalFineCollected;
        document.getElementById("stat-records").textContent  = d.totalBorrowRecords;
    } catch (err) {
        showToast("Could not load dashboard: " + err.message, "error");
    }
}

// ─── SECTION: BOOKS ───────────────────────────────────────────────────────────
let allBooks = [];

async function loadBooks() {
    const tbody = document.getElementById("books-tbody");
    tbody.innerHTML = loadingRow(7);
    try {
        const data = await api.get("/books");
        allBooks = data.data || [];
        renderBooksTable(allBooks);
    } catch (err) {
        tbody.innerHTML = errorRow(7, err.message);
    }
}

async function searchBooks() {
    const kw = document.getElementById("book-search").value.trim();
    if (!kw) { renderBooksTable(allBooks); return; }
    try {
        const data = await api.get(`/books/search?keyword=${encodeURIComponent(kw)}`);
        renderBooksTable(data.data || []);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function renderBooksTable(books) {
    const tbody = document.getElementById("books-tbody");
    if (!books.length) { tbody.innerHTML = emptyRow(7, "No books found."); return; }
    const canEdit = ["admin", "librarian"].includes(currentUser.role);
    tbody.innerHTML = books.map(b => `
        <tr>
            <td><span class="badge badge-accent">#${b.id}</span></td>
            <td><strong>${esc(b.title)}</strong></td>
            <td>${esc(b.author)}</td>
            <td>${b.total_copies}</td>
            <td><span class="badge ${b.available_copies > 0 ? "badge-success" : "badge-danger"}">${b.available_copies}</span></td>
            <td>${fmtDate(b.created_at)}</td>
            <td>
                <div class="td-actions">
                    ${canEdit ? `
                    <button class="btn btn-warn btn-sm" onclick="openBookModal(${b.id})">✏️ Edit</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('book',${b.id},'Delete \"${esc(b.title)}\"?')">🗑</button>
                    ` : `<span style="color:var(--t3);font-size:12px">—</span>`}
                </div>
            </td>
        </tr>
    `).join("");
}

// Book modal
let editingBookId = null;

function openBookModal(id = null) {
    editingBookId = id;
    document.getElementById("book-modal-title").textContent = id ? "✏️ Edit Book" : "➕ Add Book";
    document.getElementById("book-modal-alert").classList.add("hidden");
    document.getElementById("book-modal-id").value = "";
    document.getElementById("book-modal-title-input").value = "";
    document.getElementById("book-modal-author").value = "";
    document.getElementById("book-modal-total").value = "";
    document.getElementById("book-modal-avail").value = "";

    if (id) {
        const book = allBooks.find(b => b.id === id);
        if (book) {
            document.getElementById("book-modal-title-input").value = book.title;
            document.getElementById("book-modal-author").value      = book.author;
            document.getElementById("book-modal-total").value       = book.total_copies;
            document.getElementById("book-modal-avail").value       = book.available_copies;
        }
    }
    document.getElementById("book-modal-overlay").classList.remove("hidden");
}

function closeBookModal() {
    document.getElementById("book-modal-overlay").classList.add("hidden");
}

async function saveBook() {
    const alertEl = document.getElementById("book-modal-alert");
    alertEl.classList.add("hidden");
    const title  = document.getElementById("book-modal-title-input").value.trim();
    const author = document.getElementById("book-modal-author").value.trim();
    const total  = Number(document.getElementById("book-modal-total").value);
    const avail  = document.getElementById("book-modal-avail").value;

    const body = { title, author, totalCopies: total };
    if (avail !== "") body.availableCopies = Number(avail);

    try {
        if (editingBookId) {
            await api.put(`/books/${editingBookId}`, body);
            showToast("Book updated!", "success");
        } else {
            await api.post("/books", body);
            showToast("Book added!", "success");
        }
        closeBookModal();
        loadBooks();
        loadDashboard();
    } catch (err) {
        alertEl.textContent = err.message;
        alertEl.classList.remove("hidden");
    }
}

// ─── SECTION: STUDENTS ────────────────────────────────────────────────────────
let allStudents = [];

async function loadStudents() {
    const tbody = document.getElementById("students-tbody");
    tbody.innerHTML = loadingRow(7);
    try {
        const data = await api.get("/students");
        allStudents = data.data || [];
        renderStudentsTable(allStudents);
    } catch (err) {
        tbody.innerHTML = errorRow(7, err.message);
    }
}

async function searchStudents() {
    const kw = document.getElementById("student-search").value.trim();
    if (!kw) { renderStudentsTable(allStudents); return; }
    try {
        const data = await api.get(`/students/search?keyword=${encodeURIComponent(kw)}`);
        renderStudentsTable(data.data || []);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function renderStudentsTable(students) {
    const tbody = document.getElementById("students-tbody");
    if (!students.length) { tbody.innerHTML = emptyRow(7, "No students found."); return; }
    tbody.innerHTML = students.map(s => `
        <tr>
            <td><span class="badge badge-info">#${s.id}</span></td>
            <td><strong>${esc(s.name)}</strong></td>
            <td><code style="font-size:12px;color:var(--t2)">${esc(s.student_id)}</code></td>
            <td><span class="badge badge-accent">${esc(s.department)}</span></td>
            <td>${esc(s.email)}</td>
            <td>${fmtDate(s.created_at)}</td>
            <td>
                <div class="td-actions">
                    <button class="btn btn-secondary btn-sm" onclick="quickLoadHistory(${s.id})">📋 History</button>
                    <button class="btn btn-danger btn-sm" onclick="confirmDelete('student',${s.id},'Delete student ${esc(s.name)}?')">🗑</button>
                </div>
            </td>
        </tr>
    `).join("");
}

function openStudentModal() {
    document.getElementById("stu-modal-name").value  = "";
    document.getElementById("stu-modal-sid").value   = "";
    document.getElementById("stu-modal-dept").value  = "";
    document.getElementById("stu-modal-email").value = "";
    document.getElementById("stu-modal-alert").classList.add("hidden");
    document.getElementById("student-modal-overlay").classList.remove("hidden");
}
function closeStudentModal() {
    document.getElementById("student-modal-overlay").classList.add("hidden");
}

async function saveStudent() {
    const alertEl = document.getElementById("stu-modal-alert");
    alertEl.classList.add("hidden");
    const body = {
        name:       document.getElementById("stu-modal-name").value.trim(),
        studentId:  document.getElementById("stu-modal-sid").value.trim(),
        department: document.getElementById("stu-modal-dept").value.trim(),
        email:      document.getElementById("stu-modal-email").value.trim(),
    };
    try {
        await api.post("/students", body);
        showToast("Student added!", "success");
        closeStudentModal();
        loadStudents();
        loadDashboard();
    } catch (err) {
        alertEl.textContent = err.message;
        alertEl.classList.remove("hidden");
    }
}

// quick navigate to borrow section with history pre-filled
function quickLoadHistory(studentId) {
    navigateTo("borrow");
    document.getElementById("history-student-id").value = studentId;
    loadHistory();
}

// ─── SECTION: BORROW / RETURN ────────────────────────────────────────────────
async function borrowBook() {
    const alertEl  = document.getElementById("borrow-alert");
    alertEl.classList.add("hidden");
    const studentId = Number(document.getElementById("borrow-student-id").value);
    const bookId    = Number(document.getElementById("borrow-book-id").value);
    try {
        const data = await api.post("/borrow", { studentId, bookId });
        showToast(data.message || "Book issued!", "success");
        document.getElementById("borrow-student-id").value = "";
        document.getElementById("borrow-book-id").value    = "";
        loadDashboard();
    } catch (err) {
        alertEl.textContent = err.message;
        alertEl.classList.remove("hidden");
    }
}

async function returnBook() {
    const alertEl = document.getElementById("return-alert");
    alertEl.classList.add("hidden");
    const recordId = Number(document.getElementById("return-record-id").value);
    try {
        const data = await api.post("/return", { recordId });
        showToast(data.message || "Book returned!", "success");
        document.getElementById("return-record-id").value = "";
        loadDashboard();
    } catch (err) {
        alertEl.textContent = err.message;
        alertEl.classList.remove("hidden");
    }
}

async function loadHistory() {
    const tbody    = document.getElementById("history-tbody");
    const studentId = Number(document.getElementById("history-student-id").value);
    if (!studentId) { showToast("Enter a Student DB ID", "error"); return; }
    tbody.innerHTML = loadingRow(8);
    try {
        const data = await api.get(`/students/${studentId}/history`);
        renderHistoryTable(data.data || [], tbody, 8);
    } catch (err) {
        tbody.innerHTML = errorRow(8, err.message);
    }
}

function renderHistoryTable(rows, tbody, cols) {
    if (!rows.length) { tbody.innerHTML = emptyRow(cols, "No records found."); return; }
    tbody.innerHTML = rows.map(r => `
        <tr>
            <td>#${r.record_id}</td>
            <td>${esc(r.student_name)}</td>
            <td>${esc(r.book_title)}</td>
            <td>${fmtDate(r.borrow_date)}</td>
            <td>${fmtDate(r.due_date)}</td>
            <td>${r.return_date ? fmtDate(r.return_date) : "—"}</td>
            <td><span class="badge ${r.status === "borrowed" ? "badge-warn" : "badge-success"}">${r.status}</span></td>
            <td>${r.fine_amount > 0 ? `<span class="badge badge-danger">Tk ${r.fine_amount}</span>` : "0"}</td>
        </tr>
    `).join("");
}

// ─── SECTION: BROWSE (STUDENT) ───────────────────────────────────────────────
let allBrowse = [];

async function loadBrowse() {
    const tbody = document.getElementById("browse-tbody");
    tbody.innerHTML = loadingRow(5);
    try {
        const data = await api.get("/books");
        allBrowse = data.data || [];
        renderBrowseTable(allBrowse);
    } catch (err) {
        tbody.innerHTML = errorRow(5, err.message);
    }
}

async function browseBooks() {
    const kw = document.getElementById("browse-search").value.trim();
    if (!kw) { renderBrowseTable(allBrowse); return; }
    try {
        const data = await api.get(`/books/search?keyword=${encodeURIComponent(kw)}`);
        renderBrowseTable(data.data || []);
    } catch (err) {
        showToast(err.message, "error");
    }
}

function renderBrowseTable(books) {
    const tbody = document.getElementById("browse-tbody");
    if (!books.length) { tbody.innerHTML = emptyRow(5, "No books found."); return; }
    tbody.innerHTML = books.map(b => `
        <tr>
            <td>#${b.id}</td>
            <td><strong>${esc(b.title)}</strong></td>
            <td>${esc(b.author)}</td>
            <td><span class="badge ${b.available_copies > 0 ? "badge-success" : "badge-danger"}">${b.available_copies > 0 ? `${b.available_copies} available` : "Unavailable"}</span></td>
            <td>
                ${b.available_copies > 0
                    ? `<button class="btn btn-primary btn-sm" onclick="openBorrowModal(${b.id},'${esc(b.title)}')">📤 Borrow</button>`
                    : `<button class="btn btn-secondary btn-sm" disabled>Unavailable</button>`}
            </td>
        </tr>
    `).join("");
}

function openBorrowModal(bookId, title) {
    document.getElementById("borrow-modal-book-id").value    = bookId;
    document.getElementById("borrow-modal-book-title").textContent = title;
    document.getElementById("borrow-modal-student-id").value = currentUser.student_id || "";
    document.getElementById("borrow-modal-alert").classList.add("hidden");
    document.getElementById("borrow-modal-overlay").classList.remove("hidden");
}
function closeBorrowModal() {
    document.getElementById("borrow-modal-overlay").classList.add("hidden");
}

async function confirmBorrow() {
    const alertEl   = document.getElementById("borrow-modal-alert");
    alertEl.classList.add("hidden");
    const bookId    = Number(document.getElementById("borrow-modal-book-id").value);
    const studentId = Number(document.getElementById("borrow-modal-student-id").value);
    try {
        const data = await api.post("/borrow", { studentId, bookId });
        showToast(data.message || "Book borrowed!", "success");
        closeBorrowModal();
        loadBrowse();
    } catch (err) {
        alertEl.textContent = err.message;
        alertEl.classList.remove("hidden");
    }
}

// ─── SECTION: MY HISTORY (STUDENT) ───────────────────────────────────────────
async function loadMyHistory() {
    const tbody   = document.getElementById("my-history-tbody");
    const alertEl = document.getElementById("my-history-alert");

    // student_id from the JWT payload
    const studentId = currentUser.student_id;
    if (!studentId) {
        alertEl.textContent = "ℹ️ Your account is not linked to a student profile. Ask an admin to link your account.";
        alertEl.classList.remove("hidden");
        tbody.innerHTML = emptyRow(7, "No student profile linked.");
        return;
    }
    alertEl.classList.add("hidden");
    tbody.innerHTML = loadingRow(7);
    try {
        const data = await api.get(`/students/${studentId}/history`);
        const rows = (data.data || []).map(r => `
            <tr>
                <td>#${r.record_id}</td>
                <td><strong>${esc(r.book_title)}</strong></td>
                <td>${fmtDate(r.borrow_date)}</td>
                <td>${fmtDate(r.due_date)}</td>
                <td>${r.return_date ? fmtDate(r.return_date) : "—"}</td>
                <td><span class="badge ${r.status === "borrowed" ? "badge-warn" : "badge-success"}">${r.status}</span></td>
                <td>${r.fine_amount > 0 ? `<span class="badge badge-danger">Tk ${r.fine_amount}</span>` : "0"}</td>
            </tr>
        `).join("");
        tbody.innerHTML = rows || emptyRow(7, "No borrow history yet.");
    } catch (err) {
        tbody.innerHTML = errorRow(7, err.message);
    }
}

// ─── DELETE CONFIRM ───────────────────────────────────────────────────────────
function confirmDelete(type, id, msg) {
    document.getElementById("confirm-msg").textContent = msg;
    document.getElementById("confirm-overlay").classList.remove("hidden");
    document.getElementById("confirm-ok-btn").onclick = async () => {
        closeConfirm();
        try {
            if (type === "book")    await api.delete(`/books/${id}`);
            if (type === "student") await api.delete(`/students/${id}`);
            showToast(`Deleted successfully!`, "success");
            if (type === "book")    { loadBooks(); loadDashboard(); }
            if (type === "student") { loadStudents(); loadDashboard(); }
        } catch (err) {
            showToast(err.message, "error");
        }
    };
}
function closeConfirm() {
    document.getElementById("confirm-overlay").classList.add("hidden");
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function esc(str) {
    return String(str ?? "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function fmtDate(val) {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

function loadingRow(cols) {
    return `<tr class="loading-row"><td colspan="${cols}"><span class="spinner"></span> Loading…</td></tr>`;
}
function emptyRow(cols, msg) {
    return `<tr><td colspan="${cols}"><div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">Nothing here</div><div class="empty-sub">${msg}</div></div></td></tr>`;
}
function errorRow(cols, msg) {
    return `<tr><td colspan="${cols}" style="text-align:center;padding:30px;color:var(--danger)">⚠️ ${esc(msg)}</td></tr>`;
}
