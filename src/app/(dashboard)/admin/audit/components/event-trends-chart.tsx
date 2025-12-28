'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { useDailySummaries } from '@/lib/api/audit-api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface EventTrendsChartProps {
  fromDate?: string;
  toDate?: string;
}

export function EventTrendsChart({ fromDate, toDate }: EventTrendsChartProps) {
  const { data: summaries, isLoading, error } = useDailySummaries(fromDate, toDate);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Trends</CardTitle>
          <CardDescription>Daily audit event activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !summaries) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Trends</CardTitle>
          <CardDescription>Daily audit event activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-destructive">
            Failed to load trend data
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle empty data state
  if (summaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Trends</CardTitle>
          <CardDescription>Daily audit event activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No audit events found for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = summaries.map((summary) => ({
    date: new Date(summary.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: summary.totalEvents,
    successful: summary.successfulEvents,
    failed: summary.failedEvents,
    users: summary.uniqueUsers,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Trends</CardTitle>
        <CardDescription>Daily audit event activity over the selected period</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorSuccessful" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                labelStyle={{ fontWeight: 'bold' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Events"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Area
                type="monotone"
                dataKey="successful"
                name="Successful"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorSuccessful)"
              />
              <Area
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorFailed)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
