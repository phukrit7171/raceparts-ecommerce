'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';
import logger from '@/utils/logger';

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
      logger.info('Refreshing authentication status');
      const response = await authAPI.me();
      setUser(response.data.user);
      setIsAuthenticated(true);
      logger.info('Authentication refreshed successfully', { userId: response.data.user.id });
      return true;
    } catch (error) {
      logger.error('Auth refresh failed:', { error });
      setUser(null);
      setIsAuthenticated(false);
      
      if (!publicPaths.includes(pathname)) {
        logger.info('Redirecting to login page');
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
      logger.info('Attempting login', { email });
      const response = await authAPI.login({ email, password });
      setUser(response.data.user);
      setIsAuthenticated(true);
      logger.info('Login successful', { userId: response.data.user.id });
      router.replace('/');
    } catch (error) {
      logger.error('Login failed:', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setLoading(true);
    try {
      logger.info('Attempting registration', { email: data.email });
      await authAPI.register(data);
      logger.info('Registration successful', { email: data.email });
      return true;
    } catch (error) {
      logger.error('Registration failed:', { error });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      logger.info('Attempting logout', { userId: user?.id });
      await authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      logger.info('Logout successful');
      router.push('/auth/login');
    } catch (error) {
      logger.error('Logout failed:', { error });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (publicPaths.includes(pathname)) {
        logger.debug('Skipping auth check for public path', { pathname });
        setLoading(false);
        return;
      }
      
      logger.debug('Checking authentication status');
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