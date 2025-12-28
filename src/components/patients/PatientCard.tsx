/**
 * Patient Card Component
 * Display card for patient information
 */

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, Badge } from '@/components/ui';
import { Patient, PatientSearchResult } from '@/types';
import { calculateAge, formatPhoneNumber } from '@/lib/utils';
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PatientCardProps {
  patient: Patient | PatientSearchResult;
  onClick?: () => void;
  className?: string;
  showDetails?: boolean;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onClick,
  className,
  showDetails = true,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push(`/patients/${patient.id}`);
    }
  };

  const isFullPatient = (p: Patient | PatientSearchResult): p is Patient => {
    return 'demographics' in p;
  };

  const fullPatient = isFullPatient(patient) ? patient : null;
  const searchResult = !isFullPatient(patient) ? patient : null;

  const firstName = fullPatient?.demographics.firstName ?? searchResult?.firstName ?? '';
  const lastName = fullPatient?.demographics.lastName ?? searchResult?.lastName ?? '';
  const dateOfBirth = fullPatient?.demographics.dateOfBirth ?? searchResult?.dateOfBirth;
  const gender = fullPatient?.demographics.gender ?? searchResult?.gender;
  const primaryPhone = fullPatient?.demographics.contactInfo.primaryPhone ?? searchResult?.primaryPhone;
  const email = fullPatient?.demographics.contactInfo.email ?? searchResult?.email;

  const age = dateOfBirth ? calculateAge(new Date(dateOfBirth)) : null;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        !isFullPatient(patient) && 'isActive' in patient && !patient.isActive && 'opacity-60',
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>

          {/* Patient Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {firstName} {lastName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    MRN: {'medicalRecordNumber' in patient ? patient.medicalRecordNumber : 'N/A'}
                  </Badge>
                  {age !== null && (
                    <span className="text-sm text-muted-foreground">
                      {age} yrs, {gender}
                    </span>
                  )}
                  {'isActive' in patient && !patient.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
              </div>
            </div>

            {showDetails && (
              <div className="mt-3 space-y-1.5">
                {primaryPhone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{formatPhoneNumber(primaryPhone)}</span>
                  </div>
                )}

                {email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{email}</span>
                  </div>
                )}

                {fullPatient && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      {fullPatient.demographics.address.city}, {fullPatient.demographics.address.state}
                    </span>
                  </div>
                )}

                {'lastVisitDate' in patient && patient.lastVisitDate && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 shrink-0" />
                    <span>
                      Last visit: {new Date(patient.lastVisitDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
