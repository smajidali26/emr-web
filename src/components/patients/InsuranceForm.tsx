/**
 * Insurance Form Component
 * Form for managing patient insurance information
 */

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Button,
  Checkbox,
} from '@/components/ui';
import { Insurance } from '@/types';
import { Plus, Trash2 } from 'lucide-react';

interface InsuranceFormProps {
  initialData?: Insurance[];
  onSubmit: (insurances: Insurance[]) => void;
  onBack?: () => void;
}

export const InsuranceForm: React.FC<InsuranceFormProps> = ({
  initialData = [],
  onSubmit,
  onBack,
}) => {
  const [insurances, setInsurances] = React.useState<Insurance[]>(initialData);
  const [errors, setErrors] = React.useState<Record<number, Record<string, string>>>({});

  function createEmptyInsurance(): Insurance {
    return {
      provider: '',
      policyNumber: '',
      subscriberName: '',
      subscriberRelationship: 'Self',
      effectiveDate: new Date(),
      isPrimary: insurances.length === 0, // First insurance is primary by default
    };
  }

  const addInsurance = () => {
    setInsurances([...insurances, createEmptyInsurance()]);
  };

  const removeInsurance = (index: number) => {
    setInsurances(insurances.filter((_, i) => i !== index));
    const newErrors = { ...errors };
    delete newErrors[index];
    setErrors(newErrors);
  };

  const updateInsurance = (index: number, field: keyof Insurance, value: unknown) => {
    const updated = [...insurances];
    updated[index] = { ...updated[index], [field]: value };

    // If setting as primary, unset others
    if (field === 'isPrimary' && value === true) {
      updated.forEach((ins, i) => {
        if (i !== index) {
          ins.isPrimary = false;
        }
      });
    }

    setInsurances(updated);

    // Clear error for this field
    if (errors[index]?.[field as string]) {
      const newErrors = { ...errors };
      delete newErrors[index][field as string];
      setErrors(newErrors);
    }
  };

  const validateInsurances = (): boolean => {
    if (insurances.length === 0) {
      return true; // Insurance is optional
    }

    const newErrors: Record<number, Record<string, string>> = {};
    let isValid = true;

    insurances.forEach((insurance, index) => {
      const insuranceErrors: Record<string, string> = {};

      if (!insurance.provider.trim()) {
        insuranceErrors.provider = 'Provider is required';
        isValid = false;
      }

      if (!insurance.policyNumber.trim()) {
        insuranceErrors.policyNumber = 'Policy number is required';
        isValid = false;
      }

      if (!insurance.subscriberName.trim()) {
        insuranceErrors.subscriberName = 'Subscriber name is required';
        isValid = false;
      }

      if (!insurance.subscriberRelationship.trim()) {
        insuranceErrors.subscriberRelationship = 'Subscriber relationship is required';
        isValid = false;
      }

      if (Object.keys(insuranceErrors).length > 0) {
        newErrors[index] = insuranceErrors;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateInsurances()) {
      onSubmit(insurances);
    }
  };

  const handleSkip = () => {
    onSubmit([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Information</CardTitle>
        <CardDescription>
          Add insurance information (optional). You can add multiple insurance policies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {insurances.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              No insurance information added yet
            </p>
            <Button type="button" onClick={addInsurance}>
              <Plus className="mr-2 h-4 w-4" />
              Add Insurance
            </Button>
          </div>
        ) : (
          <>
            {insurances.map((insurance, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        Insurance {index + 1}
                      </CardTitle>
                      {insurance.isPrimary && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          Primary
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInsurance(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`insurance-${index}-provider`} className="required">
                        Insurance Provider
                      </Label>
                      <Input
                        id={`insurance-${index}-provider`}
                        value={insurance.provider}
                        onChange={(e) => updateInsurance(index, 'provider', e.target.value)}
                        placeholder="Blue Cross Blue Shield"
                        aria-invalid={!!errors[index]?.provider}
                      />
                      {errors[index]?.provider && (
                        <p className="text-xs text-destructive">{errors[index].provider}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`insurance-${index}-policy`} className="required">
                        Policy Number
                      </Label>
                      <Input
                        id={`insurance-${index}-policy`}
                        value={insurance.policyNumber}
                        onChange={(e) => updateInsurance(index, 'policyNumber', e.target.value)}
                        placeholder="ABC123456789"
                        aria-invalid={!!errors[index]?.policyNumber}
                      />
                      {errors[index]?.policyNumber && (
                        <p className="text-xs text-destructive">{errors[index].policyNumber}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`insurance-${index}-group`}>Group Number</Label>
                      <Input
                        id={`insurance-${index}-group`}
                        value={insurance.groupNumber || ''}
                        onChange={(e) => updateInsurance(index, 'groupNumber', e.target.value)}
                        placeholder="GRP12345"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`insurance-${index}-subscriber`} className="required">
                        Subscriber Name
                      </Label>
                      <Input
                        id={`insurance-${index}-subscriber`}
                        value={insurance.subscriberName}
                        onChange={(e) => updateInsurance(index, 'subscriberName', e.target.value)}
                        placeholder="John Doe"
                        aria-invalid={!!errors[index]?.subscriberName}
                      />
                      {errors[index]?.subscriberName && (
                        <p className="text-xs text-destructive">{errors[index].subscriberName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`insurance-${index}-relationship`} className="required">
                        Relationship to Patient
                      </Label>
                      <Input
                        id={`insurance-${index}-relationship`}
                        value={insurance.subscriberRelationship}
                        onChange={(e) =>
                          updateInsurance(index, 'subscriberRelationship', e.target.value)
                        }
                        placeholder="Self, Spouse, Parent, etc."
                        aria-invalid={!!errors[index]?.subscriberRelationship}
                      />
                      {errors[index]?.subscriberRelationship && (
                        <p className="text-xs text-destructive">
                          {errors[index].subscriberRelationship}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`insurance-${index}-effective`}>Effective Date</Label>
                      <Input
                        id={`insurance-${index}-effective`}
                        type="date"
                        value={
                          insurance.effectiveDate instanceof Date
                            ? insurance.effectiveDate.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          updateInsurance(index, 'effectiveDate', new Date(e.target.value))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`insurance-${index}-expiration`}>Expiration Date</Label>
                      <Input
                        id={`insurance-${index}-expiration`}
                        type="date"
                        value={
                          insurance.expirationDate instanceof Date
                            ? insurance.expirationDate.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          updateInsurance(
                            index,
                            'expirationDate',
                            e.target.value ? new Date(e.target.value) : undefined
                          )
                        }
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`insurance-${index}-primary`}
                        checked={insurance.isPrimary}
                        onCheckedChange={(checked) =>
                          updateInsurance(index, 'isPrimary', checked)
                        }
                      />
                      <Label htmlFor={`insurance-${index}-primary`} className="font-normal">
                        Set as primary insurance
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button type="button" variant="outline" onClick={addInsurance} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Insurance
            </Button>
          </>
        )}

        <div className="flex justify-between pt-4">
          {onBack && (
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
          )}
          <div className="flex gap-2">
            {insurances.length === 0 && (
              <Button type="button" variant="outline" onClick={handleSkip}>
                Skip
              </Button>
            )}
            <Button onClick={handleSubmit}>Continue</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
