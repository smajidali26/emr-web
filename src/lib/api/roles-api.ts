/**
 * Roles API Client
 * API client for role and permission management endpoints
 */

import { apiClient } from './api-client';
import { RoleDto, PermissionDto, AssignPermissionsRequest, Permission } from '@/types';

const ROLES_ENDPOINT = '/api/roles';

/**
 * Get all roles in the system
 */
export async function getAllRoles(): Promise<RoleDto[]> {
  return apiClient.get<RoleDto[]>(ROLES_ENDPOINT);
}

/**
 * Get a specific role by ID
 */
export async function getRoleById(id: string): Promise<RoleDto> {
  return apiClient.get<RoleDto>(`${ROLES_ENDPOINT}/${id}`);
}

/**
 * Get all available permissions in the system
 */
export async function getAllPermissions(): Promise<PermissionDto[]> {
  return apiClient.get<PermissionDto[]>(`${ROLES_ENDPOINT}/permissions`);
}

/**
 * Assign permissions to a role
 */
export async function assignPermissionsToRole(
  roleId: string,
  permissions: Permission[]
): Promise<{ message: string }> {
  const request: AssignPermissionsRequest = { permissions };
  return apiClient.put<{ message: string }>(
    `${ROLES_ENDPOINT}/${roleId}/permissions`,
    request
  );
}

/**
 * Roles API object for use with TanStack Query
 */
export const rolesApi = {
  getAllRoles,
  getRoleById,
  getAllPermissions,
  assignPermissionsToRole,
};
