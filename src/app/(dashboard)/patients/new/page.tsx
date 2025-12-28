/**
 * New Patient Registration Page
 * Page for registering new patients
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { PatientRegistrationForm } from '@/components/patients';
import { Button } from '@/components/ui';
import { ArrowLeft, UserPlus } from 'lucide-react';

export default function NewPatientPage() {
  const router = useRouter();

  const handleSuccess = (patientId: string) => {
    router.push(`/patients/${patientId}`);
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="rounded-lg bg-primary p-2">
              <UserPlus className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">New Patient Registration</h1>
              <p className="text-muted-foreground">
                Register a new patient in the system
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <PatientRegistrationForm onSuccess={handleSuccess} />
    </div>
  );
}
