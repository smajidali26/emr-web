/**
 * Patients List Page
 * Main page for viewing and searching patients
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PatientSearchBar, PatientList } from '@/components/patients';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { usePatientStore } from '@/stores';
import { PatientSearchFilters } from '@/types';
import { Plus, Users } from 'lucide-react';

export default function PatientsPage() {
  const router = useRouter();
  const { searchFilters } = usePatientStore();
  const [localFilters] = React.useState<PatientSearchFilters>(searchFilters);

  const handleNewPatient = () => {
    router.push('/patients/new');
  };

  const handlePatientClick = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Users className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
              <p className="text-muted-foreground">
                Search, view, and manage patient records
              </p>
            </div>
          </div>
        </div>
        <Button onClick={handleNewPatient} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          New Patient
        </Button>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
          <CardDescription>
            Find patients by name, medical record number, or phone number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientSearchBar
            onSelect={(patient) => router.push(`/patients/${patient.id}`)}
            autoFocus
          />
        </CardContent>
      </Card>

      {/* Patient List */}
      <PatientList
        filters={localFilters}
        onPatientClick={handlePatientClick}
      />
    </div>
  );
}
