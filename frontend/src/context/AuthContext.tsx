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

interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<boolean>;
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
      setUser(response.data.user);
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
      const response = await authAPI.login({ email, password });
      // Set user data immediately from the login response
      setUser(response.data.user);
      setIsAuthenticated(true);
      router.replace('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      await authAPI.register(data);
      // Remove automatic login after registration
      return true;
    } catch (error) {
      throw error;
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