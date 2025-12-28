/**
 * Authentication Service
 * Handles authentication operations using MSAL
 */

import {
  AuthenticationResult,
  AccountInfo,
  RedirectRequest,
  PopupRequest,
  SilentRequest,
  EndSessionRequest,
} from '@azure/msal-browser';
import { getMsalInstance } from './msal-instance';
import { loginRequest, tokenRequest, b2cPolicies } from './msal-config';
import { User, UserRole } from '@/types';
import { secureLogger } from '@/lib/utils/secure-logger';

/**
 * Get the current authenticated user account
 */
export const getCurrentAccount = (): AccountInfo | null => {
  const msalInstance = getMsalInstance();
  const accounts = msalInstance.getAllAccounts();

  if (accounts.length === 0) {
    return null;
  }

  // Return the active account or the first account
  return msalInstance.getActiveAccount() || accounts[0];
};

/**
 * Sign in using redirect flow
 */
export const signInRedirect = async (): Promise<void> => {
  const msalInstance = getMsalInstance();
  const request: RedirectRequest = {
    ...loginRequest,
    authority: b2cPolicies.authorities.signIn,
  };

  try {
    await msalInstance.loginRedirect(request);
  } catch (error) {
    secureLogger.error('Sign in redirect error:', error);
    throw error;
  }
};

/**
 * Sign in using popup flow
 */
export const signInPopup = async (): Promise<AuthenticationResult> => {
  const msalInstance = getMsalInstance();
  const request: PopupRequest = {
    ...loginRequest,
    authority: b2cPolicies.authorities.signIn,
  };

  try {
    const response = await msalInstance.loginPopup(request);
    msalInstance.setActiveAccount(response.account);
    return response;
  } catch (error) {
    secureLogger.error('Sign in popup error:', error);
    throw error;
  }
};

/**
 * Sign out
 * SECURITY FIX: Clear PHI cache on logout (HIPAA compliance)
 * Assigned: Elizabeth Nelson (4h)
 */
export const signOut = async (): Promise<void> => {
  const msalInstance = getMsalInstance();
  const account = getCurrentAccount();

  if (!account) {
    return;
  }

  const logoutRequest: EndSessionRequest = {
    account,
    postLogoutRedirectUri: msalInstance.getConfiguration().auth.postLogoutRedirectUri,
  };

  try {
    // SECURITY FIX: Clear query cache to remove PHI data from memory
    // Import dynamically to avoid circular dependencies
    const { queryClient } = await import('@/lib/api/query-client');
    queryClient.clear();

    // Also clear session storage
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }

    await msalInstance.logoutRedirect(logoutRequest);
  } catch (error) {
    secureLogger.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Token refresh interval (5 minutes before expiry)
 */
const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Schedule proactive token refresh
 */
let tokenRefreshTimeout: NodeJS.Timeout | null = null;

/**
 * SECURITY FIX: Task #2656 - Fix token refresh race condition
 * Mutex to prevent concurrent token refresh attempts
 * When multiple components request tokens simultaneously, only one refresh occurs
 */
let tokenRefreshPromise: Promise<string> | null = null;
let isRefreshing = false;

const scheduleTokenRefresh = (expiresOn: Date | null | undefined) => {
  // Clear any existing timeout
  if (tokenRefreshTimeout) {
    clearTimeout(tokenRefreshTimeout);
    tokenRefreshTimeout = null;
  }

  if (!expiresOn) {
    return;
  }

  const now = new Date().getTime();
  const expiryTime = new Date(expiresOn).getTime();
  const refreshTime = expiryTime - TOKEN_REFRESH_BUFFER_MS;
  const timeUntilRefresh = refreshTime - now;

  // Only schedule if we have sufficient time
  if (timeUntilRefresh > 0) {
    tokenRefreshTimeout = setTimeout(async () => {
      try {
        // Trigger a silent token refresh
        await getAccessToken();
      } catch (error) {
        secureLogger.error('Proactive token refresh failed:', error);
      }
    }, timeUntilRefresh);
  }
};

/**
 * Get access token silently with proactive refresh
 * SECURITY: Implements token refresh 5 minutes before expiration
 * SECURITY FIX: Task #2656 - Uses mutex to prevent concurrent refresh attempts
 */
export const getAccessToken = async (scopes?: string[]): Promise<string> => {
  // SECURITY FIX: If a refresh is already in progress, wait for it instead of starting another
  // This prevents race conditions when multiple components request tokens simultaneously
  if (isRefreshing && tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  const msalInstance = getMsalInstance();
  const account = getCurrentAccount();

  if (!account) {
    throw new Error('No active account found');
  }

  const request: SilentRequest = {
    ...tokenRequest,
    scopes: scopes || tokenRequest.scopes,
    account,
  };

  // SECURITY FIX: Set mutex before starting token acquisition
  isRefreshing = true;

  // Create a promise that all concurrent callers will await
  tokenRefreshPromise = (async () => {
    try {
      const response = await msalInstance.acquireTokenSilent(request);

      // Schedule proactive refresh before token expires
      scheduleTokenRefresh(response.expiresOn);

      return response.accessToken;
    } catch (error) {
      secureLogger.error('Silent token acquisition failed:', error);

      // Fallback to interactive token acquisition
      try {
        const response = await msalInstance.acquireTokenPopup(request);

        // Schedule proactive refresh for the new token
        scheduleTokenRefresh(response.expiresOn);

        return response.accessToken;
      } catch (interactiveError) {
        secureLogger.error('Interactive token acquisition failed:', interactiveError);
        throw interactiveError;
      }
    } finally {
      // SECURITY FIX: Release mutex after token acquisition completes
      isRefreshing = false;
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
};

/**
 * Handle redirect promise on page load
 */
export const handleRedirectPromise = async (): Promise<AuthenticationResult | null> => {
  const msalInstance = getMsalInstance();

  try {
    const response = await msalInstance.handleRedirectPromise();

    if (response) {
      msalInstance.setActiveAccount(response.account);
    }

    return response;
  } catch (error) {
    secureLogger.error('Redirect promise handling error:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const account = getCurrentAccount();
  return account !== null;
};

/**
 * Parse user claims from account
 */
export const getUserFromAccount = (account: AccountInfo): User => {
  const idTokenClaims = account.idTokenClaims as Record<string, unknown>;

  // Extract roles from token claims
  const roles: UserRole[] = [];
  const roleClaims = idTokenClaims?.extension_Role || idTokenClaims?.roles;

  if (Array.isArray(roleClaims)) {
    roleClaims.forEach((role) => {
      if (Object.values(UserRole).includes(role as UserRole)) {
        roles.push(role as UserRole);
      }
    });
  } else if (typeof roleClaims === 'string' && Object.values(UserRole).includes(roleClaims as UserRole)) {
    roles.push(roleClaims as UserRole);
  }

  return {
    id: account.localAccountId,
    email: account.username,
    name: account.name || account.username,
    roles,
    tenantId: account.tenantId,
  };
};

/**
 * Get current user
 */
export const getCurrentUser = (): User | null => {
  const account = getCurrentAccount();

  if (!account) {
    return null;
  }

  return getUserFromAccount(account);
};

/**
 * Check if user has specific role
 */
export const hasRole = (role: UserRole): boolean => {
  const user = getCurrentUser();
  return user?.roles.includes(role) || false;
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (roles: UserRole[]): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
};
