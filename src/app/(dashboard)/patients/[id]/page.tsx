/**
 * Patient Detail Page
 * Display detailed patient information
 */

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Spinner,
  Alert,
  AlertDescription,
} from '@/components/ui';
import { usePatient } from '@/lib/api';
import { useAuth } from '@/hooks';
import { checkPatientDataPermission, calculateAge, formatPhoneNumber, maskSSN } from '@/lib/utils';
import {
  User,
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertCircle,
} from 'lucide-react';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const patientId = params?.id as string;

  const { data: patient, isLoading, isError, error } = usePatient(patientId);

  const permission = checkPatientDataPermission(user?.roles || [], 'edit');

  const handleEdit = () => {
    router.push(`/patients/${patientId}/edit`);
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
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Failed to load patient information'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const age = calculateAge(new Date(patient.demographics.dateOfBirth));

  return (
    <div className="container mx-auto space-y-6 p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {patient.demographics.firstName} {patient.demographics.lastName}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">MRN: {patient.medicalRecordNumber}</Badge>
                <span className="text-sm text-muted-foreground">
                  {age} years old, {patient.demographics.gender}
                </span>
                {!patient.isActive && <Badge variant="secondary">Inactive</Badge>}
                {patient.isDeceased && <Badge variant="destructive">Deceased</Badge>}
              </div>
            </div>
          </div>
        </div>
        {permission.canEdit && (
          <Button onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Demographics */}
        <Card>
          <CardHeader>
            <CardTitle>Demographics</CardTitle>
            <CardDescription>Personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Full Name:</span>
                <span className="text-sm font-medium">
                  {patient.demographics.firstName} {patient.demographics.middleName}{' '}
                  {patient.demographics.lastName} {patient.demographics.suffix}
                </span>
              </div>
              {patient.demographics.preferredName && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Preferred Name:</span>
                  <span className="text-sm font-medium">{patient.demographics.preferredName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Date of Birth:</span>
                <span className="text-sm font-medium">
                  {new Date(patient.demographics.dateOfBirth).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Age:</span>
                <span className="text-sm font-medium">{age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Gender:</span>
                <span className="text-sm font-medium">{patient.demographics.gender}</span>
              </div>
              {patient.demographics.ssn && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">SSN:</span>
                  <div className="flex items-center gap-2">
                    <Shield className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium font-mono">
                      {maskSSN(patient.demographics.ssn)}
                    </span>
                  </div>
                </div>
              )}
              {patient.demographics.maritalStatus && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Marital Status:</span>
                  <span className="text-sm font-medium">{patient.demographics.maritalStatus}</span>
                </div>
              )}
              {patient.demographics.bloodType && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Blood Type:</span>
                  <Badge variant="outline">{patient.demographics.bloodType.replace('_', '')}</Badge>
                </div>
              )}
              {patient.demographics.primaryLanguage && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Primary Language:</span>
                  <span className="text-sm font-medium">{patient.demographics.primaryLanguage}</span>
                </div>
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
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {formatPhoneNumber(patient.demographics.contactInfo.primaryPhone)}
                  </p>
                  <p className="text-xs text-muted-foreground">Primary Phone</p>
                </div>
              </div>
              {patient.demographics.contactInfo.secondaryPhone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {formatPhoneNumber(patient.demographics.contactInfo.secondaryPhone)}
                    </p>
                    <p className="text-xs text-muted-foreground">Secondary Phone</p>
                  </div>
                </div>
              )}
              {patient.demographics.contactInfo.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{patient.demographics.contactInfo.email}</p>
                    <p className="text-xs text-muted-foreground">Email</p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {patient.demographics.address.street1}
                    {patient.demographics.address.street2 && `, ${patient.demographics.address.street2}`}
                  </p>
                  <p className="text-sm font-medium">
                    {patient.demographics.address.city}, {patient.demographics.address.state}{' '}
                    {patient.demographics.address.postalCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {patient.demographics.address.country}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Preferred Contact: {patient.demographics.contactInfo.preferredContactMethod.toUpperCase()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contacts */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contacts</CardTitle>
            <CardDescription>Emergency contact information</CardDescription>
          </CardHeader>
          <CardContent>
            {patient.demographics.emergencyContacts.length > 0 ? (
              <div className="space-y-4">
                {patient.demographics.emergencyContacts.map((contact, index) => (
                  <div key={index} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.relationship}</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {formatPhoneNumber(contact.phoneNumber)}
                      </div>
                      {contact.alternatePhone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {formatPhoneNumber(contact.alternatePhone)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No emergency contacts on file</p>
            )}
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Information</CardTitle>
            <CardDescription>Active insurance policies</CardDescription>
          </CardHeader>
          <CardContent>
            {patient.demographics.insurances.length > 0 ? (
              <div className="space-y-4">
                {patient.demographics.insurances.map((insurance, index) => (
                  <div key={index} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{insurance.provider}</p>
                        {insurance.isPrimary && (
                          <Badge variant="default" className="mt-1">
                            Primary
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Policy:</span>
                        <span className="font-mono">{insurance.policyNumber}</span>
                      </div>
                      {insurance.groupNumber && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Group:</span>
                          <span className="font-mono">{insurance.groupNumber}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subscriber:</span>
                        <span>{insurance.subscriberName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Relationship:</span>
                        <span>{insurance.subscriberRelationship}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Effective:</span>
                        <span>{new Date(insurance.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No insurance information on file</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Additional Information */}
      {patient.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Audit Information */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created:</span>
              <span>{new Date(patient.createdAt).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Updated:</span>
              <span>{new Date(patient.updatedAt).toLocaleString()}</span>
            </div>
            {patient.createdBy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created By:</span>
                <span>{patient.createdBy}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
