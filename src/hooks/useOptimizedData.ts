import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  loading: boolean;
}

interface UseOptimizedDataOptions {
  cacheTime?: number; // Cache duration in milliseconds
  staleTime?: number; // Time before data is considered stale
  refetchOnMount?: boolean;
}

const DEFAULT_OPTIONS: UseOptimizedDataOptions = {
  cacheTime: 5 * 60 * 1000, // 5 minutes
  staleTime: 2 * 60 * 1000, // 2 minutes
  refetchOnMount: false,
};

// Global cache store
const globalCache = new Map<string, CacheEntry<any>>();
const pendingRequests = new Map<string, Promise<any>>();

export function useOptimizedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseOptimizedDataOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const isStale = useCallback((timestamp: number) => {
    return Date.now() - timestamp > opts.staleTime!;
  }, [opts.staleTime]);

  const isExpired = useCallback((timestamp: number) => {
    return Date.now() - timestamp > opts.cacheTime!;
  }, [opts.cacheTime]);

  const fetchData = useCallback(async (force = false) => {
    // Check if we have cached data and it's not expired
    const cached = globalCache.get(key);
    if (!force && cached && !isExpired(cached.timestamp)) {
      if (!mountedRef.current) return cached.data;
      
      setData(cached.data);
      setLoading(false);
      setError(null);
      
      // If data is stale but not expired, fetch in background
      if (isStale(cached.timestamp)) {
        fetchData(true);
      }
      
      return cached.data;
    }

    // Check if there's already a pending request for this key
    const pendingRequest = pendingRequests.get(key);
    if (pendingRequest && !force) {
      try {
        const result = await pendingRequest;
        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setError(null);
        }
        return result;
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
        throw err;
      }
    }

    if (mountedRef.current) {
      setLoading(true);
      setError(null);
    }

    // Create new request
    const request = fetcher()
      .then((result) => {
        // Cache the result
        globalCache.set(key, {
          data: result,
          timestamp: Date.now(),
          loading: false,
        });

        if (mountedRef.current) {
          setData(result);
          setLoading(false);
          setError(null);
        }

        return result;
      })
      .catch((err) => {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : 'An error occurred');
          setLoading(false);
        }
        throw err;
      })
      .finally(() => {
        pendingRequests.delete(key);
      });

    pendingRequests.set(key, request);
    return request;
  }, [key, fetcher, isExpired, isStale, opts.cacheTime, opts.staleTime]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidate = useCallback(() => {
    globalCache.delete(key);
    pendingRequests.delete(key);
  }, [key]);

  // Initial fetch
  useEffect(() => {
    if (opts.refetchOnMount || !globalCache.has(key)) {
      fetchData();
    } else {
      // Use cached data if available
      const cached = globalCache.get(key);
      if (cached && !isExpired(cached.timestamp)) {
        setData(cached.data);
        setLoading(false);
        
        // Fetch in background if stale
        if (isStale(cached.timestamp)) {
          fetchData(true);
        }
      } else {
        fetchData();
      }
    }
  }, [key, fetchData, opts.refetchOnMount, isExpired, isStale]);

  return {
    data,
    loading,
    error,
    refetch,
    invalidate,
    isStale: data ? isStale(globalCache.get(key)?.timestamp || 0) : false,
  };
}

// Utility function to clear all cache
export const clearAllCache = () => {
  globalCache.clear();
  pendingRequests.clear();
};

// Utility function to clear specific cache entries
export const clearCache = (keys: string[]) => {
  keys.forEach(key => {
    globalCache.delete(key);
    pendingRequests.delete(key);
  });
};

// Utility function to prefetch data
export const prefetchData = async <T>(
  key: string,
  fetcher: () => Promise<T>
): Promise<T> => {
  const cached = globalCache.get(key);
  if (cached && Date.now() - cached.timestamp < DEFAULT_OPTIONS.cacheTime!) {
    return cached.data;
  }

  const pendingRequest = pendingRequests.get(key);
  if (pendingRequest) {
    return pendingRequest;
  }

  const request = fetcher().then((result) => {
    globalCache.set(key, {
      data: result,
      timestamp: Date.now(),
      loading: false,
    });
    return result;
  }).finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, request);
  return request;
}; 