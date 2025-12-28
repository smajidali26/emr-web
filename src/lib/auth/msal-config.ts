/**
 * MSAL Configuration
 * Microsoft Authentication Library configuration for Azure AD B2C
 */

import { Configuration, LogLevel } from '@azure/msal-browser';

// Environment variables
const tenantName = process.env.NEXT_PUBLIC_AZURE_AD_B2C_TENANT_NAME || '';
const clientId = process.env.NEXT_PUBLIC_AZURE_AD_B2C_CLIENT_ID || '';
const signInPolicy = process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNIN || 'B2C_1_signin';
const signUpPolicy = process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_SIGNUP || 'B2C_1_signup';
const resetPasswordPolicy = process.env.NEXT_PUBLIC_AZURE_AD_B2C_POLICY_RESET || 'B2C_1_password_reset';

// B2C Authorities
const authorityDomain = `${tenantName}.b2clogin.com`;
const signInAuthority = `https://${authorityDomain}/${tenantName}.onmicrosoft.com/${signInPolicy}`;
const signUpAuthority = `https://${authorityDomain}/${tenantName}.onmicrosoft.com/${signUpPolicy}`;
const resetPasswordAuthority = `https://${authorityDomain}/${tenantName}.onmicrosoft.com/${resetPasswordPolicy}`;

// Application configuration
const redirectUri = typeof window !== 'undefined' ? `${window.location.origin}/callback` : '';
const postLogoutRedirectUri = typeof window !== 'undefined' ? window.location.origin : '';

/**
 * MSAL Configuration object
 * See: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-browser/docs/configuration.md
 */
export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority: signInAuthority,
    knownAuthorities: [authorityDomain],
    redirectUri,
    postLogoutRedirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    // SECURITY FIX: Use sessionStorage instead of localStorage for better security
    // Tokens are cleared when browser tab/window is closed
    // Assigned: Andrew Wright (4h)
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false, // Set to true for IE11/Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          default:
            return;
        }
      },
      logLevel: process.env.NODE_ENV === 'production' ? LogLevel.Error : LogLevel.Info,
      piiLoggingEnabled: false,
    },
    allowNativeBroker: false,
  },
};

/**
 * Scopes for API access
 */
export const apiScopes = {
  read: [`https://${tenantName}.onmicrosoft.com/${clientId}/read`],
  write: [`https://${tenantName}.onmicrosoft.com/${clientId}/write`],
};

/**
 * Login request configuration
 */
export const loginRequest = {
  scopes: ['openid', 'profile', 'email', ...apiScopes.read],
};

/**
 * Token request configuration for silent token acquisition
 */
export const tokenRequest = {
  scopes: [...apiScopes.read],
  forceRefresh: false,
};

/**
 * Policy configurations
 */
export const b2cPolicies = {
  names: {
    signIn: signInPolicy,
    signUp: signUpPolicy,
    resetPassword: resetPasswordPolicy,
  },
  authorities: {
    signIn: signInAuthority,
    signUp: signUpAuthority,
    resetPassword: resetPasswordAuthority,
  },
};

/**
 * Check if MSAL is properly configured
 */
export const isMsalConfigured = (): boolean => {
  return !!(tenantName && clientId);
};
