'use client';

import { useState, useEffect } from 'react';

export interface App {
  id: string;
  name: string;
  fullName: string;
  description: string;
  status: 'active' | 'under_development';
  url: string;
  color: string;
  icon: string;
}

export interface UseAppStatusReturn {
  apps: App[];
  activeApps: App[];
  underDevelopmentApps: App[];
  isLoading: boolean;
  error: string | null;
}

/**
 * useAppStatus hook - fetch app definitions and status
 */
export function useAppStatus(): UseAppStatusReturn {
  const [apps, setApps] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('sessionToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch('/api/apps', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch apps');
        }

        const data = await response.json();
        setApps(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to load apps';
        setError(message);
        console.error('Apps fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, []);

  const activeApps = apps.filter((app) => app.status === 'active');
  const underDevelopmentApps = apps.filter(
    (app) => app.status === 'under_development'
  );

  return {
    apps,
    activeApps,
    underDevelopmentApps,
    isLoading,
    error,
  };
}
