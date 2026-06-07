import { createContext, useContext, useState, useCallback } from 'react';
import { api, setToken, getToken } from '../api.js';

const AuthContext = createContext(null);

const USER_KEY = 'et_user';

function loadUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (getToken() ? loadUser() : null));

  const persist = useCallback(({ token, user }) => {
    setToken(token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const login = useCallback(
    async (credentials) => persist(await api.login(credentials)),
    [persist]
  );

  const register = useCallback(
    async (payload) => persist(await api.register(payload)),
    [persist]
  );

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
