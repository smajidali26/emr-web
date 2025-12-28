/**
 * Patient Type Definitions
 * Defines types for patient registration and demographics
 */

import { BaseEntity } from './common.types';

/**
 * Gender enumeration
 */
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Marital status enumeration
 */
export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED',
  DOMESTIC_PARTNER = 'DOMESTIC_PARTNER',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Race enumeration (following HL7 standards)
 */
export enum Race {
  AMERICAN_INDIAN_ALASKA_NATIVE = 'AMERICAN_INDIAN_ALASKA_NATIVE',
  ASIAN = 'ASIAN',
  BLACK_AFRICAN_AMERICAN = 'BLACK_AFRICAN_AMERICAN',
  NATIVE_HAWAIIAN_PACIFIC_ISLANDER = 'NATIVE_HAWAIIAN_PACIFIC_ISLANDER',
  WHITE = 'WHITE',
  OTHER = 'OTHER',
  DECLINED = 'DECLINED',
}

/**
 * Ethnicity enumeration (following HL7 standards)
 */
export enum Ethnicity {
  HISPANIC_LATINO = 'HISPANIC_LATINO',
  NOT_HISPANIC_LATINO = 'NOT_HISPANIC_LATINO',
  DECLINED = 'DECLINED',
}

/**
 * Blood type enumeration
 */
export enum BloodType {
  A_POSITIVE = 'A_POSITIVE',
  A_NEGATIVE = 'A_NEGATIVE',
  B_POSITIVE = 'B_POSITIVE',
  B_NEGATIVE = 'B_NEGATIVE',
  AB_POSITIVE = 'AB_POSITIVE',
  AB_NEGATIVE = 'AB_NEGATIVE',
  O_POSITIVE = 'O_POSITIVE',
  O_NEGATIVE = 'O_NEGATIVE',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Address information
 */
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

/**
 * Contact information
 */
export interface ContactInfo {
  primaryPhone: string;
  secondaryPhone?: string;
  email?: string;
  preferredContactMethod: 'phone' | 'email' | 'sms';
}

/**
 * Emergency contact
 */
export interface EmergencyContact {
  name: string;
  relationship: string;
  phoneNumber: string;
  alternatePhone?: string;
  address?: Address;
}

/**
 * Insurance information
 */
export interface Insurance {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  subscriberName: string;
  subscriberRelationship: string;
  effectiveDate: Date;
  expirationDate?: Date;
  isPrimary: boolean;
}

/**
 * Patient demographics
 */
export interface PatientDemographics {
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  preferredName?: string;
  dateOfBirth: Date;
  gender: Gender;
  ssn?: string; // Stored encrypted in backend
  maritalStatus?: MaritalStatus;
  race?: Race;
  ethnicity?: Ethnicity;
  bloodType?: BloodType;
  primaryLanguage?: string;
  address: Address;
  contactInfo: ContactInfo;
  emergencyContacts: EmergencyContact[];
  insurances: Insurance[];
}

/**
 * Full patient entity
 */
export interface Patient extends BaseEntity {
  medicalRecordNumber: string; // Unique MRN
  demographics: PatientDemographics;
  isActive: boolean;
  isDeceased: boolean;
  deceasedDate?: Date;
  primaryCareProviderId?: string;
  notes?: string;
}

/**
 * Patient search result (optimized for search/list views)
 */
export interface PatientSearchResult {
  id: string;
  medicalRecordNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: Gender;
  primaryPhone: string;
  email?: string;
  lastVisitDate?: Date;
  isActive: boolean;
}

/**
 * Patient registration request
 */
export interface PatientRegistrationRequest {
  demographics: PatientDemographics;
  primaryCareProviderId?: string;
  notes?: string;
}

/**
 * Patient update request
 */
export interface PatientUpdateRequest {
  demographics?: Partial<PatientDemographics>;
  primaryCareProviderId?: string;
  notes?: string;
  isActive?: boolean;
}

/**
 * Patient search filters
 */
export interface PatientSearchFilters {
  query?: string; // Search by name, MRN, phone
  dateOfBirth?: Date;
  gender?: Gender;
  isActive?: boolean;
  primaryCareProviderId?: string;
  [key: string]: unknown; // Allow additional filter properties
}

/**
 * Patient list item for display
 */
export interface PatientListItem {
  id: string;
  medicalRecordNumber: string;
  fullName: string;
  dateOfBirth: Date;
  age: number;
  gender: Gender;
  primaryPhone: string;
  email?: string;
  address: string;
  lastVisitDate?: Date;
  isActive: boolean;
}
