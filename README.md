# Library Management System

This is my first backend/system-building project.

I built this project to practice Git, JavaScript, Node.js, Express.js, PostgreSQL, API development, authentication, frontend dashboards, and basic system architecture.

---

## Project Goal

The goal of this project is to build a complete Library Management System step by step.

### Learning Levels Completed

- Level 1: JavaScript Core Logic
- Level 2: Express API
- Level 3: PostgreSQL Database
- Level 4: Authentication
- Level 5: Frontend Dashboard
- Level 6: Deployment

---

## Main Features

- User registration and login
- JWT-based authentication
- HTTP-only cookie authentication
- Role-based access control
- Admin dashboard
- Librarian dashboard
- Student dashboard
- Manage books
- View all books
- Add books
- Borrow books
- Return books
- Track borrow history
- Track due dates
- Calculate fines
- Protected routes for logged-in users

---


## User Roles

This project has 3 user roles:

### Admin

Admin can access the admin dashboard.

### Librarian

Librarian can manage books, borrow books for students, return books, and check student history.

### Student

Student can view available books and check personal borrow history.

---

## Demo Users

You can use the following demo users for testing:

```txt
Admin
Email: dev@gmail.com
Password: dev123

Librarian
Email: hemonto@gmail.com
Password: hemonto123

Student
Email: arka@gmail.com
Password: arka123
```

## Deployment 

we deploy it using Neon for databse and Render for website host

link to visit website - [text](https://library-management-system-353t.onrender.com)

---

## Tech Stack

- JavaScript
- Node.js
- Express.js
- PostgreSQL
- HTML
- CSS
- JWT
- Cookie Parser
- bcrypt
- Git and GitHub

---

## Project Structure

```txt
library_management_system/
│
├── config/
│   └── db.js
│
├── controllers/
│
├── middleware/
│
├── public/
│   ├── login.html
│   ├── register.html
│   ├── admin.html
│   ├── librarian.html
│   ├── student.html
│   └── style.css
│
├── routes/
│
├── utils/
│
├── database.sql
├── library.js
├── server.js
├── package.json
├── package-lock.json
├── README.md
├── LICENSE
└── .gitignore
```

---

# How to Run This Project on Your Device

Follow these steps to run the Library Management System locally.

---

## 1. Clone the Repository

First, clone this GitHub repository:

```bash
git clone https://github.com/hemonto839/Library_Management_System.git
```

Then go inside the project folder:

```bash
cd Library_Management_System
```

---

## 2. Install Node.js Dependencies

Run this command to install all required packages:

```bash
npm install
```

This will install all dependencies from `package.json`.

---

## 3. Create the `.env` File

This project uses environment variables for security.

The `.env` file is not uploaded to GitHub.

Create a new file named:

```txt
.env
```

in the root folder of the project.

Add the following values:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_NAME=library_management_system
JWT_SECRET=your_secret_key
```

Change these values according to your own PostgreSQL setup.

Example:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=12345
DB_NAME=library_management_system
JWT_SECRET=mysecretkey123
```

---

## 4. Set Up PostgreSQL Database

Open PostgreSQL or pgAdmin and create a new database.

Example database name:

```txt
library_management_system
```

Make sure this database name matches the `DB_NAME` value in your `.env` file.

---

## 5. Run the Database SQL File

This project includes a `database.sql` file.

You need to run this file to create the required tables.

### Option 1: Using pgAdmin

1. Open pgAdmin.
2. Create or select your database.
3. Open Query Tool.
4. Open the `database.sql` file.
5. Run the SQL commands.

### Option 2: Using Terminal

```bash
psql -U postgres -d library_management_system -f database.sql
```

If your database name is different, replace `library_management_system` with your own database name.

---

## 6. Start the Server

Run:

```bash
npm start
```

If the project has a development script, you can also run:

```bash
npm run dev
```

---

## 7. Open the Project in Browser

After starting the server, open:

```txt
http://localhost:5000
```

Or directly open the login page:

```txt
http://localhost:5000/login.html
```

---

## 8. Test Demo Users

You can test the project using these demo users:

```txt
Admin
Email: dev@gmail.com
Password: dev123

Librarian
Email: hemonto@gmail.com
Password: hemonto123

Student
Email: arka@gmail.com
Password: arka123
```

---

## 9. Important Notes

Before running the project, make sure:

- Node.js is installed.
- PostgreSQL is installed and running.
- The `.env` file is created correctly.
- The database name in `.env` matches your PostgreSQL database.
- The `database.sql` file has been executed.
- `node_modules` is not manually copied; it will be created after running `npm install`.

The following files/folders are ignored and should not be uploaded to GitHub:

```txt
node_modules/
.env
.vscode/
```

Anyone who wants to run this project must create their own `.env` file.

---

## 10. Common Problems and Solutions

### Problem: Server does not start

Check if dependencies are installed:

```bash
npm install
```

Also check if the `.env` file exists.

---

### Problem: Database connection error

Check your `.env` file:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_postgresql_password
DB_NAME=library_management_system
```

Make sure your PostgreSQL password and database name are correct.

---

### Problem: Login does not work

Make sure:

- The server is running.
- The database tables exist.
- Demo users are inserted in the database.
- Cookies are enabled in the browser.

---

### Problem: Page says unauthorized or redirects to login

This means the user is not logged in or does not have permission for that dashboard.

Role-based pages:

```txt
Admin       -> /admin.html
Librarian   -> /librarian.html
Student     -> /student.html
```

---

## Authentication System

This project uses JWT authentication with HTTP-only cookies.

After login, the server creates a JWT token and stores it inside a secure cookie. Protected routes check this cookie before allowing access.

---

## Role-Based Access

Each dashboard is protected based on user role:

```txt
Admin       -> admin.html
Librarian   -> librarian.html
Student     -> student.html
```

Users cannot access dashboards that do not match their role.

---

## Project Status

Completed — Version 1.0.0

---

## Author

Arka Roy
