/**
 * useAuditLog Hook
 * Custom hook for HIPAA-compliant audit logging
 * SECURITY FIX: Audit logging hook for tracking patient data access
 * Assigned: Samantha Adams (12h)
 */

'use client';

import { useCallback } from 'react';
import { useAuth } from './use-auth';
import { logAuditEntry, AuditEntry } from '@/lib/utils/security';

export interface UseAuditLogReturn {
  logAccess: (resourceType: string, resourceId: string, details?: Record<string, unknown>) => Promise<void>;
  logCreate: (resourceType: string, resourceId: string, details?: Record<string, unknown>) => Promise<void>;
  logUpdate: (resourceType: string, resourceId: string, details?: Record<string, unknown>) => Promise<void>;
  logDelete: (resourceType: string, resourceId: string, details?: Record<string, unknown>) => Promise<void>;
}

/**
 * Hook for logging user actions for HIPAA compliance
 * Automatically captures userId from current authenticated user
 */
export const useAuditLog = (): UseAuditLogReturn => {
  const { user } = useAuth();

  const log = useCallback(
    async (
      action: AuditEntry['action'],
      resourceType: string,
      resourceId: string,
      details?: Record<string, unknown>
    ) => {
      if (!user?.id) {
        console.warn('Cannot log audit entry: User not authenticated');
        return;
      }

      // SECURITY FIX: Task #2657 - Wrap in try/catch to prevent unhandled promise rejection
      // Audit logging failures should not crash the application
      try {
        await logAuditEntry(user.id, action, resourceType, resourceId, details);
      } catch (error) {
        // Log error but don't throw - audit logging should not block user operations
        console.error('Failed to log audit entry:', error);
      }
    },
    [user?.id]
  );

  const logAccess = useCallback(
    (resourceType: string, resourceId: string, details?: Record<string, unknown>) => {
      return log('view', resourceType, resourceId, details);
    },
    [log]
  );

  const logCreate = useCallback(
    (resourceType: string, resourceId: string, details?: Record<string, unknown>) => {
      return log('create', resourceType, resourceId, details);
    },
    [log]
  );

  const logUpdate = useCallback(
    (resourceType: string, resourceId: string, details?: Record<string, unknown>) => {
      return log('update', resourceType, resourceId, details);
    },
    [log]
  );

  const logDelete = useCallback(
    (resourceType: string, resourceId: string, details?: Record<string, unknown>) => {
      return log('delete', resourceType, resourceId, details);
    },
    [log]
  );

  return {
    logAccess,
    logCreate,
    logUpdate,
    logDelete,
  };
};
