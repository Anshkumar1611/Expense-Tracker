import { Link } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { api } from '../api.js';
import { useAsync } from '../hooks/useAsync.js';
import { Icon } from '../components/Icons.jsx';
import CategoryBadge from '../components/CategoryBadge.jsx';
import { formatCurrency, formatDate, formatMonth, CATEGORY_COLORS } from '../utils.js';

function StatCard({ label, value, sub, icon: I, accent }) {
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: `${accent}1a`, color: accent }}>
        <I width={22} height={22} />
      </div>
      <div className="stat-body">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        {sub && <span className="muted small">{sub}</span>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, loading, error } = useAsync(() => api.getStats(), []);

  if (error) return <div className="alert alert-error">{error}</div>;
  if (loading || !stats) return <div className="muted center" style={{ padding: 40 }}>Loading…</div>;

  const pieData = stats.byCategory.map((c) => ({
    name: c.category,
    value: c.total,
  }));
  const trendData = stats.monthlyTrend.map((m) => ({
    month: formatMonth(m.month),
    total: m.total,
  }));

  const thisMonth = new Date().toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p className="muted small" style={{ margin: 0 }}>Here's an overview of your spending.</p>
        </div>
        <Link to="/expenses" className="btn btn-primary">
          <Icon.Plus width={18} height={18} /> Add Expense
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Total Expenses"
          value={formatCurrency(stats.total)}
          sub={`${stats.count} transactions`}
          icon={Icon.Wallet}
          accent="#6366f1"
        />
        <StatCard
          label="This Month"
          value={formatCurrency(stats.monthly)}
          sub={thisMonth}
          icon={Icon.Calendar}
          accent="#10b981"
        />
        <StatCard
          label="Avg / Transaction"
          value={formatCurrency(stats.count ? stats.total / stats.count : 0)}
          sub="per expense"
          icon={Icon.TrendUp}
          accent="#f59e0b"
        />
      </div>

      {stats.count === 0 ? (
        <div className="card empty-state">
          <p>No expenses yet.</p>
          <Link to="/expenses" className="btn btn-primary">Add your first expense</Link>
        </div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="card">
              <h2 className="card-title"><Icon.Chart width={18} height={18} /> Spending by Category</h2>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={(d) => d.name}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#64748b'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="card-title"><Icon.TrendUp width={18} height={18} /> Monthly Trend</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Bar dataKey="total" fill="#6366f1" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <div className="page-head">
              <h2 className="card-title"><Icon.Receipt width={18} height={18} /> Recent Transactions</h2>
              <Link to="/expenses" className="link">View all →</Link>
            </div>
            <table className="table">
              <thead>
                <tr><th>Title</th><th>Category</th><th>Date</th><th className="right">Amount</th></tr>
              </thead>
              <tbody>
                {stats.recent.map((e) => (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td><CategoryBadge category={e.category} /></td>
                    <td>{formatDate(e.date)}</td>
                    <td className="right">{formatCurrency(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
