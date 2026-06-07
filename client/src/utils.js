export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(amount) || 0);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatMonth(ym) {
  // ym is "YYYY-MM"
  const [y, m] = ym.split('-');
  return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}

export const CATEGORY_COLORS = {
  Food: '#ef4444',
  Transport: '#f59e0b',
  Housing: '#3b82f6',
  Utilities: '#06b6d4',
  Entertainment: '#8b5cf6',
  Health: '#10b981',
  Shopping: '#ec4899',
  Travel: '#14b8a6',
  Education: '#6366f1',
  Other: '#64748b',
};

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// First letters of the first two words of a name, e.g. "Ansh Gupta" -> "AG".
export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}
