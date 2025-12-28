/**
 * StorageStatsCard Component Tests
 */

import { render, screen } from '@/test-utils';
import { StorageStatsCard } from './storage-stats-card';
import { useStorageStats, useRetentionCompliance } from '@/lib/api/audit-api';

// Mock the audit API hooks
jest.mock('@/lib/api/audit-api', () => ({
  useStorageStats: jest.fn(),
  useRetentionCompliance: jest.fn(),
}));

const mockUseStorageStats = useStorageStats as jest.Mock;
const mockUseRetentionCompliance = useRetentionCompliance as jest.Mock;

describe('StorageStatsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseStorageStats.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    mockUseRetentionCompliance.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<StorageStatsCard />);

    expect(screen.getByText('Storage & Compliance')).toBeInTheDocument();
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render error state', () => {
    mockUseStorageStats.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });
    mockUseRetentionCompliance.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    render(<StorageStatsCard />);

    expect(screen.getByText('Failed to load storage stats')).toBeInTheDocument();
  });

  it('should render compliant retention status', () => {
    mockUseStorageStats.mockReturnValue({
      data: {
        storage: {
          totalSizeBytes: 1073741824, // 1GB
          indexSizeBytes: 104857600,
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
      },
      isLoading: false,
      error: null,
    });
    mockUseRetentionCompliance.mockReturnValue({
      data: {
        isCompliant: true,
        complianceMessage: 'HIPAA compliant',
        retentionDays: 2555, // 7 years
        actualRetentionDays: 365,
        totalRecords: 1000000,
        earliestRecord: '2023-01-01T00:00:00Z',
        latestRecord: '2024-01-15T12:00:00Z',
      },
      isLoading: false,
      error: null,
    });

    render(<StorageStatsCard />);

    expect(screen.getByText('HIPAA Retention')).toBeInTheDocument();
    expect(screen.getByText('Compliant')).toBeInTheDocument();
    expect(screen.getByText('7 years (2555 days)')).toBeInTheDocument();
    expect(screen.getByText('1 GB')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument(); // chunks
    expect(screen.getByText('10.0:1')).toBeInTheDocument(); // compression ratio
    expect(screen.getByText('Hypertable Active')).toBeInTheDocument();
  });

  it('should render non-compliant retention status', () => {
    mockUseStorageStats.mockReturnValue({
      data: {
        storage: {
          totalSizeBytes: 1073741824,
          indexSizeBytes: 104857600,
          tableSizeBytes: 968884224,
        },
        compression: {
          uncompressedBytes: 0,
          compressedBytes: 0,
          compressionRatio: 0,
          compressedChunks: 0,
          uncompressedChunks: 0,
          lastCompressionRun: null,
        },
        hypertable: {
          isHypertable: false,
          hypertableName: 'AuditLogs',
          schemaName: 'public',
          numChunks: 0,
          totalRows: 100,
          chunkTimeInterval: '',
          compressionEnabled: false,
          retentionPolicyEnabled: false,
        },
      },
      isLoading: false,
      error: null,
    });
    mockUseRetentionCompliance.mockReturnValue({
      data: {
        isCompliant: false,
        complianceMessage: 'Non-compliant',
        retentionDays: 2555,
        actualRetentionDays: 2800,
        totalRecords: 100,
        earliestRecord: null,
        latestRecord: null,
      },
      isLoading: false,
      error: null,
    });

    render(<StorageStatsCard />);

    expect(screen.getByText('Non-Compliant')).toBeInTheDocument();
    expect(screen.getByText('Standard Table')).toBeInTheDocument();
  });

  it('should show N/A for zero compression ratio', () => {
    mockUseStorageStats.mockReturnValue({
      data: {
        storage: {
          totalSizeBytes: 1024,
          indexSizeBytes: 0,
          tableSizeBytes: 1024,
        },
        compression: {
          uncompressedBytes: 0,
          compressedBytes: 0,
          compressionRatio: 0,
          compressedChunks: 0,
          uncompressedChunks: 0,
          lastCompressionRun: null,
        },
        hypertable: {
          isHypertable: true,
          hypertableName: 'AuditLogs',
          schemaName: 'public',
          numChunks: 1,
          totalRows: 10,
          chunkTimeInterval: 'P1M',
          compressionEnabled: false,
          retentionPolicyEnabled: true,
        },
      },
      isLoading: false,
      error: null,
    });
    mockUseRetentionCompliance.mockReturnValue({
      data: {
        isCompliant: true,
        complianceMessage: 'HIPAA compliant',
        retentionDays: 2555,
        actualRetentionDays: 30,
        totalRecords: 10,
        earliestRecord: '2024-01-01T00:00:00Z',
        latestRecord: '2024-01-15T12:00:00Z',
      },
      isLoading: false,
      error: null,
    });

    render(<StorageStatsCard />);

    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
