/**
 * Auth API
 * API functions and hooks for authentication operations
 */

import { apiClient } from './api-client';
import { User } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// API Endpoints
const AUTH_ENDPOINTS = {
  ME: '/api/auth/me',
  REGISTER: '/api/auth/register',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
} as const;

// Query Keys
export const AUTH_QUERY_KEYS = {
  currentUser: ['auth', 'current-user'] as const,
  userProfile: (userId: string) => ['auth', 'user-profile', userId] as const,
} as const;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  return apiClient.get<User>(AUTH_ENDPOINTS.ME);
}

/**
 * Register new user
 */
export interface RegisterUserRequest {
  email: string;
  name: string;
  phoneNumber?: string;
  roles: string[];
  tenantId?: string;
}

export async function registerUser(data: RegisterUserRequest): Promise<User> {
  return apiClient.post<User>(AUTH_ENDPOINTS.REGISTER, data);
}

/**
 * Refresh authentication token
 */
export async function refreshAuthToken(): Promise<{ token: string }> {
  return apiClient.post<{ token: string }>(AUTH_ENDPOINTS.REFRESH);
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<void> {
  return apiClient.post<void>(AUTH_ENDPOINTS.LOGOUT);
}

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook to get current user
 */
export interface UseCurrentUserOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

export function useCurrentUser(options: UseCurrentUserOptions = {}) {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutes
  } = options;

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: getCurrentUser,
    enabled,
    refetchOnWindowFocus,
    staleTime,
    retry: false,
  });
}

/**
 * Hook to register user
 */
export function useRegisterUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      // Update current user cache
      queryClient.setQueryData(AUTH_QUERY_KEYS.currentUser, data);
    },
  });
}

/**
 * Hook to refresh token
 */
export function useRefreshToken() {
  return useMutation({
    mutationFn: refreshAuthToken,
  });
}

/**
 * Hook to logout user
 */
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear all auth-related queries
      queryClient.removeQueries({ queryKey: ['auth'] });
      queryClient.clear();
    },
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Invalidate current user query
 */
export function invalidateCurrentUser(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.currentUser });
}

/**
 * Prefetch current user
 */
export async function prefetchCurrentUser(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.prefetchQuery({
    queryKey: AUTH_QUERY_KEYS.currentUser,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });
}
