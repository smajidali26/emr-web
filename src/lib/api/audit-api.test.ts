/**
 * Audit API Tests
 * Tests for audit API hooks and utilities
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useComplianceMetrics,
  useDailySummaries,
  useStorageStats,
  useRetentionCompliance,
  useAuditLogs,
  auditQueryKeys,
  ComplianceMetrics,
  DailyAuditSummary,
  StorageStatsResponse,
  RetentionComplianceStatus,
  PagedResult,
  AuditLog,
} from './audit-api';

// Mock the api-client
jest.mock('./api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock getAccessToken
jest.mock('@/lib/auth', () => ({
  getAccessToken: jest.fn().mockResolvedValue('mock-token'),
}));

import { apiClient } from './api-client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('auditQueryKeys', () => {
  it('should generate correct query keys for compliance metrics', () => {
    const keys = auditQueryKeys.complianceMetrics('2024-01-01', '2024-01-31');
    expect(keys).toEqual(['audit', 'compliance-metrics', { fromDate: '2024-01-01', toDate: '2024-01-31' }]);
  });

  it('should generate correct query keys for daily summaries', () => {
    const keys = auditQueryKeys.dailySummaries('2024-01-01', '2024-01-31');
    expect(keys).toEqual(['audit', 'daily-summaries', { fromDate: '2024-01-01', toDate: '2024-01-31' }]);
  });

  it('should generate correct query keys for storage stats', () => {
    const keys = auditQueryKeys.storageStats();
    expect(keys).toEqual(['audit', 'storage-stats']);
  });

  it('should generate correct query keys for retention compliance', () => {
    const keys = auditQueryKeys.retentionCompliance();
    expect(keys).toEqual(['audit', 'retention-compliance']);
  });

  it('should generate correct query keys for audit logs', () => {
    const query = { pageNumber: 1, pageSize: 10 };
    const keys = auditQueryKeys.logs(query);
    expect(keys).toEqual(['audit', 'logs', query]);
  });
});

describe('useComplianceMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch compliance metrics successfully', async () => {
    const mockMetrics: ComplianceMetrics = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
      totalAuditEvents: 1000,
      phiAccessCount: 500,
      accessDeniedCount: 10,
      authEventCount: 200,
      failedLoginCount: 5,
      exportPrintCount: 50,
      activeUsers: 25,
      uniqueIpAddresses: 15,
      uniqueSessions: 100,
    };

    mockApiClient.get.mockResolvedValueOnce(mockMetrics);

    const { result } = renderHook(
      () => useComplianceMetrics('2024-01-01', '2024-01-31'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockMetrics);
    expect(mockApiClient.get).toHaveBeenCalledWith('/api/audit/compliance/metrics', {
      params: { fromDate: '2024-01-01', toDate: '2024-01-31' },
    });
  });

  it('should handle errors', async () => {
    mockApiClient.get.mockRejectedValueOnce(new Error('API Error'));

    const { result } = renderHook(
      () => useComplianceMetrics('2024-01-01', '2024-01-31'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe('useDailySummaries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch daily summaries successfully', async () => {
    const mockSummaries: DailyAuditSummary[] = [
      {
        date: '2024-01-01',
        totalEvents: 100,
        successfulEvents: 95,
        failedEvents: 5,
        uniqueUsers: 10,
        averageDurationMs: 150,
      },
      {
        date: '2024-01-02',
        totalEvents: 120,
        successfulEvents: 118,
        failedEvents: 2,
        uniqueUsers: 12,
        averageDurationMs: 145,
      },
    ];

    mockApiClient.get.mockResolvedValueOnce(mockSummaries);

    const { result } = renderHook(
      () => useDailySummaries('2024-01-01', '2024-01-31'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSummaries);
    expect(result.current.data).toHaveLength(2);
  });
});

describe('useStorageStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch storage stats successfully', async () => {
    const mockStorageStats: StorageStatsResponse = {
      storage: {
        totalSizeBytes: 1073741824, // 1GB
        indexSizeBytes: 104857600, // 100MB
        tableSizeBytes: 968884224,
      },
      compression: {
        uncompressedBytes: 2147483648,
        compressedBytes: 214748365,
        compressionRatio: 10.0,
        compressedChunks: 5,
        uncompressedChunks: 1,
        lastCompressionRun: '2024-01-15T10:00:00Z',
      },
      hypertable: {
        isHypertable: true,
        hypertableName: 'AuditLogs',
        schemaName: 'public',
        numChunks: 6,
        totalRows: 1000000,
        chunkTimeInterval: 'P1M',
        compressionEnabled: true,
        retentionPolicyEnabled: true,
      },
    };

    mockApiClient.get.mockResolvedValueOnce(mockStorageStats);

    const { result } = renderHook(() => useStorageStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStorageStats);
    expect(result.current.data?.hypertable.isHypertable).toBe(true);
    expect(result.current.data?.compression.compressionRatio).toBe(10.0);
  });
});

describe('useRetentionCompliance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch retention compliance status successfully', async () => {
    const mockCompliance: RetentionComplianceStatus = {
      isCompliant: true,
      complianceMessage: 'HIPAA compliant - 7-year retention policy active',
      retentionDays: 2555,
      actualRetentionDays: 365,
      totalRecords: 1000000,
      earliestRecord: '2023-01-01T00:00:00Z',
      latestRecord: '2024-01-15T12:00:00Z',
    };

    mockApiClient.get.mockResolvedValueOnce(mockCompliance);

    const { result } = renderHook(() => useRetentionCompliance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockCompliance);
    expect(result.current.data?.isCompliant).toBe(true);
    expect(result.current.data?.retentionDays).toBe(2555); // 7 years
  });

  it('should show non-compliant status when applicable', async () => {
    const mockNonCompliance: RetentionComplianceStatus = {
      isCompliant: false,
      complianceMessage: 'Warning: Records older than 7 years detected',
      retentionDays: 2555,
      actualRetentionDays: 2800,
      totalRecords: 1500000,
      earliestRecord: '2016-01-01T00:00:00Z',
      latestRecord: '2024-01-15T12:00:00Z',
    };

    mockApiClient.get.mockResolvedValueOnce(mockNonCompliance);

    const { result } = renderHook(() => useRetentionCompliance(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.isCompliant).toBe(false);
  });
});

describe('useAuditLogs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch paginated audit logs successfully', async () => {
    const mockLogs: PagedResult<AuditLog> = {
      items: [
        {
          id: '1',
          eventType: 1,
          eventTypeName: 'View',
          userId: 'user-1',
          username: 'john.doe',
          timestamp: '2024-01-15T10:00:00Z',
          resourceType: 'Patient',
          resourceId: 'patient-123',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          action: 'Viewed patient record',
          details: null,
          success: true,
          errorMessage: null,
          httpMethod: 'GET',
          requestPath: '/api/patients/123',
          statusCode: 200,
          durationMs: 150,
          sessionId: 'session-1',
          correlationId: 'corr-1',
        },
      ],
      totalCount: 100,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 10,
      hasNextPage: true,
      hasPreviousPage: false,
    };

    mockApiClient.get.mockResolvedValueOnce(mockLogs);

    const { result } = renderHook(
      () => useAuditLogs({ pageNumber: 1, pageSize: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockLogs);
    expect(result.current.data?.items).toHaveLength(1);
    expect(result.current.data?.totalPages).toBe(10);
  });

  it('should include filters in the API call', async () => {
    const mockLogs: PagedResult<AuditLog> = {
      items: [],
      totalCount: 0,
      pageNumber: 1,
      pageSize: 10,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    };

    mockApiClient.get.mockResolvedValueOnce(mockLogs);

    const { result } = renderHook(
      () =>
        useAuditLogs({
          pageNumber: 1,
          pageSize: 10,
          userId: 'user-1',
          eventType: 'View',
          fromDate: '2024-01-01',
          toDate: '2024-01-31',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockApiClient.get).toHaveBeenCalledWith('/api/audit', {
      params: expect.objectContaining({
        pageNumber: 1,
        pageSize: 10,
        userId: 'user-1',
        eventType: 'View',
        fromDate: '2024-01-01',
        toDate: '2024-01-31',
      }),
    });
  });
});
