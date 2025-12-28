/**
 * Patient API
 * TanStack Query hooks for patient data fetching and mutations
 * SECURITY FIX: Added audit logging for HIPAA compliance
 * Assigned: Samantha Adams (12h)
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { apiClient } from './api-client';
import { queryKeys } from './query-client';
import {
  Patient,
  PatientSearchResult,
  PatientRegistrationRequest,
  PatientUpdateRequest,
  PatientSearchFilters,
  PaginatedRequest,
  PaginatedResponse,
  ApiError,
} from '@/types';
import { secureLogger } from '@/lib/utils/secure-logger';
import { logAuditEntry } from '@/lib/utils/security';
import { hasRole, hasAnyRole } from '@/lib/auth';
import { UserRole } from '@/types';

/**
 * API endpoints
 */
const ENDPOINTS = {
  patients: '/api/v1/patients',
  patient: (id: string) => `/api/v1/patients/${id}`,
  search: '/api/v1/patients/search',
  validate: '/api/v1/patients/validate',
};

/**
 * Fetch patient by ID
 */
export const fetchPatient = async (id: string): Promise<Patient> => {
  try {
    return await apiClient.get<Patient>(ENDPOINTS.patient(id));
  } catch (error) {
    secureLogger.error('Failed to fetch patient:', error);
    throw error;
  }
};

/**
 * Fetch patients with pagination
 */
export const fetchPatients = async (
  request: PaginatedRequest
): Promise<PaginatedResponse<PatientSearchResult>> => {
  try {
    return await apiClient.get<PaginatedResponse<PatientSearchResult>>(
      ENDPOINTS.patients,
      { params: request as Record<string, string | number | boolean> }
    );
  } catch (error) {
    secureLogger.error('Failed to fetch patients:', error);
    throw error;
  }
};

/**
 * Search patients
 */
export const searchPatients = async (
  filters: PatientSearchFilters
): Promise<PatientSearchResult[]> => {
  try {
    return await apiClient.get<PatientSearchResult[]>(ENDPOINTS.search, {
      params: filters as Record<string, string | number | boolean>,
    });
  } catch (error) {
    secureLogger.error('Failed to search patients:', error);
    throw error;
  }
};

/**
 * Register new patient
 */
export const registerPatient = async (
  data: PatientRegistrationRequest
): Promise<Patient> => {
  try {
    return await apiClient.post<Patient>(ENDPOINTS.patients, data);
  } catch (error) {
    secureLogger.error('Failed to register patient:', error);
    throw error;
  }
};

/**
 * Update patient
 */
export const updatePatient = async (
  id: string,
  data: PatientUpdateRequest
): Promise<Patient> => {
  try {
    return await apiClient.patch<Patient>(ENDPOINTS.patient(id), data);
  } catch (error) {
    secureLogger.error('Failed to update patient:', error);
    throw error;
  }
};

/**
 * Deactivate patient (soft delete)
 */
export const deactivatePatient = async (id: string): Promise<void> => {
  try {
    await apiClient.patch(ENDPOINTS.patient(id), { isActive: false });
  } catch (error) {
    secureLogger.error('Failed to deactivate patient:', error);
    throw error;
  }
};

/**
 * Validate patient data (e.g., check for duplicates)
 */
export const validatePatientData = async (
  data: Partial<PatientRegistrationRequest>
): Promise<{ isValid: boolean; errors?: Record<string, string> }> => {
  try {
    return await apiClient.post(ENDPOINTS.validate, data);
  } catch (error) {
    secureLogger.error('Failed to validate patient data:', error);
    throw error;
  }
};

// ============================================================================
// TanStack Query Hooks
// ============================================================================

/**
 * Hook to fetch a single patient
 * SECURITY FIX: Added audit logging for patient data access (HIPAA compliance)
 */
export const usePatient = (
  id: string,
  userId?: string,
  options?: Omit<UseQueryOptions<Patient, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Patient, ApiError>({
    queryKey: queryKeys.patients.detail(id),
    queryFn: async () => {
      const patient = await fetchPatient(id);

      // Log patient data access for HIPAA compliance
      if (userId) {
        await logAuditEntry(userId, 'view', 'Patient', id, {
          patientName: `${patient.demographics.firstName} ${patient.demographics.lastName}`,
        });
      }

      return patient;
    },
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to fetch patients with pagination
 */
export const usePatients = (
  request: PaginatedRequest = {},
  options?: Omit<
    UseQueryOptions<PaginatedResponse<PatientSearchResult>, ApiError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PaginatedResponse<PatientSearchResult>, ApiError>({
    queryKey: queryKeys.patients.list(request),
    queryFn: () => fetchPatients(request),
    ...options,
  });
};

/**
 * Hook to search patients
 */
export const useSearchPatients = (
  filters: PatientSearchFilters,
  options?: Omit<
    UseQueryOptions<PatientSearchResult[], ApiError>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery<PatientSearchResult[], ApiError>({
    queryKey: ['patients', 'search', filters],
    queryFn: () => searchPatients(filters),
    enabled: !!filters.query || Object.keys(filters).length > 1,
    ...options,
  });
};

/**
 * Options for useRegisterPatient hook
 */
interface UseRegisterPatientOptions
  extends Omit<UseMutationOptions<Patient, ApiError, PatientRegistrationRequest>, 'mutationFn'> {
  /** User ID for audit logging (HIPAA compliance) */
  userId?: string;
}

/**
 * Hook to register a new patient
 * SECURITY FIX: Added audit logging for patient creation (HIPAA compliance)
 * SECURITY FIX: Added RBAC checks before mutation (Rachel Scott - 8h)
 */
export const useRegisterPatient = (options?: UseRegisterPatientOptions) => {
  const queryClient = useQueryClient();
  const { userId, onSuccess: userOnSuccess, ...restOptions } = options ?? {};

  return useMutation<Patient, ApiError, PatientRegistrationRequest>({
    ...restOptions,
    mutationFn: async (data) => {
      // SECURITY FIX: Check if user has permission to create patients
      const canCreate = hasAnyRole([UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE, UserRole.RECEPTIONIST]);

      if (!canCreate) {
        const error: ApiError = {
          code: 'FORBIDDEN',
          message: 'You do not have permission to register patients',
          statusCode: 403,
        };
        throw error;
      }

      return registerPatient(data);
    },
    onSuccess: async (data, variables, context) => {
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      // Set the new patient in cache
      queryClient.setQueryData(queryKeys.patients.detail(data.id), data);
      secureLogger.info('Patient registered successfully', { patientId: data.id });

      // SECURITY FIX: Task #2657 - Wrap async operations in try/catch
      // Log patient creation for HIPAA compliance
      if (userId) {
        try {
          await logAuditEntry(userId, 'create', 'Patient', data.id, {
            patientName: `${data.demographics.firstName} ${data.demographics.lastName}`,
          });
        } catch (error) {
          secureLogger.error('Failed to log audit entry for patient creation:', error);
        }
      }

      // Call user-provided onSuccess if present
      // Note: TanStack Query v5 mutation onSuccess takes (data, variables, context, mutation)
      if (userOnSuccess) {
        try {
          await (userOnSuccess as (data: Patient, variables: PatientRegistrationRequest, context: unknown) => void | Promise<void>)(data, variables, context);
        } catch (error) {
          secureLogger.error('Error in user-provided onSuccess callback:', error);
        }
      }
    },
  });
};

/**
 * Options for useUpdatePatient hook
 */
interface UseUpdatePatientOptions
  extends Omit<
    UseMutationOptions<Patient, ApiError, { id: string; data: PatientUpdateRequest }>,
    'mutationFn'
  > {
  /** User ID for audit logging (HIPAA compliance) */
  userId?: string;
}

/**
 * Hook to update patient
 * SECURITY FIX: Added audit logging for patient updates (HIPAA compliance)
 * SECURITY FIX: Added RBAC checks before mutation (Rachel Scott - 8h)
 */
export const useUpdatePatient = (options?: UseUpdatePatientOptions) => {
  const queryClient = useQueryClient();
  const { userId, onSuccess: userOnSuccess, ...restOptions } = options ?? {};

  return useMutation<Patient, ApiError, { id: string; data: PatientUpdateRequest }>({
    ...restOptions,
    mutationFn: async ({ id, data }) => {
      // SECURITY FIX: Check if user has permission to update patients
      const canUpdate = hasAnyRole([UserRole.ADMIN, UserRole.DOCTOR, UserRole.NURSE]);

      if (!canUpdate) {
        const error: ApiError = {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update patient records',
          statusCode: 403,
        };
        throw error;
      }

      return updatePatient(id, data);
    },
    onSuccess: async (data, variables, context) => {
      // Update the patient in cache
      queryClient.setQueryData(queryKeys.patients.detail(variables.id), data);
      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      secureLogger.info('Patient updated successfully', { patientId: variables.id });

      // SECURITY FIX: Task #2657 - Wrap async operations in try/catch
      // Log patient update for HIPAA compliance
      if (userId) {
        try {
          await logAuditEntry(userId, 'update', 'Patient', variables.id, {
            patientName: `${data.demographics.firstName} ${data.demographics.lastName}`,
            updatedFields: Object.keys(variables.data),
          });
        } catch (error) {
          secureLogger.error('Failed to log audit entry for patient update:', error);
        }
      }

      // Call user-provided onSuccess if present
      // Note: TanStack Query v5 mutation onSuccess takes (data, variables, context, mutation)
      if (userOnSuccess) {
        try {
          await (userOnSuccess as (data: Patient, variables: { id: string; data: PatientUpdateRequest }, context: unknown) => void | Promise<void>)(data, variables, context);
        } catch (error) {
          secureLogger.error('Error in user-provided onSuccess callback:', error);
        }
      }
    },
  });
};

/**
 * Hook to deactivate patient
 * SECURITY FIX: Added audit logging for patient deactivation (HIPAA compliance)
 * SECURITY FIX: Added RBAC checks before mutation (Rachel Scott - 8h)
 */
export const useDeactivatePatient = (
  userId?: string,
  options?: UseMutationOptions<void, ApiError, string>
) => {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, string>({
    mutationFn: async (patientId) => {
      // SECURITY FIX: Check if user has permission to deactivate patients (Admin only)
      const canDelete = hasRole(UserRole.ADMIN);

      if (!canDelete) {
        const error: ApiError = {
          code: 'FORBIDDEN',
          message: 'You do not have permission to deactivate patient records. Admin access required.',
          statusCode: 403,
        };
        throw error;
      }

      return deactivatePatient(patientId);
    },
    onSuccess: async (_, patientId) => {
      // Invalidate patient cache
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patients.all });
      secureLogger.info('Patient deactivated successfully', { patientId });

      // SECURITY FIX: Task #2657 - Wrap async operations in try/catch
      // Log patient deletion for HIPAA compliance
      if (userId) {
        try {
          await logAuditEntry(userId, 'delete', 'Patient', patientId, {
            action: 'deactivation',
          });
        } catch (error) {
          secureLogger.error('Failed to log audit entry for patient deactivation:', error);
        }
      }
    },
    ...options,
  });
};

/**
 * Hook to validate patient data
 */
export const useValidatePatient = (
  options?: UseMutationOptions<
    { isValid: boolean; errors?: Record<string, string> },
    ApiError,
    Partial<PatientRegistrationRequest>
  >
) => {
  return useMutation<
    { isValid: boolean; errors?: Record<string, string> },
    ApiError,
    Partial<PatientRegistrationRequest>
  >({
    mutationFn: validatePatientData,
    ...options,
  });
};
