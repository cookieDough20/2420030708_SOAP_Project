/**
 * Authentication Context.
 * 
 * Manages user authentication state across the application:
 * - JWT token storage in sessionStorage
 * - User info (email, role)
 * - Login/logout functions
 * - Auth state persistence across page refreshes
 */

import { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore auth state from localStorage on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('token');
    const savedUser = sessionStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    const data = response.data;

    const userData = {
      email: data.email,
      role: data.role,
    };

    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(userData));

    setToken(data.token);
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (name, email, password, role) => {
    const response = await authService.register(name, email, password, role);
    return response.data;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = !!token && !!user;

  const hasRole = useCallback(
    (role) => user?.role === role,
    [user]
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
