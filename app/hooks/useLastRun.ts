'use client';

import { useState, useEffect } from 'react';

export interface LastRunMap {
  [appId: string]: {
    lastRunAt: string | null;
    timeAgo: string | null;
  };
}

export interface UseLastRunReturn {
  lastRunMap: LastRunMap;
  isLoading: boolean;
  error: string | null;
  getLastRun: (appId: string) => string | null;
  updateLastRun: (appId: string) => Promise<void>;
}

/**
 * useLastRun hook - fetch and update last run times for apps
 */
export function useLastRun(appIds: string[]): UseLastRunReturn {
  const [lastRunMap, setLastRunMap] = useState<LastRunMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appIds.length === 0) {
      setLastRunMap({});
      setIsLoading(false);
      return;
    }

    const fetchLastRuns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const token = localStorage.getItem('sessionToken');
        if (!token) {
          throw new Error('No authentication token');
        }

        const map: LastRunMap = {};

        for (const appId of appIds) {
          try {
            const response = await fetch(`/api/apps/${appId}/last-run`, {
              method: 'GET',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const data = await response.json();
              map[appId] = {
                lastRunAt: data.lastRunAt,
                timeAgo: data.timeAgo,
              };
            } else {
              map[appId] = {
                lastRunAt: null,
                timeAgo: null,
              };
            }
          } catch (err) {
            console.error(`Failed to fetch last run for ${appId}:`, err);
            map[appId] = {
              lastRunAt: null,
              timeAgo: null,
            };
          }
        }

        setLastRunMap(map);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Failed to load last run times';
        setError(message);
        console.error('Last run fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastRuns();
  }, [appIds]);

  const getLastRun = (appId: string): string | null => {
    return lastRunMap[appId]?.timeAgo || null;
  };

  const updateLastRun = async (appId: string) => {
    try {
      const token = localStorage.getItem('sessionToken');
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await fetch(`/api/apps/${appId}/last-run`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update last run');
      }

      const data = await response.json();

      setLastRunMap((prev) => ({
        ...prev,
        [appId]: {
          lastRunAt: data.lastRunAt,
          timeAgo: data.timeAgo,
        },
      }));
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to update last run';
      setError(message);
      console.error('Last run update error:', err);
      throw err;
    }
  };

  return {
    lastRunMap,
    isLoading,
    error,
    getLastRun,
    updateLastRun,
  };
}
