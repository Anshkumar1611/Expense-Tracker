import { useState } from 'react';
import { api } from '../api.js';
import { todayISO } from '../utils.js';

const EMPTY = { title: '', amount: '', category: 'Food', note: '', date: todayISO() };

export default function ExpenseForm({ categories, initial, onClose, onSaved }) {
  const editing = Boolean(initial);
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title,
          amount: initial.amount,
          category: initial.category,
          note: initial.note || '',
          date: initial.date.slice(0, 10),
        }
      : EMPTY
  );
  const [fields, setFields] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Client-side validation mirroring the server rules.
  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.amount === '' || Number(form.amount) <= 0 || Number.isNaN(Number(form.amount)))
      errs.amount = 'Enter an amount greater than 0';
    if (!form.category) errs.category = 'Select a category';
    if (!form.date) errs.date = 'Pick a date';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const errs = validate();
    setFields(errs);
    if (Object.keys(errs).length) return;

    setBusy(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      if (editing) await api.updateExpense(initial.id, payload);
      else await api.createExpense(payload);
      onSaved();
    } catch (err) {
      setError(err.message);
      setFields(err.fields || {});
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()}>
        <div className="page-head">
          <h2>{editing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="icon-btn" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Title
            <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Groceries" />
            {fields.title && <span className="field-error">{fields.title}</span>}
          </label>

          <div className="form-row">
            <label>
              Amount
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                placeholder="0.00"
              />
              {fields.amount && <span className="field-error">{fields.amount}</span>}
            </label>
            <label>
              Category
              <select name="category" value={form.category} onChange={handleChange}>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {fields.category && <span className="field-error">{fields.category}</span>}
            </label>
          </div>

          <label>
            Date
            <input type="date" name="date" value={form.date} onChange={handleChange} />
            {fields.date && <span className="field-error">{fields.date}</span>}
          </label>

          <label>
            Note <span className="muted">(optional)</span>
            <textarea name="note" value={form.note} onChange={handleChange} rows={2} placeholder="Add a note…" />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
