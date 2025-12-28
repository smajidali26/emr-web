/**
 * useAuth Hook
 * Custom hook for authentication state and operations
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import {
  getCurrentUser,
  signInRedirect,
  signInPopup,
  signOut as authSignOut,
  isAuthenticated as checkIsAuthenticated,
  hasRole,
  hasAnyRole,
} from '@/lib/auth';
import { User, UserRole } from '@/types';
import { secureLogger } from '@/lib/utils/secure-logger';

export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  signIn: (usePopup?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

/**
 * Authentication hook
 * Provides authentication state and methods
 * SECURITY FIX: Task #10 - Fix auth race condition (Rachel Scott - 8h)
 */
export const useAuth = (): UseAuthReturn => {
  const { accounts, inProgress } = useMsal();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  // SECURITY FIX: Initialize isLoading as true to prevent flash of unauthenticated content
  const [isLoading, setIsLoading] = useState(true);
  // SECURITY FIX: Store isAuthenticated in state to prevent race condition
  // Previously computed fresh each render causing desync with isLoading
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(false);

  // Update user and auth state atomically when accounts or progress changes
  useEffect(() => {
    // SECURITY FIX: Only mark loading complete when MSAL is done processing
    const msalInProgress = inProgress !== 'none';

    if (msalInProgress) {
      // MSAL is still processing, keep loading state
      setIsLoading(true);
      return;
    }

    try {
      const currentUser = getCurrentUser();
      const authenticated = checkIsAuthenticated();

      // SECURITY FIX: Update all auth state atomically to prevent race condition
      setUser(currentUser);
      setIsAuthenticatedState(authenticated);
      setIsLoading(false);
    } catch (err) {
      secureLogger.error('Error getting current user:', err);
      setError(err instanceof Error ? err.message : 'Failed to get user');
      setIsAuthenticatedState(false);
      setIsLoading(false);
    }
  }, [accounts, inProgress]);

  // Sign in handler
  // NOTE: isLoading is managed by useEffect based on MSAL's inProgress state.
  // Do not set isLoading(false) here to avoid race conditions with useEffect.
  const signIn = useCallback(async (usePopup = false) => {
    setError(null);

    try {
      if (usePopup) {
        await signInPopup();
      } else {
        await signInRedirect();
      }
    } catch (err) {
      secureLogger.error('Sign in error:', err);
      setError(err instanceof Error ? err.message : 'Sign in failed');
      throw err;
    }
  }, []);

  // Sign out handler
  // SECURITY FIX: Task #11 - Clear auth state on error to prevent partial logout
  // NOTE: isLoading is managed by useEffect based on MSAL's inProgress state.
  const signOut = useCallback(async () => {
    setError(null);

    try {
      await authSignOut();
      setUser(null);
      setIsAuthenticatedState(false);
    } catch (err) {
      secureLogger.error('Sign out error:', err);
      // Still clear user and auth state even on error to prevent security bypass
      setUser(null);
      setIsAuthenticatedState(false);
      setError(err instanceof Error ? err.message : 'Sign out failed');
      throw err;
    }
  }, []);

  // Check if user has specific role
  const checkHasRole = useCallback((role: UserRole): boolean => {
    return hasRole(role);
  }, []);

  // Check if user has any of specified roles
  const checkHasAnyRole = useCallback((roles: UserRole[]): boolean => {
    return hasAnyRole(roles);
  }, []);

  return {
    user,
    // SECURITY FIX: Use state variable instead of function call to prevent race condition
    isAuthenticated: isAuthenticatedState,
    isLoading,
    error,
    signIn,
    signOut,
    hasRole: checkHasRole,
    hasAnyRole: checkHasAnyRole,
  };
};
