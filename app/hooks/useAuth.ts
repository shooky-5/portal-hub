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
  login: (email?: string) => Promise<void>;
  logout: () => void;
}

/**
 * useAuth hook - handles authentication and user state
 * Auto-logs in demo user on mount
 */
export function useAuth(): UseAuthReturn {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-login on mount
  useEffect(() => {
    const autoLogin = async () => {
      try {
        setIsLoading(true);

        // Check if we have a stored token
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

        // No valid token, try auto-login with demo user
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'demo@armory.gov', auto: true }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          localStorage.setItem('sessionToken', data.token);
          setCurrentUser(data.user);
          setError(null);
        } else {
          setError('Failed to authenticate');
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError(
          err instanceof Error ? err.message : 'Authentication failed'
        );
      } finally {
        setIsLoading(false);
      }
    };

    autoLogin();
  }, []);

  const login = async (email: string = 'demo@armory.gov') => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      localStorage.setItem('sessionToken', data.token);
      setCurrentUser(data.user);
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
