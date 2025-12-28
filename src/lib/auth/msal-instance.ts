/**
 * MSAL Instance
 * Singleton PublicClientApplication instance for MSAL
 */

import { PublicClientApplication, EventType, EventMessage, AuthenticationResult } from '@azure/msal-browser';
import { msalConfig } from './msal-config';
import { secureLogger } from '@/lib/utils/security';

let msalInstance: PublicClientApplication | null = null;

/**
 * Initialize MSAL instance
 * This should be called once during app initialization
 */
export const initializeMsal = async (): Promise<PublicClientApplication> => {
  if (msalInstance) {
    return msalInstance;
  }

  msalInstance = new PublicClientApplication(msalConfig);

  // Initialize the instance
  await msalInstance.initialize();

  // Optional: Set up event callbacks
  // SECURITY FIX: Replace console.log with secureLogger to prevent auth detail leakage (Assigned: Matthew Green)
  msalInstance.addEventCallback((event: EventMessage) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      msalInstance?.setActiveAccount(account);
    }

    if (event.eventType === EventType.ACQUIRE_TOKEN_SUCCESS && event.payload) {
      // Token acquired successfully - use secure logger
      secureLogger.info('Token acquired successfully');
    }

    if (event.eventType === EventType.LOGIN_FAILURE) {
      // SECURITY: Do not log error details in production - may contain sensitive info
      secureLogger.error('Login failed', { eventType: event.eventType });
    }

    if (event.eventType === EventType.ACQUIRE_TOKEN_FAILURE) {
      // SECURITY: Do not log error details in production - may contain sensitive info
      secureLogger.error('Token acquisition failed', { eventType: event.eventType });
    }
  });

  return msalInstance;
};

/**
 * Get MSAL instance
 * Returns the singleton instance or throws error if not initialized
 */
export const getMsalInstance = (): PublicClientApplication => {
  if (!msalInstance) {
    throw new Error('MSAL instance not initialized. Call initializeMsal() first.');
  }
  return msalInstance;
};

/**
 * Check if MSAL is initialized
 */
export const isMsalInitialized = (): boolean => {
  return msalInstance !== null;
};
