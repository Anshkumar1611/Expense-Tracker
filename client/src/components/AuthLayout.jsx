import { Icon } from './Icons.jsx';

const FEATURES = [
  'Track every expense in one place',
  'Visualize spending with live charts',
  'Search, filter & stay on budget',
];

export default function AuthLayout({ children }) {
  return (
    <div className="auth-split">
      <aside className="auth-hero">
        <div className="auth-hero-top">
          <span className="brand-mark light">$</span>
          <span className="brand-text light">Expense<b>Tracker</b></span>
        </div>

        <div className="auth-hero-body">
          <h2>Take control of your money.</h2>
          <p>A clean, simple way to record what you spend and see where it goes.</p>
          <ul className="auth-feature-list">
            {FEATURES.map((f) => (
              <li key={f}>
                <span className="feature-check"><Icon.TrendUp width={14} height={14} /></span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="auth-hero-glow" />
        <div className="auth-hero-glow two" />
      </aside>

      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-panel-brand">
            <span className="brand-mark">$</span>
            <span className="brand-text">Expense<b>Tracker</b></span>
          </div>
          {children}
        </div>
      </section>
    </div>
  );
}
