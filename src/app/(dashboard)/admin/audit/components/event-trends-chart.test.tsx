/**
 * EventTrendsChart Component Tests
 */

import { render, screen } from '@/test-utils';
import { EventTrendsChart } from './event-trends-chart';
import { useDailySummaries } from '@/lib/api/audit-api';

// Mock the audit API hooks
jest.mock('@/lib/api/audit-api', () => ({
  useDailySummaries: jest.fn(),
}));

// Mock Recharts to avoid rendering issues in tests
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  AreaChart: () => <div data-testid="area-chart" />,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

const mockUseDailySummaries = useDailySummaries as jest.Mock;

describe('EventTrendsChart', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state', () => {
    mockUseDailySummaries.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<EventTrendsChart fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Event Trends')).toBeInTheDocument();
    expect(screen.getByText('Loading chart...')).toBeInTheDocument();
  });

  it('should render error state', () => {
    mockUseDailySummaries.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    });

    render(<EventTrendsChart fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Failed to load trend data')).toBeInTheDocument();
  });

  it('should render empty state when no data', () => {
    mockUseDailySummaries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<EventTrendsChart fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('No audit events found for the selected period')).toBeInTheDocument();
  });

  it('should render chart with data', () => {
    mockUseDailySummaries.mockReturnValue({
      data: [
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
      ],
      isLoading: false,
      error: null,
    });

    render(<EventTrendsChart fromDate="2024-01-01" toDate="2024-01-31" />);

    expect(screen.getByText('Event Trends')).toBeInTheDocument();
    expect(screen.getByText('Daily audit event activity over the selected period')).toBeInTheDocument();
    expect(screen.getByTestId('area-chart')).toBeInTheDocument();
  });

  it('should pass correct date parameters to hook', () => {
    mockUseDailySummaries.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<EventTrendsChart fromDate="2024-01-15" toDate="2024-02-15" />);

    expect(mockUseDailySummaries).toHaveBeenCalledWith('2024-01-15', '2024-02-15');
  });
});
