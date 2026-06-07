import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { Icon } from './Icons.jsx';
import { getInitials } from '../utils.js';

const NAV = [
  { to: '/', label: 'Dashboard', icon: Icon.Dashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: Icon.Wallet, end: false },
];

export default function AppShell({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-mark">$</span>
          <span className="brand-text">Expense<b>Tracker</b></span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(({ to, label, icon: I, end }) => (
            <NavLink key={to} to={to} end={end} className="side-link">
              <I width={19} height={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Icon.Moon width={18} height={18} /> : <Icon.Sun width={18} height={18} />}
            <span>{theme === 'light' ? 'Dark mode' : 'Light mode'}</span>
          </button>
          <div className="user-row">
            <div className="avatar">{getInitials(user?.name)}</div>
            <div className="user-meta">
              <span className="user-name">{user?.name}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <button className="icon-btn" title="Log out" onClick={handleLogout}>
              <Icon.Logout width={18} height={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="topbar">
        <div className="sidebar-brand">
          <span className="brand-mark">$</span>
          <span className="brand-text">Expense<b>Tracker</b></span>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'light' ? <Icon.Moon width={18} height={18} /> : <Icon.Sun width={18} height={18} />}
          </button>
          <button className="icon-btn" title="Log out" onClick={handleLogout}>
            <Icon.Logout width={18} height={18} />
          </button>
        </div>
      </header>

      <main className="content">
        <div className="content-inner">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV.map(({ to, label, icon: I, end }) => (
          <NavLink key={to} to={to} end={end} className="bottom-link">
            <I width={22} height={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
