/**
 * Patient Registration Form Component
 * Multi-step form for registering new patients
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Alert,
  AlertDescription,
  Spinner,
} from '@/components/ui';
import { PatientDemographicsForm } from './PatientDemographicsForm';
import { EmergencyContactForm } from './EmergencyContactForm';
import { InsuranceForm } from './InsuranceForm';
import { useRegisterPatient } from '@/lib/api';
import {
  PatientDemographics,
  EmergencyContact,
  Insurance,
  PatientRegistrationRequest,
} from '@/types';
import { secureLogger } from '@/lib/utils/secure-logger';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

type RegistrationStep = 'demographics' | 'emergency' | 'insurance' | 'review';

interface RegistrationData {
  demographics?: PatientDemographics;
  emergencyContacts: EmergencyContact[];
  insurances: Insurance[];
}

interface PatientRegistrationFormProps {
  className?: string;
  onSuccess?: (patientId: string) => void;
}

export const PatientRegistrationForm: React.FC<PatientRegistrationFormProps> = ({
  className,
  onSuccess,
}) => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<RegistrationStep>('demographics');
  const [registrationData, setRegistrationData] = React.useState<RegistrationData>({
    emergencyContacts: [],
    insurances: [],
  });

  // NOTE: SSN is stored in transient React state only (not persisted to storage).
  // SSN is encrypted at transmission (HTTPS) and at rest (database-level AES-256-GCM).
  // React state cleanup on unmount is ineffective as setState is ignored after unmount.

  const registerPatientMutation = useRegisterPatient({
    onSuccess: (data) => {
      secureLogger.info('Patient registered successfully');
      if (onSuccess) {
        onSuccess(data.id);
      } else {
        router.push(`/patients/${data.id}`);
      }
    },
    onError: (error) => {
      secureLogger.error('Patient registration failed:', error);
    },
  });

  const steps: Array<{ id: RegistrationStep; label: string; description: string }> = [
    {
      id: 'demographics',
      label: 'Demographics',
      description: 'Basic patient information',
    },
    {
      id: 'emergency',
      label: 'Emergency Contacts',
      description: 'Emergency contact information',
    },
    {
      id: 'insurance',
      label: 'Insurance',
      description: 'Insurance information',
    },
    {
      id: 'review',
      label: 'Review',
      description: 'Review and submit',
    },
  ];

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const handleDemographicsSubmit = (demographics: PatientDemographics) => {
    setRegistrationData((prev) => ({ ...prev, demographics }));
    setCurrentStep('emergency');
  };

  const handleEmergencyContactsSubmit = (emergencyContacts: EmergencyContact[]) => {
    setRegistrationData((prev) => ({ ...prev, emergencyContacts }));
    setCurrentStep('insurance');
  };

  const handleInsuranceSubmit = (insurances: Insurance[]) => {
    setRegistrationData((prev) => ({ ...prev, insurances }));
    setCurrentStep('review');
  };

  const handleFinalSubmit = async () => {
    if (!registrationData.demographics) {
      secureLogger.error('Cannot submit registration without demographics');
      return;
    }

    const request: PatientRegistrationRequest = {
      demographics: {
        ...registrationData.demographics,
        emergencyContacts: registrationData.emergencyContacts,
        insurances: registrationData.insurances,
      },
    };

    await registerPatientMutation.mutateAsync(request);
  };

  const goToPreviousStep = () => {
    const stepOrder: RegistrationStep[] = ['demographics', 'emergency', 'insurance', 'review'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  return (
    <div className={cn('w-full space-y-6', className)}>
      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                      index < currentStepIndex
                        ? 'border-primary bg-primary text-primary-foreground'
                        : index === currentStepIndex
                        ? 'border-primary bg-background text-primary'
                        : 'border-muted bg-background text-muted-foreground'
                    )}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        'text-sm font-medium',
                        index === currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="hidden text-xs text-muted-foreground sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 transition-colors',
                      index < currentStepIndex ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {registerPatientMutation.isError && (
        <Alert variant="destructive">
          <AlertDescription>
            {registerPatientMutation.error?.message || 'Failed to register patient'}
          </AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {currentStep === 'demographics' && (
        <PatientDemographicsForm
          initialData={registrationData.demographics}
          onSubmit={handleDemographicsSubmit}
          onCancel={() => router.back()}
        />
      )}

      {currentStep === 'emergency' && (
        <EmergencyContactForm
          initialData={registrationData.emergencyContacts}
          onSubmit={handleEmergencyContactsSubmit}
          onBack={goToPreviousStep}
        />
      )}

      {currentStep === 'insurance' && (
        <InsuranceForm
          initialData={registrationData.insurances}
          onSubmit={handleInsuranceSubmit}
          onBack={goToPreviousStep}
        />
      )}

      {currentStep === 'review' && (
        <Card>
          <CardHeader>
            <CardTitle>Review Registration</CardTitle>
            <CardDescription>
              Please review the information before submitting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Demographics Summary */}
            {registrationData.demographics && (
              <div className="space-y-2">
                <h3 className="font-semibold">Patient Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>{' '}
                    {registrationData.demographics.firstName}{' '}
                    {registrationData.demographics.lastName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">DOB:</span>{' '}
                    {new Date(registrationData.demographics.dateOfBirth).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Gender:</span>{' '}
                    {registrationData.demographics.gender}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{' '}
                    {registrationData.demographics.contactInfo.primaryPhone}
                  </div>
                </div>
              </div>
            )}

            {/* Emergency Contacts Summary */}
            <div className="space-y-2">
              <h3 className="font-semibold">Emergency Contacts</h3>
              {registrationData.emergencyContacts.length > 0 ? (
                <div className="space-y-2">
                  {registrationData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{contact.name}</span> ({contact.relationship}) -{' '}
                      {contact.phoneNumber}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No emergency contacts added</p>
              )}
            </div>

            {/* Insurance Summary */}
            <div className="space-y-2">
              <h3 className="font-semibold">Insurance Information</h3>
              {registrationData.insurances.length > 0 ? (
                <div className="space-y-2">
                  {registrationData.insurances.map((insurance, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium">{insurance.provider}</span> - Policy:{' '}
                      {insurance.policyNumber}
                      {insurance.isPrimary && ' (Primary)'}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No insurance information added</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={goToPreviousStep}
                disabled={registerPatientMutation.isPending}
              >
                Back
              </Button>
              <Button
                onClick={handleFinalSubmit}
                disabled={registerPatientMutation.isPending}
              >
                {registerPatientMutation.isPending ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Registering...
                  </>
                ) : (
                  'Register Patient'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
