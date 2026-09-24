import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER: User = {
  id: 'u-admin',
  username: 'admin',
  name: 'Chef Manager (Admin)',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('oceanchef_auth');
    return saved ? JSON.parse(saved) : MOCK_USER; // Default logged in as admin for demo convenience
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('oceanchef_auth', JSON.stringify(user));
    } else {
      localStorage.removeItem('oceanchef_auth');
    }
  }, [user]);

  const login = (username: string, password: string): boolean => {
    if (username === 'admin' && password === 'admin123') {
      setUser(MOCK_USER);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
