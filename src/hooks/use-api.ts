/**
 * useApi Hook
 * Custom hook for API calls with authentication
 */

'use client';

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface UseApiQueryOptions<TData, TError = Error>
  extends Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> {
  endpoint: string;
  params?: Record<string, string | number | boolean>;
}

export interface UseApiMutationOptions<TData, TVariables, TError = Error>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  method?: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

/**
 * Hook for GET requests
 */
export const useApiQuery = <TData = unknown, TError = Error>(
  queryKey: string[],
  { endpoint, params, ...options }: UseApiQueryOptions<TData, TError>
) => {
  return useQuery<TData, TError>({
    queryKey: [...queryKey, params],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<TData>>(endpoint, { params });
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch data');
      }
      return response.data;
    },
    ...options,
  });
};

/**
 * Hook for POST/PUT/PATCH/DELETE requests
 */
export const useApiMutation = <TData = unknown, TVariables = unknown, TError = Error>(
  endpoint: string,
  { method = 'POST', ...options }: UseApiMutationOptions<TData, TVariables, TError> = {}
) => {
  return useMutation<TData, TError, TVariables>({
    mutationFn: async (variables: TVariables) => {
      let response: ApiResponse<TData>;

      switch (method) {
        case 'POST':
          response = await apiClient.post<ApiResponse<TData>>(endpoint, variables);
          break;
        case 'PUT':
          response = await apiClient.put<ApiResponse<TData>>(endpoint, variables);
          break;
        case 'PATCH':
          response = await apiClient.patch<ApiResponse<TData>>(endpoint, variables);
          break;
        case 'DELETE':
          response = await apiClient.delete<ApiResponse<TData>>(endpoint);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }

      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Request failed');
      }

      return response.data;
    },
    ...options,
  });
};
