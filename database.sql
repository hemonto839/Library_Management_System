-- ═══════════════════════════════════════════════
-- Library Management System - Full Schema
-- Run this file once in pgAdmin / psql to set up
-- ═══════════════════════════════════════════════

-- 1. Books
CREATE TABLE books (
    id               SERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    author           VARCHAR(255) NOT NULL,
    total_copies     INT NOT NULL CHECK (total_copies > 0),
    available_copies INT NOT NULL CHECK (available_copies >= 0),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO books (title, author, total_copies, available_copies) VALUES
('Clean Code', 'Robert C. Martin', 5, 5),
('Database System Concepts', 'Silberschatz', 3, 3),
('Computer Network', 'Ross', 4, 4);

-- 2. Students
CREATE TABLE students (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    student_id VARCHAR(50)  NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    email      VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO students (name, student_id, department, email) VALUES
('Arka Roy',          '2252421086', 'CSE', 'arka@example.com'),
('Anjumanara Islam',  '2252421001', 'CSE', 'anjumanara@example.com'),
('Karim Ahmed',       '2252421002', 'EEE', 'karim@example.com');

-- 3. Users (auth accounts)
--    student_id links to students.id — only set for the student role
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(255) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(50)  NOT NULL CHECK (role IN ('admin','librarian','student')),
    student_id    INT REFERENCES students(id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Borrow records
CREATE TABLE borrow_records (
    id          SERIAL PRIMARY KEY,
    student_id  INT NOT NULL REFERENCES students(id),
    book_id     INT NOT NULL REFERENCES books(id),
    borrow_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date    DATE NOT NULL,
    return_date DATE,
    status      VARCHAR(50) NOT NULL DEFAULT 'borrowed',
    fine_amount INT NOT NULL DEFAULT 0
);

-- Sample borrow record (student 1 borrows book 2)
INSERT INTO borrow_records (student_id, book_id, due_date)
VALUES (1, 2, CURRENT_DATE + 14);

UPDATE books SET available_copies = available_copies - 1 WHERE id = 2;

-- ── Useful queries ──────────────────────────────────────────────────────────
-- SELECT * FROM books;
-- SELECT * FROM students;
-- SELECT * FROM users;
-- SELECT * FROM borrow_records;