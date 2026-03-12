'use client';

import { useState, useEffect } from 'react';

export interface UserSettings {
  id: string;
  email: string;
  fullName: string;
  orgUnit: string;
  classificationLevel: string;
}

export interface UseUserSettingsReturn {
  settings: UserSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSettings: (updates: Partial<UserSettings>) => Promise<void>;
}

/**
 * useUserSettings hook - fetch and update user settings
 */
export function useUserSettings(userId: string | null): UseUserSettingsReturn {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user settings
  useEffect(() => {
    if (!userId) {
      setSettings(null);
      return;
    }

    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('sessionToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch(`/api/users/${userId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }

        const data = await response.json();
        setSettings(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load settings';
        setError(message);
        console.error('Settings fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [userId]);

  const updateSettings = async (
    updates: Partial<UserSettings>
  ) => {
    if (!userId) {
      throw new Error('No user ID');
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem('sessionToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to update settings';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSettings,
  };
}
