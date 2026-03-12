'use client';

import { useState, useEffect } from 'react';

export interface PlatformComponent {
  id: string;
  label: string;
  state: 'operational' | 'degraded' | 'outage';
  note: string;
}

export interface UsePlatformStatusReturn {
  components: PlatformComponent[];
  overallState: 'healthy' | 'warning' | 'critical';
  isLoading: boolean;
  error: string | null;
}

/**
 * usePlatformStatus hook - fetch platform component health
 */
export function usePlatformStatus(): UsePlatformStatusReturn {
  const [components, setComponents] = useState<PlatformComponent[]>([]);
  const [overallState, setOverallState] = useState<
    'healthy' | 'warning' | 'critical'
  >('healthy');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('sessionToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        const response = await fetch('/api/platform/status', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch platform status');
        }

        const data = await response.json();
        setComponents(data.components);
        setOverallState(data.overallState);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load platform status';
        setError(message);
        console.error('Platform status fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return {
    components,
    overallState,
    isLoading,
    error,
  };
}
