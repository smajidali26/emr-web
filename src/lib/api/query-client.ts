/**
 * TanStack Query Client Configuration
 * Configures React Query for data fetching and caching
 * SECURITY FIX: Reduced cache time for PHI data from 30min to 5min (HIPAA compliance)
 * SECURITY FIX: Task #2658 - Added rate limit handling with retry delay
 * Assigned: Elizabeth Nelson (4h)
 */

import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { ApiError } from '@/types';

/**
 * Calculate retry delay for rate-limited requests
 * Uses exponential backoff with jitter for 429 responses
 * SECURITY FIX: Task #2658 - Rate limit aware retry delays
 */
const calculateRetryDelay = (failureCount: number, error: unknown): number => {
  const baseDelay = 1000; // 1 second base

  // Check if it's a rate limit error with retry-after info
  if (error && typeof error === 'object' && 'statusCode' in error) {
    const apiError = error as ApiError;

    if (apiError.statusCode === 429 && apiError.details?.retryAfterSeconds) {
      // Use server-provided retry-after with small jitter
      const retryAfter = apiError.details.retryAfterSeconds as number;
      const jitter = Math.random() * 0.2 * retryAfter * 1000;
      return Math.min(retryAfter * 1000 + jitter, 30000); // Max 30 seconds
    }
  }

  // Default exponential backoff: 1s, 2s, 4s...
  const exponentialDelay = baseDelay * Math.pow(2, failureCount);
  const jitter = Math.random() * 0.2 * exponentialDelay;
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
};

/**
 * Default query options
 * SECURITY: PHI data cache time reduced to 5 minutes for HIPAA compliance
 * SECURITY: Rate limit errors (429) are retried with appropriate delays
 */
const defaultQueryOptions = {
  queries: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 5, // 5 minutes (SECURITY FIX: Reduced from 30min for PHI data)
    retry: (failureCount: number, error: unknown) => {
      // Don't retry on most 4xx errors
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as ApiError).statusCode;

        // SECURITY FIX: Task #2658 - Allow retry on 429 (rate limit) with delay
        // The apiClient already handles 429 with retries, but if it exhausts retries,
        // TanStack Query can attempt again with its own delay strategy
        if (statusCode === 429) {
          // Only retry 429 up to 2 additional times at the Query level
          return failureCount < 2;
        }

        // Don't retry other 4xx errors (auth failures, not found, etc.)
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          return false;
        }
      }
      // Retry up to 3 times for server errors (5xx)
      return failureCount < 3;
    },
    retryDelay: calculateRetryDelay,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  },
  mutations: {
    // SECURITY FIX: Task #2658 - Allow mutation retry on rate limits
    retry: (failureCount: number, error: unknown) => {
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as ApiError).statusCode;
        // Only retry mutations on rate limit, and only once
        if (statusCode === 429) {
          return failureCount < 1;
        }
      }
      return false;
    },
    retryDelay: calculateRetryDelay,
  },
};

/**
 * Query cache with error handling
 */
const queryCache = new QueryCache({
  onError: (error, query) => {
    console.error('Query error:', error, 'Query key:', query.queryKey);
  },
});

/**
 * Mutation cache with error handling
 */
const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    console.error('Mutation error:', error, 'Mutation key:', mutation.options.mutationKey);
  },
  onSuccess: (_data, _variables, _context, mutation) => {
    console.info('Mutation success:', mutation.options.mutationKey);
  },
});

/**
 * Create query client instance
 */
export const queryClient = new QueryClient({
  defaultOptions: defaultQueryOptions,
  queryCache,
  mutationCache,
});

/**
 * Query keys factory
 * Helps maintain consistent query keys across the application
 */
export const queryKeys = {
  auth: {
    user: ['auth', 'user'] as const,
    tokens: ['auth', 'tokens'] as const,
  },
  patients: {
    all: ['patients'] as const,
    list: (filters?: Record<string, unknown>) => ['patients', 'list', filters] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
    demographics: (id: string) => ['patients', id, 'demographics'] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    list: (filters?: Record<string, unknown>) => ['appointments', 'list', filters] as const,
    detail: (id: string) => ['appointments', 'detail', id] as const,
  },
  encounters: {
    all: ['encounters'] as const,
    list: (filters?: Record<string, unknown>) => ['encounters', 'list', filters] as const,
    detail: (id: string) => ['encounters', 'detail', id] as const,
  },
  orders: {
    all: ['orders'] as const,
    list: (filters?: Record<string, unknown>) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
  },
};
