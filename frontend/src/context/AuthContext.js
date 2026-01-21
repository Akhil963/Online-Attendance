import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';
import realtimeService from '../services/realtimeService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await authAPI.getCurrentUser();
          setUser(response.data.user || response.data.employee || response.data.admin);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // Listen for session invalidation (password changed)
  useEffect(() => {
    const handleSessionInvalidation = (data) => {
      console.warn('⚠️ Session invalidated:', data.reason, data.message);
      // Clear session
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      // Redirect to login
      window.location.href = '/login';
    };

    realtimeService.subscribeToSessionInvalidation(handleSessionInvalidation);

    return () => {
      realtimeService.off('auth:sessionInvalidated', handleSessionInvalidation);
    };
  }, []);

  const login = useCallback(async (identifier, password, role = 'employee') => {
    try {
      const response = await authAPI.login({ identifier, password, role });
      const { token: newToken, employee, admin } = response.data;
      const user = employee || admin; // Handle both admin and employee responses
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (data) => {
    try {
      const response = await authAPI.register(data);
      const { token: newToken, employee, admin } = response.data;
      const user = employee || admin; // Handle both admin and employee responses
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
