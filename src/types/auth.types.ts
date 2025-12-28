/**
 * Authentication Type Definitions
 * Defines types for Azure AD B2C authentication and user management
 */

export interface User {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
  tenantId?: string;
  phoneNumber?: string;
  avatarUrl?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  NURSE = 'NURSE',
  RECEPTIONIST = 'RECEPTIONIST',
  PHARMACIST = 'PHARMACIST',
  LAB_TECHNICIAN = 'LAB_TECHNICIAN',
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresOn: Date;
}

export interface MsalConfig {
  tenantName: string;
  clientId: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  policies: {
    signIn: string;
    signUp: string;
    resetPassword: string;
  };
}
