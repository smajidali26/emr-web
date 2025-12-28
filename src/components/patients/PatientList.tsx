/**
 * Patient List Component
 * Paginated list of patients with filtering and sorting
 */

'use client';

import * as React from 'react';
import { PatientCard } from './PatientCard';
import { Button, Spinner, Alert, AlertDescription } from '@/components/ui';
import { usePatients } from '@/lib/api';
import { PatientSearchFilters } from '@/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PatientListProps {
  filters?: PatientSearchFilters;
  onPatientClick?: (patientId: string) => void;
  pageSize?: number;
  className?: string;
}

export const PatientList: React.FC<PatientListProps> = ({
  filters = {},
  onPatientClick,
  pageSize = 20,
  className,
}) => {
  const [page, setPage] = React.useState(1);

  const { data, isLoading, isError, error } = usePatients({
    page,
    pageSize,
    filter: filters,
  });

  const handlePatientClick = (patientId: string) => {
    if (onPatientClick) {
      onPatientClick(patientId);
    }
  };

  const handlePreviousPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    if (data?.pagination.hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error?.message || 'Failed to load patients. Please try again.'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          No patients found. Try adjusting your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Patient Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.data.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onClick={() => handlePatientClick(patient.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      {data.pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * pageSize + 1} to{' '}
            {Math.min(page * pageSize, data.pagination.totalItems)} of{' '}
            {data.pagination.totalItems} patients
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!data.pagination.hasPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              <span className="text-sm">
                Page {page} of {data.pagination.totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!data.pagination.hasNext}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
