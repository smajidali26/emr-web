/**
 * Patient Edit Page
 * Edit patient demographics and information
 */

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PatientDemographicsForm } from '@/components/patients';
import {
  Button,
  Spinner,
  Alert,
  AlertDescription,
  Card,
  CardContent,
} from '@/components/ui';
import { usePatient, useUpdatePatient } from '@/lib/api';
import { useAuth } from '@/hooks';
import { checkPatientDataPermission } from '@/lib/utils';
import { PatientDemographics } from '@/types';
import { ArrowLeft, Edit, Shield } from 'lucide-react';

export default function PatientEditPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const patientId = params?.id as string;

  const { data: patient, isLoading, isError, error } = usePatient(patientId);
  const updatePatientMutation = useUpdatePatient({
    onSuccess: () => {
      router.push(`/patients/${patientId}`);
    },
  });

  const permission = checkPatientDataPermission(user?.roles || [], 'edit');

  const handleSubmit = async (demographics: PatientDemographics) => {
    await updatePatientMutation.mutateAsync({
      id: patientId,
      data: { demographics },
    });
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Loading patient information...</p>
        </div>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message || 'Failed to load patient information'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!permission.canEdit) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {permission.reason || 'You do not have permission to edit patient information'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary p-2">
              <Edit className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Edit Patient</h1>
              <p className="text-muted-foreground">
                Update demographics for {patient.demographics.firstName}{' '}
                {patient.demographics.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {updatePatientMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {updatePatientMutation.error?.message || 'Failed to update patient information'}
          </AlertDescription>
        </Alert>
      )}

      {/* Security Notice */}
      <Card>
        <CardContent className="flex items-start gap-3 pt-6">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">HIPAA Compliance Notice</p>
            <p className="text-sm text-muted-foreground">
              All changes to patient information are logged and audited. Ensure you have proper
              authorization before making any modifications to patient data.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <PatientDemographicsForm
        initialData={patient.demographics}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={updatePatientMutation.isPending}
      />
    </div>
  );
}
