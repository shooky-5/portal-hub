'use client';

import { useState, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  fullName: string;
  orgUnit: string;
  classificationLevel: string;
}

export interface UseAuthReturn {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

/**
 * useAuth hook - handles authentication and user state
 * Requires explicit login - no auto-login
 */
export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for stored token on mount only
  useEffect(() => {
    const checkStoredToken = async () => {
      try {
        const storedToken = localStorage.getItem('sessionToken');

        if (storedToken) {
          // Validate existing token
          try {
            const response = await fetch('/api/auth/validate', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${storedToken}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              localStorage.setItem('sessionToken', data.token);
              setCurrentUser(data.user);
              setError(null);
              setIsLoading(false);
              return;
            }
          } catch (err) {
            // Token validation failed, clear it
            localStorage.removeItem('sessionToken');
          }
        }

        // No valid token - user needs to login
        setIsLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        setIsLoading(false);
      }
    };

    checkStoredToken();
  }, []);

  const login = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!email) {
        throw new Error('Email is required');
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('sessionToken', data.token);
      setCurrentUser(data.user);
      setError(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('sessionToken');
    setCurrentUser(null);
    setError(null);
  };

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated: currentUser !== null,
    login,
    logout,
  };
}
