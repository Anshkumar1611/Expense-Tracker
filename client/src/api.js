// Thin fetch wrapper that injects the JWT and normalizes errors.
const TOKEN_KEY = 'et_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (auth && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || 'Request failed');
    err.fields = data.fields || {};
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload, auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload, auth: false }),

  // Expenses
  listExpenses: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== '' && v != null)
    ).toString();
    return request(`/expenses${qs ? `?${qs}` : ''}`);
  },
  getStats: () => request('/expenses/stats'),
  getCategories: () => request('/expenses/categories'),
  createExpense: (payload) => request('/expenses', { method: 'POST', body: payload }),
  updateExpense: (id, payload) => request(`/expenses/${id}`, { method: 'PUT', body: payload }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
};
