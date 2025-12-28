/**
 * Secure Logger Utility
 * Sanitizes sensitive data before logging in production environments
 */

/**
 * Sensitive field patterns to redact
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /apikey/i,
  /api_key/i,
  /secret/i,
  /authorization/i,
  /bearer/i,
  /ssn/i,
  /social_security/i,
  /credit_card/i,
  /card_number/i,
  /cvv/i,
  /pin/i,
  /medical_record/i,
  /diagnosis/i,
  /prescription/i,
  /health_condition/i,
  /patient_data/i,
];

/**
 * Check if a key contains sensitive information
 */
function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
}

/**
 * Sanitize an object by redacting sensitive fields
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Sanitize error messages
 */
function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // In production, only return generic error message
    if (process.env.NODE_ENV === 'production') {
      return 'An error occurred. Please contact support if the issue persists.';
    }
    // In development, return the actual error message but sanitized
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
}

/**
 * Secure logger interface
 */
interface SecureLogger {
  error: (message: string, ...args: unknown[]) => void;
  warn: (message: string, ...args: unknown[]) => void;
  info: (message: string, ...args: unknown[]) => void;
  debug: (message: string, ...args: unknown[]) => void;
}

/**
 * Create secure logger that sanitizes sensitive data
 */
export const secureLogger: SecureLogger = {
  error: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'production') {
      // In production, sanitize all arguments and only log to external service
      const sanitizedArgs = args.map(arg => {
        if (arg instanceof Error) {
          return sanitizeError(arg);
        }
        return sanitizeObject(arg);
      });

      // In production, you would send to a logging service instead
      // For now, we'll use console.error with sanitized data
      console.error(`[SECURE] ${message}`, ...sanitizedArgs);
    } else {
      // In development, log normally for debugging
      console.error(message, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'production') {
      const sanitizedArgs = args.map(arg => sanitizeObject(arg));
      console.warn(`[SECURE] ${message}`, ...sanitizedArgs);
    } else {
      console.warn(message, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (process.env.NODE_ENV === 'production') {
      const sanitizedArgs = args.map(arg => sanitizeObject(arg));
      console.info(`[SECURE] ${message}`, ...sanitizedArgs);
    } else {
      console.info(message, ...args);
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    // Only log debug in development
    if (process.env.NODE_ENV !== 'production') {
      console.debug(message, ...args);
    }
  },
};

/**
 * Export sanitization utilities for testing or custom use
 */
export { sanitizeObject, sanitizeError, isSensitiveKey };
