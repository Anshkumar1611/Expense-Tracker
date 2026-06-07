import { Router } from 'express';
import db from '../db.js';
import { authRequired } from '../auth.js';

const router = Router();

// Every route below requires a logged-in user.
router.use(authRequired);

const CATEGORIES = [
  'Food',
  'Transport',
  'Housing',
  'Utilities',
  'Entertainment',
  'Health',
  'Shopping',
  'Travel',
  'Education',
  'Other',
];

const DEFAULT_LIMIT = 8;
const MAX_LIMIT = 100;

// Builds the shared WHERE clause + params for list and count queries,
// so filtering logic lives in exactly one place.
function buildFilter(query, userId) {
  const clauses = ['user_id = ?'];
  const params = [userId];
  const { search, category, from, to } = query;

  if (search) {
    clauses.push('(title LIKE ? OR note LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category && category !== 'All') {
    clauses.push('category = ?');
    params.push(category);
  }
  if (from) {
    clauses.push('date >= ?');
    params.push(from);
  }
  if (to) {
    clauses.push('date <= ?');
    params.push(to);
  }

  return { where: clauses.join(' AND '), params };
}

// Clamps pagination query params into a safe { page, limit, offset }.
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(query.limit, 10) || DEFAULT_LIMIT));
  return { page, limit, offset: (page - 1) * limit };
}

function validateExpense(body) {
  const errors = {};
  const { title, amount, category, date } = body || {};

  if (!title || !String(title).trim()) errors.title = 'Title is required';

  const amt = Number(amount);
  if (amount === undefined || amount === null || amount === '' || Number.isNaN(amt))
    errors.amount = 'Amount is required';
  else if (amt <= 0) errors.amount = 'Amount must be greater than 0';

  if (!category || !CATEGORIES.includes(category))
    errors.category = 'A valid category is required';

  if (!date || Number.isNaN(Date.parse(date))) errors.date = 'A valid date is required';

  return errors;
}

// GET /api/expenses?search=&category=&from=&to=&page=&limit=
// Returns a paginated envelope plus the summed total of ALL matching rows.
router.get('/', (req, res) => {
  const { where, params } = buildFilter(req.query, req.user.id);
  const { page, limit, offset } = parsePagination(req.query);

  const total = db.prepare(`SELECT COUNT(*) AS v FROM expenses WHERE ${where}`).get(...params).v;
  const sum = db
    .prepare(`SELECT COALESCE(SUM(amount), 0) AS v FROM expenses WHERE ${where}`)
    .get(...params).v;
  const items = db
    .prepare(
      `SELECT * FROM expenses WHERE ${where} ORDER BY date DESC, id DESC LIMIT ? OFFSET ?`
    )
    .all(...params, limit, offset);

  res.json({
    items,
    total,
    sum,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
});

// GET /api/expenses/stats — dashboard summary
router.get('/stats', (req, res) => {
  const uid = req.user.id;
  const month = new Date().toISOString().slice(0, 7); // YYYY-MM

  const total = db
    .prepare('SELECT COALESCE(SUM(amount), 0) AS v FROM expenses WHERE user_id = ?')
    .get(uid).v;

  const monthly = db
    .prepare(
      "SELECT COALESCE(SUM(amount), 0) AS v FROM expenses WHERE user_id = ? AND substr(date, 1, 7) = ?"
    )
    .get(uid, month).v;

  const count = db
    .prepare('SELECT COUNT(*) AS v FROM expenses WHERE user_id = ?')
    .get(uid).v;

  const byCategory = db
    .prepare(
      'SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ? GROUP BY category ORDER BY total DESC'
    )
    .all(uid);

  // Last 6 months trend
  const monthlyTrend = db
    .prepare(
      `SELECT substr(date, 1, 7) AS month, SUM(amount) AS total
       FROM expenses WHERE user_id = ?
       GROUP BY month ORDER BY month DESC LIMIT 6`
    )
    .all(uid)
    .reverse();

  const recent = db
    .prepare('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, id DESC LIMIT 5')
    .all(uid);

  res.json({ total, monthly, count, byCategory, monthlyTrend, recent });
});

// GET /api/expenses/categories
router.get('/categories', (_req, res) => res.json(CATEGORIES));

// POST /api/expenses
router.post('/', (req, res) => {
  const errors = validateExpense(req.body);
  if (Object.keys(errors).length)
    return res.status(400).json({ error: 'Validation failed', fields: errors });

  const { title, amount, category, note, date } = req.body;
  const info = db
    .prepare(
      'INSERT INTO expenses (user_id, title, amount, category, note, date) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(req.user.id, title.trim(), Number(amount), category, note?.trim() || null, date);

  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

// PUT /api/expenses/:id
router.put('/:id', (req, res) => {
  const existing = db
    .prepare('SELECT * FROM expenses WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.id);
  if (!existing) return res.status(404).json({ error: 'Expense not found' });

  const errors = validateExpense(req.body);
  if (Object.keys(errors).length)
    return res.status(400).json({ error: 'Validation failed', fields: errors });

  const { title, amount, category, note, date } = req.body;
  db.prepare(
    'UPDATE expenses SET title = ?, amount = ?, category = ?, note = ?, date = ? WHERE id = ?'
  ).run(title.trim(), Number(amount), category, note?.trim() || null, date, req.params.id);

  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  res.json(row);
});

// DELETE /api/expenses/:id
router.delete('/:id', (req, res) => {
  const info = db
    .prepare('DELETE FROM expenses WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Expense not found' });
  res.status(204).end();
});

export default router;
