import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('assignmentor-token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('assignmentor-token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res?.success && res?.data) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.warn("[Auth] Failed to restore session:", err.message);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.login(username, password);
      if (res?.success && res?.data) {
        const { token: receivedToken, user: receivedUser } = res.data;
        localStorage.setItem('assignmentor-token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      throw new Error(res?.message || 'Login failed');
    } catch (err) {
      return { success: false, error: err.message || 'Login error' };
    }
  };

  const logout = () => {
    localStorage.removeItem('assignmentor-token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, role: user?.role, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
