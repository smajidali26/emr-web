'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button, Input } from '@/components/ui';
import { useAuditLogs, AuditLogQuery } from '@/lib/api/audit-api';
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';

interface AuditEventsTableProps {
  fromDate?: string;
  toDate?: string;
}

export function AuditEventsTable({ fromDate, toDate }: AuditEventsTableProps) {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');

  const query: AuditLogQuery = {
    fromDate,
    toDate,
    pageNumber: page,
    pageSize: 10,
    searchTerm: searchTerm || undefined,
    eventType: eventTypeFilter || undefined,
  };

  const { data, isLoading, error } = useAuditLogs(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Audit Events</CardTitle>
          <CardDescription>View and search audit log entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Failed to load audit events</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Recent Audit Events</CardTitle>
            <CardDescription>View and search audit log entries</CardDescription>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <select
              value={eventTypeFilter}
              onChange={(e) => {
                setEventTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">All Events</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
              <option value="View">View</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="Export">Export</option>
              <option value="AccessDenied">Access Denied</option>
            </select>
          </form>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-12 px-4 text-left font-medium">Timestamp</th>
                <th className="h-12 px-4 text-left font-medium">User</th>
                <th className="h-12 px-4 text-left font-medium">Event</th>
                <th className="h-12 px-4 text-left font-medium">Resource</th>
                <th className="h-12 px-4 text-left font-medium">Action</th>
                <th className="h-12 px-4 text-left font-medium">Status</th>
                <th className="h-12 px-4 text-left font-medium">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="h-12 px-4">
                        <div className="h-4 w-20 animate-pulse bg-muted rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.items?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-24 text-center text-muted-foreground">
                    No audit events found
                  </td>
                </tr>
              ) : (
                data?.items?.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="h-12 px-4 font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="h-12 px-4">
                      <div className="truncate max-w-[150px]" title={log.username || log.userId}>
                        {log.username || log.userId}
                      </div>
                    </td>
                    <td className="h-12 px-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                        {log.eventTypeName}
                      </span>
                    </td>
                    <td className="h-12 px-4">
                      <div className="truncate max-w-[150px]" title={`${log.resourceType}${log.resourceId ? '/' + log.resourceId : ''}`}>
                        {log.resourceType}
                        {log.resourceId && log.resourceId.length > 0 && (
                          <span className="text-muted-foreground">
                            /{log.resourceId.length > 8 ? `${log.resourceId.substring(0, 8)}...` : log.resourceId}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="h-12 px-4">
                      <div className="truncate max-w-[200px]" title={log.action}>
                        {log.action}
                      </div>
                    </td>
                    <td className="h-12 px-4">
                      {log.success ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Success</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">Failed</span>
                        </span>
                      )}
                    </td>
                    <td className="h-12 px-4 font-mono text-xs text-muted-foreground">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {((page - 1) * 10) + 1} to {Math.min(page * 10, data.totalCount)} of {data.totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.hasPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {data.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasNextPage}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
