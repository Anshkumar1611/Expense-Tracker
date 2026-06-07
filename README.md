# 💰 Expense Tracker

A full-stack expense tracking application with authentication, charts, and dark mode.

## Features

- **Authentication** — register / login with JWT, password hashing (bcrypt)
- **Expense CRUD** — add, edit, delete expenses
- **History, search & filter** — search by title/note, filter by category
- **Dashboard** — total spend, this-month spend, recent transactions, and charts
  (category pie chart + 6-month trend bar chart)
- **Form validation** — on both client and server
- **Dark mode** — toggle persisted to localStorage
- **Responsive UI**

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18, Vite, React Router, Recharts |
| Backend  | Node.js, Express |
| Database | SQLite (via `better-sqlite3`) |
| Auth     | JWT + bcrypt |

## Project Structure

```
expense-tracker/
├── server/          # Express REST API
│   └── src/
│       ├── index.js        # app entry
│       ├── db.js           # SQLite schema + connection
│       ├── auth.js         # JWT signing + middleware
│       └── routes/         # auth.js, expenses.js
└── client/          # React (Vite) frontend
    └── src/
        ├── pages/          # Login, Register, Dashboard, Expenses
        ├── components/     # Navbar, ExpenseForm
        ├── context/        # AuthContext, ThemeContext
        └── api.js          # fetch wrapper
```

## Running Locally

Open two terminals.

**1. Backend** (http://localhost:4000)
```bash
cd server
npm install
npm run dev
```

**2. Frontend** (http://localhost:5173)
```bash
cd client
npm install
npm run dev
```

The Vite dev server proxies `/api` to the backend, so just open
http://localhost:5173 and register an account.

## REST API

| Method | Endpoint                | Description                |
|--------|-------------------------|----------------------------|
| POST   | `/api/auth/register`    | Create account             |
| POST   | `/api/auth/login`       | Log in                     |
| GET    | `/api/expenses`         | List (supports `search`, `category`, `from`, `to`) |
| POST   | `/api/expenses`         | Create                     |
| PUT    | `/api/expenses/:id`     | Update                     |
| DELETE | `/api/expenses/:id`     | Delete                     |
| GET    | `/api/expenses/stats`   | Dashboard summary          |
| GET    | `/api/expenses/categories` | Allowed categories      |

All `/api/expenses` routes require an `Authorization: Bearer <token>` header.
# Expense-Tracker
