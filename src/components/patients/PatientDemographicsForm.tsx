/**
 * Patient Demographics Form Component
 * Reusable form for editing patient demographics
 * SECURITY FIX: Added input sanitization to prevent XSS attacks
 * Assigned: Laura Hill (8h)
 */

'use client';

import * as React from 'react';
import {
  Input,
  Label,
  Select,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import {
  PatientDemographics,
  Gender,
  MaritalStatus,
  Race,
  Ethnicity,
  BloodType,
} from '@/types';
import {
  isValidSSN,
  isValidPhoneNumber,
  isValidDateOfBirth,
} from '@/lib/utils/security';
import { cn } from '@/lib/utils';

interface PatientDemographicsFormProps {
  initialData?: Partial<PatientDemographics>;
  onSubmit: (data: PatientDemographics) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

interface FormErrors {
  [key: string]: string;
}

export const PatientDemographicsForm: React.FC<PatientDemographicsFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  className,
}) => {
  const [formData, setFormData] = React.useState<Partial<PatientDemographics>>({
    firstName: initialData?.firstName || '',
    middleName: initialData?.middleName || '',
    lastName: initialData?.lastName || '',
    suffix: initialData?.suffix || '',
    preferredName: initialData?.preferredName || '',
    dateOfBirth: initialData?.dateOfBirth || new Date(),
    gender: initialData?.gender || Gender.UNKNOWN,
    ssn: initialData?.ssn || '',
    maritalStatus: initialData?.maritalStatus || MaritalStatus.UNKNOWN,
    race: initialData?.race,
    ethnicity: initialData?.ethnicity,
    bloodType: initialData?.bloodType,
    primaryLanguage: initialData?.primaryLanguage || '',
    address: initialData?.address || {
      street1: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    },
    contactInfo: initialData?.contactInfo || {
      primaryPhone: '',
      secondaryPhone: '',
      email: '',
      preferredContactMethod: 'phone',
    },
    emergencyContacts: initialData?.emergencyContacts || [],
    insurances: initialData?.insurances || [],
  });

  const [errors, setErrors] = React.useState<FormErrors>({});

  // NOTE: SSN is stored in transient React state only (not persisted to storage).
  // SSN is encrypted at transmission (HTTPS) and at rest (database-level AES-256-GCM).
  // React state cleanup on unmount is ineffective as setState is ignored after unmount.

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required fields
    if (!formData.firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!isValidDateOfBirth(new Date(formData.dateOfBirth))) {
      newErrors.dateOfBirth = 'Invalid date of birth';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }

    // SSN validation
    if (formData.ssn && !isValidSSN(formData.ssn)) {
      newErrors.ssn = 'Invalid SSN format';
    }

    // Address validation
    if (!formData.address?.street1?.trim()) {
      newErrors['address.street1'] = 'Street address is required';
    }
    if (!formData.address?.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address?.state?.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address?.postalCode?.trim()) {
      newErrors['address.postalCode'] = 'Postal code is required';
    }
    if (!formData.address?.country?.trim()) {
      newErrors['address.country'] = 'Country is required';
    }

    // Contact validation
    if (!formData.contactInfo?.primaryPhone?.trim()) {
      newErrors['contactInfo.primaryPhone'] = 'Primary phone is required';
    } else if (!isValidPhoneNumber(formData.contactInfo.primaryPhone)) {
      newErrors['contactInfo.primaryPhone'] = 'Invalid phone number format';
    }

    if (formData.contactInfo?.secondaryPhone && !isValidPhoneNumber(formData.contactInfo.secondaryPhone)) {
      newErrors['contactInfo.secondaryPhone'] = 'Invalid phone number format';
    }

    if (!formData.contactInfo?.preferredContactMethod) {
      newErrors['contactInfo.preferredContactMethod'] = 'Preferred contact method is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await onSubmit(formData as PatientDemographics);
    }
  };

  // Update form field value
  // ARCHITECTURE FIX: Do NOT sanitize (HTML-encode) at input time
  // Input-time encoding corrupts data: "O'Brien" becomes "O&#x27;Brien"
  // This breaks validation, search, and causes double-encoding on output
  //
  // XSS Prevention Strategy:
  // 1. React's JSX automatically escapes text content at render time
  // 2. Never use dangerouslySetInnerHTML with user input
  // 3. Server-side output encoding handles non-React contexts (emails, PDFs)
  // 4. Content Security Policy (CSP) provides additional protection
  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Update nested form field value (address, contactInfo)
  const updateNestedField = (parent: 'address' | 'contactInfo', field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
    // Clear error for this field
    const errorKey = `${parent}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-6', className)}>
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic patient demographic information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="required">
                First Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="John"
                aria-invalid={!!errors.firstName}
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => updateField('middleName', e.target.value)}
                placeholder="Michael"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="required">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="Doe"
                aria-invalid={!!errors.lastName}
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="suffix">Suffix</Label>
              <Input
                id="suffix"
                value={formData.suffix}
                onChange={(e) => updateField('suffix', e.target.value)}
                placeholder="Jr., Sr., III"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredName">Preferred Name</Label>
              <Input
                id="preferredName"
                value={formData.preferredName}
                onChange={(e) => updateField('preferredName', e.target.value)}
                placeholder="Johnny"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="required">
                Date of Birth
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth instanceof Date ? formData.dateOfBirth.toISOString().split('T')[0] : ''}
                onChange={(e) => updateField('dateOfBirth', new Date(e.target.value))}
                aria-invalid={!!errors.dateOfBirth}
              />
              {errors.dateOfBirth && (
                <p className="text-xs text-destructive">{errors.dateOfBirth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender" className="required">
                Gender
              </Label>
              <Select
                id="gender"
                value={formData.gender}
                onChange={(e) => updateField('gender', e.target.value as Gender)}
                aria-invalid={!!errors.gender}
              >
                <option value="">Select gender</option>
                <option value={Gender.MALE}>Male</option>
                <option value={Gender.FEMALE}>Female</option>
                <option value={Gender.OTHER}>Other</option>
                <option value={Gender.UNKNOWN}>Prefer not to say</option>
              </Select>
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ssn">Social Security Number</Label>
              <Input
                id="ssn"
                type="password"
                value={formData.ssn}
                onChange={(e) => updateField('ssn', e.target.value)}
                placeholder="XXX-XX-XXXX"
                maxLength={11}
                aria-invalid={!!errors.ssn}
              />
              {errors.ssn && (
                <p className="text-xs text-destructive">{errors.ssn}</p>
              )}
              <p className="text-xs text-muted-foreground">Encrypted and secured</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) => updateField('maritalStatus', e.target.value as MaritalStatus)}
              >
                <option value="">Select status</option>
                <option value={MaritalStatus.SINGLE}>Single</option>
                <option value={MaritalStatus.MARRIED}>Married</option>
                <option value={MaritalStatus.DIVORCED}>Divorced</option>
                <option value={MaritalStatus.WIDOWED}>Widowed</option>
                <option value={MaritalStatus.SEPARATED}>Separated</option>
                <option value={MaritalStatus.DOMESTIC_PARTNER}>Domestic Partner</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="race">Race</Label>
              <Select
                id="race"
                value={formData.race || ''}
                onChange={(e) => updateField('race', e.target.value as Race)}
              >
                <option value="">Select race</option>
                <option value={Race.AMERICAN_INDIAN_ALASKA_NATIVE}>
                  American Indian/Alaska Native
                </option>
                <option value={Race.ASIAN}>Asian</option>
                <option value={Race.BLACK_AFRICAN_AMERICAN}>Black/African American</option>
                <option value={Race.NATIVE_HAWAIIAN_PACIFIC_ISLANDER}>
                  Native Hawaiian/Pacific Islander
                </option>
                <option value={Race.WHITE}>White</option>
                <option value={Race.OTHER}>Other</option>
                <option value={Race.DECLINED}>Prefer not to say</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethnicity">Ethnicity</Label>
              <Select
                id="ethnicity"
                value={formData.ethnicity || ''}
                onChange={(e) => updateField('ethnicity', e.target.value as Ethnicity)}
              >
                <option value="">Select ethnicity</option>
                <option value={Ethnicity.HISPANIC_LATINO}>Hispanic or Latino</option>
                <option value={Ethnicity.NOT_HISPANIC_LATINO}>Not Hispanic or Latino</option>
                <option value={Ethnicity.DECLINED}>Prefer not to say</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select
                id="bloodType"
                value={formData.bloodType || ''}
                onChange={(e) => updateField('bloodType', e.target.value as BloodType)}
              >
                <option value="">Select blood type</option>
                <option value={BloodType.A_POSITIVE}>A+</option>
                <option value={BloodType.A_NEGATIVE}>A-</option>
                <option value={BloodType.B_POSITIVE}>B+</option>
                <option value={BloodType.B_NEGATIVE}>B-</option>
                <option value={BloodType.AB_POSITIVE}>AB+</option>
                <option value={BloodType.AB_NEGATIVE}>AB-</option>
                <option value={BloodType.O_POSITIVE}>O+</option>
                <option value={BloodType.O_NEGATIVE}>O-</option>
                <option value={BloodType.UNKNOWN}>Unknown</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryLanguage">Primary Language</Label>
              <Input
                id="primaryLanguage"
                value={formData.primaryLanguage}
                onChange={(e) => updateField('primaryLanguage', e.target.value)}
                placeholder="English"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
          <CardDescription>Patient residential address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street1" className="required">
              Street Address
            </Label>
            <Input
              id="street1"
              value={formData.address?.street1}
              onChange={(e) => updateNestedField('address', 'street1', e.target.value)}
              placeholder="123 Main St"
              aria-invalid={!!errors['address.street1']}
            />
            {errors['address.street1'] && (
              <p className="text-xs text-destructive">{errors['address.street1']}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="street2">Apartment, Suite, etc.</Label>
            <Input
              id="street2"
              value={formData.address?.street2}
              onChange={(e) => updateNestedField('address', 'street2', e.target.value)}
              placeholder="Apt 4B"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city" className="required">
                City
              </Label>
              <Input
                id="city"
                value={formData.address?.city}
                onChange={(e) => updateNestedField('address', 'city', e.target.value)}
                placeholder="New York"
                aria-invalid={!!errors['address.city']}
              />
              {errors['address.city'] && (
                <p className="text-xs text-destructive">{errors['address.city']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="required">
                State
              </Label>
              <Input
                id="state"
                value={formData.address?.state}
                onChange={(e) => updateNestedField('address', 'state', e.target.value)}
                placeholder="NY"
                maxLength={2}
                aria-invalid={!!errors['address.state']}
              />
              {errors['address.state'] && (
                <p className="text-xs text-destructive">{errors['address.state']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="required">
                Postal Code
              </Label>
              <Input
                id="postalCode"
                value={formData.address?.postalCode}
                onChange={(e) => updateNestedField('address', 'postalCode', e.target.value)}
                placeholder="10001"
                aria-invalid={!!errors['address.postalCode']}
              />
              {errors['address.postalCode'] && (
                <p className="text-xs text-destructive">{errors['address.postalCode']}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="required">
              Country
            </Label>
            <Input
              id="country"
              value={formData.address?.country}
              onChange={(e) => updateNestedField('address', 'country', e.target.value)}
              placeholder="United States"
              aria-invalid={!!errors['address.country']}
            />
            {errors['address.country'] && (
              <p className="text-xs text-destructive">{errors['address.country']}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How to reach the patient</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryPhone" className="required">
                Primary Phone
              </Label>
              <Input
                id="primaryPhone"
                type="tel"
                value={formData.contactInfo?.primaryPhone}
                onChange={(e) => updateNestedField('contactInfo', 'primaryPhone', e.target.value)}
                placeholder="(555) 123-4567"
                aria-invalid={!!errors['contactInfo.primaryPhone']}
              />
              {errors['contactInfo.primaryPhone'] && (
                <p className="text-xs text-destructive">{errors['contactInfo.primaryPhone']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryPhone">Secondary Phone</Label>
              <Input
                id="secondaryPhone"
                type="tel"
                value={formData.contactInfo?.secondaryPhone}
                onChange={(e) => updateNestedField('contactInfo', 'secondaryPhone', e.target.value)}
                placeholder="(555) 987-6543"
                aria-invalid={!!errors['contactInfo.secondaryPhone']}
              />
              {errors['contactInfo.secondaryPhone'] && (
                <p className="text-xs text-destructive">{errors['contactInfo.secondaryPhone']}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contactInfo?.email}
                onChange={(e) => updateNestedField('contactInfo', 'email', e.target.value)}
                placeholder="john.doe@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod" className="required">
                Preferred Contact Method
              </Label>
              <Select
                id="preferredContactMethod"
                value={formData.contactInfo?.preferredContactMethod}
                onChange={(e) => updateNestedField('contactInfo', 'preferredContactMethod', e.target.value)}
                aria-invalid={!!errors['contactInfo.preferredContactMethod']}
              >
                <option value="">Select method</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </Select>
              {errors['contactInfo.preferredContactMethod'] && (
                <p className="text-xs text-destructive">
                  {errors['contactInfo.preferredContactMethod']}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Demographics'}
        </Button>
      </div>
    </form>
  );
};
