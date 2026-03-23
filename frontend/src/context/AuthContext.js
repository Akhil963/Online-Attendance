import React, { createContext, useState, useCallback, useEffect } from 'react';
import { authAPI } from '../services/api';
import realtimeService from '../services/realtimeService';
import { playNotificationSound } from '../utils/notificationSound';

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
          // Only logout if it's an authentication error (401/403), not network issues
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('token');
            setToken(null);
          }
          // For network errors, keep the token and user state - will retry on next visit
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

  // Ensure realtime connection stays active for authenticated users.
  useEffect(() => {
    if (!token) {
      realtimeService.disconnect();
      return;
    }

    realtimeService.connect(token)
      .then(() => {
        if (user?.role === 'admin') {
          realtimeService.emit('join:admin', {});
        }
      })
      .catch((error) => {
        console.error('Failed to initialize realtime connection:', error);
      });
  }, [token, user?.role]);

  // Play sound globally for important realtime events.
  useEffect(() => {
    if (!token) {
      return;
    }

    const eventsWithSound = ['notification:new', 'leave:statusChanged', 'employee:statusUpdated'];
    const handlers = eventsWithSound.map((eventName) => {
      const handler = () => playNotificationSound();
      realtimeService.on(eventName, handler);
      return { eventName, handler };
    });

    return () => {
      handlers.forEach(({ eventName, handler }) => {
        realtimeService.off(eventName, handler);
      });
    };
  }, [token]);

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

  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const response = await authAPI.getCurrentUser();
      const updatedUser = response.data.user || response.data.employee || response.data.admin;
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      return null;
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};
