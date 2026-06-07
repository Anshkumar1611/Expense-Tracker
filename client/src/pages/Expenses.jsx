import { useState } from 'react';
import { api } from '../api.js';
import { useExpenses } from '../hooks/useExpenses.js';
import { useAsync } from '../hooks/useAsync.js';
import ExpenseForm from '../components/ExpenseForm.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import Pagination from '../components/Pagination.jsx';
import { Icon } from '../components/Icons.jsx';
import { formatCurrency, formatDate } from '../utils.js';

export default function Expenses() {
  const {
    items, total, sum, page, totalPages, pageSize,
    loading, error, refetch,
    search, setSearch, category, setCategory, setPage,
  } = useExpenses();

  const { data } = useAsync(() => api.getCategories(), []);
  const categories = data || [];

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await api.deleteExpense(id);
    refetch();
  };

  const openAdd = () => { setEditing(null); setShowForm(true); };
  const openEdit = (exp) => { setEditing(exp); setShowForm(true); };
  const handleSaved = () => { setShowForm(false); setEditing(null); refetch(); };

  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Expenses</h1>
          <p className="muted small" style={{ margin: 0 }}>Manage and review your transactions.</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Icon.Plus width={18} height={18} /> Add Expense
        </button>
      </div>

      <div className="filters card">
        <div className="search-field">
          <Icon.Search width={18} height={18} className="search-icon" />
          <input
            className="search"
            type="search"
            placeholder="Search by title or note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="All">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {loading ? (
          <p className="muted center" style={{ padding: 24 }}>Loading…</p>
        ) : items.length === 0 ? (
          <p className="muted center" style={{ padding: 24 }}>
            No expenses found. Try adjusting your filters or add a new one.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Title</th><th>Category</th><th>Date</th>
                <th className="right">Amount</th><th className="right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="cell-title">{e.title}</div>
                    {e.note && <div className="muted small">{e.note}</div>}
                  </td>
                  <td><CategoryBadge category={e.category} /></td>
                  <td>{formatDate(e.date)}</td>
                  <td className="right amount">{formatCurrency(e.amount)}</td>
                  <td className="right">
                    <div className="row-actions">
                      <button className="icon-btn" title="Edit" onClick={() => openEdit(e)}>
                        <Icon.Edit width={17} height={17} />
                      </button>
                      <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(e.id)}>
                        <Icon.Trash width={17} height={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="right bold">Total ({total})</td>
                <td className="right bold">{formatCurrency(sum)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {total > 0 && (
        <div className="list-footer">
          <span className="muted small">
            Showing {showingFrom}–{showingTo} of {total}
          </span>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      )}

      {showForm && (
        <ExpenseForm
          categories={categories}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
