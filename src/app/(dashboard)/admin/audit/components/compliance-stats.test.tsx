/**
 * ComplianceStats Component Tests
 */

import { render, screen } from '@/test-utils';
import { ComplianceStats } from './compliance-stats';
import { useComplianceMetrics } from '@/lib/api/audit-api';

// Mock the audit API hooks
jest.mock('@/lib/api/audit-api', () => ({
  useComplianceMetrics: jest.fn(),
}));

const mockUseComplianceMetrics = useComplianceMetrics as jest.Mock;

describe('ComplianceStats', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseComplianceMetrics.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<ComplianceStats fromDate="2024-01-01" toDate="2024-01-31" />);

    // Should show skeleton loaders (animated pulse elements)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render error state', () => {
    mockUseComplianceMetrics.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<ComplianceStats fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Failed to load compliance metrics')).toBeInTheDocument();
  });

  it('should render compliance metrics successfully', () => {
    mockUseComplianceMetrics.mockReturnValue({
      data: {
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
      },
      isLoading: false,
      error: null,
    });

    render(<ComplianceStats fromDate="2024-01-01" toDate="2024-01-31" />);

    // Check main stats
    expect(screen.getByText('Total Events')).toBeInTheDocument();
    expect(screen.getByText('1,000')).toBeInTheDocument();

    expect(screen.getByText('Success Rate')).toBeInTheDocument();
    expect(screen.getByText('99.0%')).toBeInTheDocument(); // (1000 - 10) / 1000 * 100

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();

    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should render detailed stats', () => {
    mockUseComplianceMetrics.mockReturnValue({
      data: {
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
      },
      isLoading: false,
      error: null,
    });

    render(<ComplianceStats fromDate="2024-01-01" toDate="2024-01-31" />);

    // Check detailed stats
    expect(screen.getByText('PHI Access')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();

    expect(screen.getByText('Auth Events')).toBeInTheDocument();
    expect(screen.getByText('200')).toBeInTheDocument();

    expect(screen.getByText('Unique IPs')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();

    expect(screen.getByText('Export/Print')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should handle zero events gracefully', () => {
    mockUseComplianceMetrics.mockReturnValue({
      data: {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        totalAuditEvents: 0,
        phiAccessCount: 0,
        accessDeniedCount: 0,
        authEventCount: 0,
        failedLoginCount: 0,
        exportPrintCount: 0,
        activeUsers: 0,
        uniqueIpAddresses: 0,
        uniqueSessions: 0,
      },
      isLoading: false,
      error: null,
    });

    render(<ComplianceStats fromDate="2024-01-01" toDate="2024-01-31" />);

    // Success rate should be 100% when no events
    expect(screen.getByText('100%')).toBeInTheDocument();
    // Multiple fields show 0, so use getAllByText
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
  });
});
