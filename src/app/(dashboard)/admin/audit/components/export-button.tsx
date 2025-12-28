'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useExportAuditLogs } from '@/lib/api/audit-api';
import { Download, FileJson, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';

interface ExportButtonProps {
  fromDate: string;
  toDate: string;
}

// Validate date range before export
function validateDateRange(fromDate: string, toDate: string): { valid: boolean; error?: string } {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  const now = new Date();

  if (isNaN(from.getTime()) || isNaN(to.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }

  if (from > to) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  if (to > now) {
    return { valid: false, error: 'End date cannot be in the future' };
  }

  // Limit to 1 year range for exports (HIPAA compliance - prevent excessive data extraction)
  const maxRangeDays = 365;
  const rangeDays = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24);
  if (rangeDays > maxRangeDays) {
    return { valid: false, error: `Date range cannot exceed ${maxRangeDays} days for exports` };
  }

  return { valid: true };
}

export function ExportButton({ fromDate, toDate }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const exportMutation = useExportAuditLogs();

  const handleExport = (format: 'csv' | 'json') => {
    setExportError(null);

    // Validate date range
    const validation = validateDateRange(fromDate, toDate);
    if (!validation.valid) {
      setExportError(validation.error || 'Invalid date range');
      return;
    }

    exportMutation.mutate(
      { fromDate, toDate, format },
      {
        onSuccess: () => {
          setIsOpen(false);
          setExportError(null);
        },
        onError: () => {
          setExportError('Export failed. Please try again.');
        },
      }
    );
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => {
          setIsOpen(!isOpen);
          setExportError(null);
        }}
        disabled={exportMutation.isPending}
      >
        {exportMutation.isPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Export
      </Button>

      {isOpen && !exportMutation.isPending && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => {
              setIsOpen(false);
              setExportError(null);
            }}
          />

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-2 z-20 w-64 rounded-md border bg-popover shadow-md">
            <div className="p-1">
              {exportError && (
                <div className="flex items-start gap-2 px-3 py-2 text-sm text-destructive bg-destructive/10 rounded-sm mb-1">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{exportError}</span>
                </div>
              )}
              <button
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleExport('csv')}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Export as CSV
              </button>
              <button
                className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => handleExport('json')}
              >
                <FileJson className="h-4 w-4" />
                Export as JSON
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
