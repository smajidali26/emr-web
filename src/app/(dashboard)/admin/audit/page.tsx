'use client';

import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks';
import { UserRole } from '@/types';
import { Shield, Calendar, RefreshCw } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { ComplianceStats } from './components/compliance-stats';
import { EventTrendsChart } from './components/event-trends-chart';
import { StorageStatsCard } from './components/storage-stats-card';
import { AuditEventsTable } from './components/audit-events-table';
import { ExportButton } from './components/export-button';
import { useRefreshAggregates } from '@/lib/api/audit-api';

function formatDateForInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function AuditDashboardPage() {
  const { user } = useAuth();

  // Default to last 30 days
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);

  const [fromDate, setFromDate] = useState(formatDateForInput(defaultStartDate));
  const [toDate, setToDate] = useState(formatDateForInput(defaultEndDate));

  const refreshAggregates = useRefreshAggregates();

  // Check for ADMIN role
  const isAdmin = useMemo(() => {
    return user?.roles?.includes(UserRole.ADMIN);
  }, [user?.roles]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <Shield className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground max-w-md">
          You do not have permission to view the HIPAA Audit Compliance Dashboard.
          This page is restricted to system administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            HIPAA Audit Compliance
          </h1>
          <p className="text-muted-foreground">
            Monitor audit events, compliance metrics, and storage statistics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Date Range Filters */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-36"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-36"
            />
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refreshAggregates.mutate()}
            disabled={refreshAggregates.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshAggregates.isPending ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Export Button */}
          <ExportButton fromDate={fromDate} toDate={toDate} />
        </div>
      </div>

      {/* Compliance Stats */}
      <ComplianceStats fromDate={fromDate} toDate={toDate} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <EventTrendsChart fromDate={fromDate} toDate={toDate} />
        </div>
        <div>
          <StorageStatsCard />
        </div>
      </div>

      {/* Audit Events Table */}
      <AuditEventsTable fromDate={fromDate} toDate={toDate} />
    </div>
  );
}
