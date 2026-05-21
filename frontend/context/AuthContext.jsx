'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '@/lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('medicare_token');
    localStorage.removeItem('medicare_user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('medicare_token');
    const storedUser = localStorage.getItem('medicare_user');
    if (storedToken && storedUser) {
      Promise.resolve().then(() => {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      });
      // Verify token is still valid
      authAPI.getMe()
        .then((res) => {
          Promise.resolve().then(() => setUser(res.data.user));
        })
        .catch(() => logout())
        .finally(() => {
          Promise.resolve().then(() => setLoading(false));
        });
    } else {
      Promise.resolve().then(() => setLoading(false));
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token: t, user: u } = res.data;
    localStorage.setItem('medicare_token', t);
    localStorage.setItem('medicare_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { token: t, user: u } = res.data;
    localStorage.setItem('medicare_token', t);
    localStorage.setItem('medicare_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    setUser(merged);
    localStorage.setItem('medicare_user', JSON.stringify(merged));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
