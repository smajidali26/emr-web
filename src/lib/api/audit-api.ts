/**
 * Audit API Hooks
 * HIPAA Compliance Dashboard API integration
 * Task #835 - Admin Console UI Development
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './api-client';

// API Types
export interface DailyAuditSummary {
  date: string;
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  uniqueUsers: number;
  averageDurationMs: number;
}

export interface ComplianceMetrics {
  startDate: string;
  endDate: string;
  totalAuditEvents: number;
  phiAccessCount: number;
  accessDeniedCount: number;
  authEventCount: number;
  failedLoginCount: number;
  exportPrintCount: number;
  activeUsers: number;
  uniqueIpAddresses: number;
  uniqueSessions: number;
}

export interface HourlyActivityTrend {
  hour: number;
  eventCount: number;
  uniqueUsers: number;
}

export interface TopUserActivity {
  userId: string;
  username: string | null;
  totalActions: number;
  lastActivity: string | null;
}

export interface UserActivitySummary {
  userId: string;
  username: string | null;
  totalActions: number;
  resourceTypesAccessed: number;
  viewCount: number;
  createCount: number;
  updateCount: number;
  deleteCount: number;
  failedActions: number;
  firstActivity: string | null;
  lastActivity: string | null;
}

export interface ResourceAccessSummary {
  resourceType: string;
  resourceId: string | null;
  totalAccesses: number;
  uniqueUsers: number;
  viewCount: number;
  modificationCount: number;
  lastAccessed: string | null;
}

export interface RetentionComplianceStatus {
  isCompliant: boolean;
  complianceMessage: string;
  retentionDays: number;
  actualRetentionDays: number;
  totalRecords: number;
  earliestRecord: string | null;
  latestRecord: string | null;
}

export interface HypertableInfo {
  isHypertable: boolean;
  hypertableName: string;
  schemaName: string;
  numChunks: number;
  totalRows: number;
  chunkTimeInterval: string;
  compressionEnabled: boolean;
  retentionPolicyEnabled: boolean;
}

export interface CompressionStats {
  uncompressedBytes: number;
  compressedBytes: number;
  compressionRatio: number;
  compressedChunks: number;
  uncompressedChunks: number;
  lastCompressionRun: string | null;
}

export interface StorageStats {
  totalSizeBytes: number;
  indexSizeBytes: number;
  tableSizeBytes: number;
}

export interface StorageStatsResponse {
  storage: StorageStats;
  compression: CompressionStats;
  hypertable: HypertableInfo;
}

export interface ChunkInfo {
  chunkName: string;
  rangeStart: string;
  rangeEnd: string;
  sizeBytes: number;
  isCompressed: boolean;
}

export interface AuditLog {
  id: string;
  eventType: number;
  eventTypeName: string;
  userId: string;
  username: string | null;
  timestamp: string;
  resourceType: string;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  action: string;
  details: string | null;
  success: boolean;
  errorMessage: string | null;
  httpMethod: string | null;
  requestPath: string | null;
  statusCode: number | null;
  durationMs: number | null;
  sessionId: string | null;
  correlationId: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface AuditLogQuery {
  userId?: string;
  eventType?: string;
  resourceType?: string;
  resourceId?: string;
  fromDate?: string;
  toDate?: string;
  success?: boolean;
  searchTerm?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Query Keys
export const auditQueryKeys = {
  all: ['audit'] as const,
  complianceMetrics: (fromDate?: string, toDate?: string) =>
    [...auditQueryKeys.all, 'compliance-metrics', { fromDate, toDate }] as const,
  dailySummaries: (fromDate?: string, toDate?: string) =>
    [...auditQueryKeys.all, 'daily-summaries', { fromDate, toDate }] as const,
  hourlyTrend: (date?: string) =>
    [...auditQueryKeys.all, 'hourly-trend', { date }] as const,
  topActiveUsers: (fromDate?: string, toDate?: string, limit?: number) =>
    [...auditQueryKeys.all, 'top-active-users', { fromDate, toDate, limit }] as const,
  userActivity: (userId: string, fromDate?: string, toDate?: string) =>
    [...auditQueryKeys.all, 'user-activity', userId, { fromDate, toDate }] as const,
  storageStats: () => [...auditQueryKeys.all, 'storage-stats'] as const,
  retentionCompliance: () => [...auditQueryKeys.all, 'retention-compliance'] as const,
  chunks: () => [...auditQueryKeys.all, 'chunks'] as const,
  logs: (query: AuditLogQuery) => [...auditQueryKeys.all, 'logs', query] as const,
};

// API Functions
const auditApi = {
  getComplianceMetrics: async (fromDate?: string, toDate?: string): Promise<ComplianceMetrics> => {
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get('/api/audit/compliance/metrics', { params });
  },

  getDailySummaries: async (fromDate?: string, toDate?: string): Promise<DailyAuditSummary[]> => {
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get('/api/audit/daily-summaries', { params });
  },

  getHourlyTrend: async (date?: string): Promise<HourlyActivityTrend[]> => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    return apiClient.get('/api/audit/hourly-trend', { params });
  },

  getTopActiveUsers: async (fromDate?: string, toDate?: string, limit = 10): Promise<TopUserActivity[]> => {
    const params: Record<string, string | number> = { limit };
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get('/api/audit/users/top-active', { params });
  },

  getUserActivity: async (userId: string, fromDate?: string, toDate?: string): Promise<UserActivitySummary> => {
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    return apiClient.get(`/api/audit/users/${userId}/activity`, { params });
  },

  getStorageStats: async (): Promise<StorageStatsResponse> => {
    return apiClient.get('/api/audit/storage/stats');
  },

  getRetentionCompliance: async (): Promise<RetentionComplianceStatus> => {
    return apiClient.get('/api/audit/compliance/retention');
  },

  getChunks: async (): Promise<ChunkInfo[]> => {
    return apiClient.get('/api/audit/storage/chunks');
  },

  getAuditLogs: async (query: AuditLogQuery): Promise<PagedResult<AuditLog>> => {
    const params: Record<string, string | number | boolean> = {};
    if (query.userId) params.userId = query.userId;
    if (query.eventType) params.eventType = query.eventType;
    if (query.resourceType) params.resourceType = query.resourceType;
    if (query.resourceId) params.resourceId = query.resourceId;
    if (query.fromDate) params.fromDate = query.fromDate;
    if (query.toDate) params.toDate = query.toDate;
    if (query.success !== undefined) params.success = query.success;
    if (query.searchTerm) params.searchTerm = query.searchTerm;
    if (query.pageNumber) params.pageNumber = query.pageNumber;
    if (query.pageSize) params.pageSize = query.pageSize;
    return apiClient.get('/api/audit', { params });
  },

  exportAuditLogs: async (fromDate: string, toDate: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
    // Validate inputs
    if (!fromDate || !toDate) {
      throw new Error('Date range is required');
    }

    // Build URL with proper encoding
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!baseUrl) {
      throw new Error('API URL not configured');
    }

    const params = new URLSearchParams({
      fromDate: encodeURIComponent(fromDate),
      toDate: encodeURIComponent(toDate),
      format,
    });

    const token = await getAccessToken();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for large exports

    try {
      const response = await fetch(
        `${baseUrl}/api/audit/export/stream?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`);
      }

      return response.blob();
    } finally {
      clearTimeout(timeoutId);
    }
  },

  refreshAggregates: async (): Promise<void> => {
    return apiClient.post('/api/audit/maintenance/refresh-aggregates');
  },
};

// Helper to get access token
async function getAccessToken(): Promise<string> {
  const { getAccessToken: getToken } = await import('@/lib/auth');
  return getToken();
}

// React Query Hooks
export function useComplianceMetrics(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: auditQueryKeys.complianceMetrics(fromDate, toDate),
    queryFn: () => auditApi.getComplianceMetrics(fromDate, toDate),
  });
}

export function useDailySummaries(fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: auditQueryKeys.dailySummaries(fromDate, toDate),
    queryFn: () => auditApi.getDailySummaries(fromDate, toDate),
  });
}

export function useHourlyTrend(date?: string) {
  return useQuery({
    queryKey: auditQueryKeys.hourlyTrend(date),
    queryFn: () => auditApi.getHourlyTrend(date),
  });
}

export function useTopActiveUsers(fromDate?: string, toDate?: string, limit = 10) {
  return useQuery({
    queryKey: auditQueryKeys.topActiveUsers(fromDate, toDate, limit),
    queryFn: () => auditApi.getTopActiveUsers(fromDate, toDate, limit),
  });
}

export function useUserActivity(userId: string, fromDate?: string, toDate?: string) {
  return useQuery({
    queryKey: auditQueryKeys.userActivity(userId, fromDate, toDate),
    queryFn: () => auditApi.getUserActivity(userId, fromDate, toDate),
    enabled: !!userId,
  });
}

export function useStorageStats() {
  return useQuery({
    queryKey: auditQueryKeys.storageStats(),
    queryFn: auditApi.getStorageStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRetentionCompliance() {
  return useQuery({
    queryKey: auditQueryKeys.retentionCompliance(),
    queryFn: auditApi.getRetentionCompliance,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useChunks() {
  return useQuery({
    queryKey: auditQueryKeys.chunks(),
    queryFn: auditApi.getChunks,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useAuditLogs(query: AuditLogQuery) {
  return useQuery({
    queryKey: auditQueryKeys.logs(query),
    queryFn: () => auditApi.getAuditLogs(query),
  });
}

export function useExportAuditLogs() {
  return useMutation({
    mutationFn: ({ fromDate, toDate, format }: { fromDate: string; toDate: string; format: 'csv' | 'json' }) =>
      auditApi.exportAuditLogs(fromDate, toDate, format),
    onSuccess: (blob, { fromDate, toDate, format }) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${fromDate}_${toDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

export function useRefreshAggregates() {
  return useMutation({
    mutationFn: auditApi.refreshAggregates,
  });
}
