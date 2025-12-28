/**
 * ExportButton Component Tests
 */

import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { ExportButton } from './export-button';
import { useExportAuditLogs } from '@/lib/api/audit-api';

// Mock the audit API hooks
jest.mock('@/lib/api/audit-api', () => ({
  useExportAuditLogs: jest.fn(),
}));

const mockUseExportAuditLogs = useExportAuditLogs as jest.Mock;

describe('ExportButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render export button', () => {
    mockUseExportAuditLogs.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Export')).toBeInTheDocument();
  });

  it('should show dropdown when clicked', () => {
    mockUseExportAuditLogs.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    expect(screen.getByText('Export as CSV')).toBeInTheDocument();
    expect(screen.getByText('Export as JSON')).toBeInTheDocument();
  });

  it('should call export mutation with CSV format', () => {
    const mockMutate = jest.fn();
    mockUseExportAuditLogs.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    expect(mockMutate).toHaveBeenCalledWith(
      { fromDate: '2024-01-01', toDate: '2024-01-31', format: 'csv' },
      expect.any(Object)
    );
  });

  it('should call export mutation with JSON format', () => {
    const mockMutate = jest.fn();
    mockUseExportAuditLogs.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const jsonOption = screen.getByText('Export as JSON');
    fireEvent.click(jsonOption);

    expect(mockMutate).toHaveBeenCalledWith(
      { fromDate: '2024-01-01', toDate: '2024-01-31', format: 'json' },
      expect.any(Object)
    );
  });

  it('should show loading state when exporting', () => {
    mockUseExportAuditLogs.mockReturnValue({
      mutate: jest.fn(),
      isPending: true,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should close dropdown when clicking backdrop', () => {
    mockUseExportAuditLogs.mockReturnValue({
      mutate: jest.fn(),
      isPending: false,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    // Open dropdown
    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    expect(screen.getByText('Export as CSV')).toBeInTheDocument();

    // Click backdrop (toggle button again)
    fireEvent.click(exportButton);

    expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();
  });

  it('should show error when date range exceeds 365 days', () => {
    const mockMutate = jest.fn();
    mockUseExportAuditLogs.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    // Use dates more than 365 days apart
    render(<ExportButton fromDate="2022-01-01" toDate="2024-01-31" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    expect(screen.getByText(/Date range cannot exceed 365 days/)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show error when start date is after end date', () => {
    const mockMutate = jest.fn();
    mockUseExportAuditLogs.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<ExportButton fromDate="2024-02-01" toDate="2024-01-01" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    expect(screen.getByText('Start date must be before end date')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show error when date format is invalid', () => {
    const mockMutate = jest.fn();
    mockUseExportAuditLogs.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<ExportButton fromDate="invalid-date" toDate="2024-01-31" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    expect(screen.getByText('Invalid date format')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should close dropdown and clear error on successful export', async () => {
    const mockMutate = jest.fn((params, options) => {
      // Simulate successful mutation
      options.onSuccess();
    });
    mockUseExportAuditLogs.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();
    });
  });

  it('should show error message on failed export', async () => {
    const mockMutate = jest.fn((params, options) => {
      // Simulate failed mutation
      options.onError(new Error('Export failed'));
    });
    mockUseExportAuditLogs.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });

    render(<ExportButton fromDate="2024-01-01" toDate="2024-01-31" />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    const csvOption = screen.getByText('Export as CSV');
    fireEvent.click(csvOption);

    await waitFor(() => {
      expect(screen.getByText('Export failed. Please try again.')).toBeInTheDocument();
    });
  });
});
