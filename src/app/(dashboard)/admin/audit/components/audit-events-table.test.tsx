/**
 * AuditEventsTable Component Tests
 */

import { render, screen, fireEvent } from '@/test-utils';
import { AuditEventsTable } from './audit-events-table';
import { useAuditLogs } from '@/lib/api/audit-api';

// Mock the audit API hooks
jest.mock('@/lib/api/audit-api', () => ({
  useAuditLogs: jest.fn(),
}));

const mockUseAuditLogs = useAuditLogs as jest.Mock;

describe('AuditEventsTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseAuditLogs.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Recent Audit Events')).toBeInTheDocument();
    // Check for skeleton loaders
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should render error state', () => {
    mockUseAuditLogs.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Failed to load audit events')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    mockUseAuditLogs.mockReturnValue({
      data: {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('No audit events found')).toBeInTheDocument();
  });

  it('should render table with data', () => {
    mockUseAuditLogs.mockReturnValue({
      data: {
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
            action: 'Viewed patient record',
            success: true,
          },
          {
            id: '2',
            eventType: 9,
            eventTypeName: 'AccessDenied',
            userId: 'user-2',
            username: 'jane.smith',
            timestamp: '2024-01-15T11:00:00Z',
            resourceType: 'Admin',
            resourceId: null,
            ipAddress: '192.168.1.2',
            action: 'Attempted to access admin page',
            success: false,
          },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    // Check table headers
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Event')).toBeInTheDocument();
    expect(screen.getByText('Resource')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('IP Address')).toBeInTheDocument();

    // Check data rows
    expect(screen.getByText('john.doe')).toBeInTheDocument();
    // Use getAllByText since 'View' appears as both event type and in description
    expect(screen.getAllByText('View').length).toBeGreaterThan(0);
    expect(screen.getByText('Viewed patient record')).toBeInTheDocument();
    expect(screen.getByText('192.168.1.1')).toBeInTheDocument();

    expect(screen.getByText('jane.smith')).toBeInTheDocument();
    expect(screen.getAllByText('AccessDenied').length).toBeGreaterThan(0);
  });

  it('should show success and failed status icons', () => {
    mockUseAuditLogs.mockReturnValue({
      data: {
        items: [
          {
            id: '1',
            eventTypeName: 'View',
            userId: 'user-1',
            username: 'john.doe',
            timestamp: '2024-01-15T10:00:00Z',
            resourceType: 'Patient',
            action: 'Viewed patient',
            success: true,
          },
          {
            id: '2',
            eventTypeName: 'AccessDenied',
            userId: 'user-2',
            username: 'jane.smith',
            timestamp: '2024-01-15T11:00:00Z',
            resourceType: 'Admin',
            action: 'Access denied',
            success: false,
          },
        ],
        totalCount: 2,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Success')).toBeInTheDocument();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('should render pagination when multiple pages exist', () => {
    mockUseAuditLogs.mockReturnValue({
      data: {
        items: [
          {
            id: '1',
            eventTypeName: 'View',
            userId: 'user-1',
            username: 'john.doe',
            timestamp: '2024-01-15T10:00:00Z',
            resourceType: 'Patient',
            action: 'Viewed patient',
            success: true,
          },
        ],
        totalCount: 50,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
    expect(screen.getByText('Showing 1 to 10 of 50 entries')).toBeInTheDocument();
  });

  it('should have search input and event type filter', () => {
    mockUseAuditLogs.mockReturnValue({
      data: {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByPlaceholderText('Search events...')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should update search term on input change', () => {
    mockUseAuditLogs.mockReturnValue({
      data: {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    const searchInput = screen.getByPlaceholderText('Search events...');
    fireEvent.change(searchInput, { target: { value: 'patient' } });

    expect(searchInput).toHaveValue('patient');
  });

  it('should update filter on select change', () => {
    mockUseAuditLogs.mockReturnValue({
      data: {
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
      isLoading: false,
      error: null,
    });

    render(<AuditEventsTable fromDate="2024-01-01" toDate="2024-01-31" />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Login' } });

    expect(select).toHaveValue('Login');
  });
});
