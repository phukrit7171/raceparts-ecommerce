'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; first_name: string; last_name: string; }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const publicPaths = useMemo(() => ['/auth/login', '/auth/register'], []);

  const refreshAuth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await authAPI.me();
      setUser(response.data);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setUser(null);
      setIsAuthenticated(false);
      
      // Only redirect if not already on a public path
      if (!publicPaths.includes(pathname)) {
        router.push('/auth/login');
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [pathname, publicPaths, router]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      await authAPI.login({ email, password });
      await refreshAuth();
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string; }) => {
    setLoading(true);
    try {
      await authAPI.register(data);
      // After registration, log the user in
      await login(data.email, data.password);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check auth status on mount and when pathname changes
  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth on public routes
      if (publicPaths.includes(pathname)) {
        setLoading(false);
        return;
      }
      
      await refreshAuth();
    };

    checkAuth();
  }, [pathname, publicPaths, refreshAuth]);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        isAuthenticated,
        login, 
        register, 
        logout, 
        refreshAuth 
      }}
    >
      {!loading && (publicPaths.includes(pathname) || isAuthenticated) ? children : null}
    </AuthContext.Provider>
  );
};