'use client';

import { useState, useEffect } from 'react';

export interface Session {
  id: string;
  appId: string;
  appName: string;
  topic: string;
  launchedAt: string;
  timeAgo: string;
  pillar: string;
}

export interface UseUserSessionsReturn {
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  recordSession: (appId: string, topic?: string) => Promise<void>;
}

/**
 * useUserSessions hook - fetch user's sessions and record new ones
 */
export function useUserSessions(): UseUserSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('sessionToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch('/api/apps/sessions', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }

        const data = await response.json();
        setSessions(data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load sessions';
        setError(message);
        console.error('Sessions fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const recordSession = async (appId: string, topic?: string) => {
    try {
      const token = localStorage.getItem('sessionToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/apps/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ appId, topic }),
      });

      if (!response.ok) {
        throw new Error('Failed to record session');
      }

      // Refresh sessions list
      const listResponse = await fetch('/api/apps/sessions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (listResponse.ok) {
        const data = await listResponse.json();
        setSessions(data);
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to record session';
      setError(message);
      console.error('Session record error:', err);
      throw err;
    }
  };

  return {
    sessions,
    isLoading,
    error,
    recordSession,
  };
}
