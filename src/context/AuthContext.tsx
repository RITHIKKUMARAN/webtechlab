import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/index.ts';

interface AuthContextType extends AuthState {
  login: (emailId: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: { username: string; emailId: string; age: number; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateUserSession: (user: User) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'lumina_auth_token';
const USER_KEY = 'lumina_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  const login = async (emailId: string, password: string) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailId, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Login failed.' };
      }

      setToken(data.token);
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network connection failed.' };
    }
  };

  const register = async (userData: { username: string; emailId: string; age: number; password: string }) => {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error || 'Registration failed.' };
      }

      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
      }
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error during registration.' };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUserSession = (updated: User) => {
    setUser(updated);
  };

  const refreshUserData = async () => {
    if (!token || !user?.emailId) return;
    const res = await fetch(`/api/users?emailId=${encodeURIComponent(user.emailId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.status === 401) logout();
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
        updateUserSession,
        refreshUserData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
