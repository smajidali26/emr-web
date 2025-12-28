/**
 * Application Constants
 * Centralized constants used throughout the application
 */

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
  },
  PATIENTS: {
    BASE: '/patients',
    DETAIL: (id: string) => `/patients/${id}`,
    DEMOGRAPHICS: (id: string) => `/patients/${id}/demographics`,
    SEARCH: '/patients/search',
  },
  APPOINTMENTS: {
    BASE: '/appointments',
    DETAIL: (id: string) => `/appointments/${id}`,
    SCHEDULE: '/appointments/schedule',
  },
  ENCOUNTERS: {
    BASE: '/encounters',
    DETAIL: (id: string) => `/encounters/${id}`,
  },
  ORDERS: {
    BASE: '/orders',
    DETAIL: (id: string) => `/orders/${id}`,
  },
} as const;

/**
 * Date formats
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_LONG: 'MMMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  INPUT: 'yyyy-MM-dd',
  TIME: 'h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

/**
 * Pagination defaults
 */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

/**
 * File upload constraints
 */
export const FILE_UPLOAD = {
  MAX_SIZE_MB: 10,
  ALLOWED_IMAGE_TYPES: ['jpg', 'jpeg', 'png', 'gif'],
  ALLOWED_DOCUMENT_TYPES: ['pdf', 'doc', 'docx', 'txt'],
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'emr_auth_token',
  REFRESH_TOKEN: 'emr_refresh_token',
  USER_PREFERENCES: 'emr_user_preferences',
  THEME: 'emr_theme',
} as const;

/**
 * Debounce delays (in milliseconds)
 */
export const DEBOUNCE_DELAYS = {
  SEARCH: 300,
  INPUT: 500,
  RESIZE: 150,
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Regex patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\(\)]+$/,
  POSTAL_CODE: /^\d{5}(-\d{4})?$/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;
