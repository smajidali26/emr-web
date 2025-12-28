/**
 * Security Utilities
 * HIPAA-compliant security utilities for handling sensitive patient data
 */

// Re-export secureLogger for convenience
export { secureLogger } from './secure-logger';

/**
 * Mask SSN to show only last 4 digits
 * Example: "123-45-6789" -> "XXX-XX-6789"
 */
export const maskSSN = (ssn?: string): string => {
  if (!ssn) return '';

  // Remove all non-digit characters
  const digitsOnly = ssn.replace(/\D/g, '');

  if (digitsOnly.length !== 9) return 'XXX-XX-XXXX';

  const last4 = digitsOnly.slice(-4);
  return `XXX-XX-${last4}`;
};

/**
 * Get last 4 digits of SSN
 */
export const getSSNLast4 = (ssn?: string): string => {
  if (!ssn) return '';
  const digitsOnly = ssn.replace(/\D/g, '');
  return digitsOnly.slice(-4);
};

/**
 * Format SSN for display (masked)
 */
export const formatSSN = (ssn?: string, masked = true): string => {
  if (!ssn) return '';

  const digitsOnly = ssn.replace(/\D/g, '');

  if (digitsOnly.length !== 9) return ssn;

  if (masked) {
    return maskSSN(ssn);
  }

  // Format as XXX-XX-XXXX
  return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 5)}-${digitsOnly.slice(5)}`;
};

/**
 * Validate SSN format
 */
export const isValidSSN = (ssn: string): boolean => {
  const digitsOnly = ssn.replace(/\D/g, '');

  // Must be exactly 9 digits
  if (digitsOnly.length !== 9) return false;

  // Cannot be all zeros
  if (digitsOnly === '000000000') return false;

  // First three digits cannot be 000, 666, or 900-999
  const firstThree = parseInt(digitsOnly.slice(0, 3), 10);
  if (firstThree === 0 || firstThree === 666 || firstThree >= 900) return false;

  // Middle two digits cannot be 00
  const middleTwo = digitsOnly.slice(3, 5);
  if (middleTwo === '00') return false;

  // Last four digits cannot be 0000
  const lastFour = digitsOnly.slice(5);
  if (lastFour === '0000') return false;

  return true;
};

/**
 * Mask email address
 * Example: "john.doe@example.com" -> "j***@example.com"
 */
export const maskEmail = (email?: string): string => {
  if (!email) return '';

  const [localPart, domain] = email.split('@');
  if (!domain) return email;

  const maskedLocal = localPart.length > 1
    ? `${localPart[0]}***`
    : localPart;

  return `${maskedLocal}@${domain}`;
};

/**
 * Mask phone number to show only last 4 digits
 * Example: "(555) 123-4567" -> "XXX-XXX-4567"
 */
export const maskPhoneNumber = (phone?: string): string => {
  if (!phone) return '';

  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length !== 10) return 'XXX-XXX-XXXX';

  const last4 = digitsOnly.slice(-4);
  return `XXX-XXX-${last4}`;
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone?: string, masked = false): string => {
  if (!phone) return '';

  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length !== 10) return phone;

  if (masked) {
    return maskPhoneNumber(phone);
  }

  // Format as (XXX) XXX-XXXX
  return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
};

/**
 * Validate phone number format (US)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
};

/**
 * Redact sensitive data from object for logging
 * Returns a copy with sensitive fields redacted
 */
export const redactSensitiveData = <T extends Record<string, unknown>>(
  data: T,
  sensitiveFields: string[] = ['ssn', 'password', 'token', 'apiKey']
): T => {
  const redacted = { ...data };

  for (const key in redacted) {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
      redacted[key] = '[REDACTED]' as unknown as T[Extract<keyof T, string>];
    } else if (typeof redacted[key] === 'object' && redacted[key] !== null) {
      redacted[key] = redactSensitiveData(
        redacted[key] as Record<string, unknown>,
        sensitiveFields
      ) as T[Extract<keyof T, string>];
    }
  }

  return redacted;
};

/**
 * Generate audit trail entry for patient data access
 */
export interface AuditEntry {
  timestamp: Date;
  userId: string;
  action: 'view' | 'create' | 'update' | 'delete';
  resourceType: string;
  resourceId: string;
  details?: Record<string, unknown>;
}

export const createAuditEntry = (
  userId: string,
  action: AuditEntry['action'],
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
): AuditEntry => {
  return {
    timestamp: new Date(),
    userId,
    action,
    resourceType,
    resourceId,
    details: details ? redactSensitiveData(details) : undefined,
  };
};

/**
 * Send audit entry to backend API
 * SECURITY FIX: Connect audit logging to backend for HIPAA compliance
 * Assigned: Samantha Adams (12h)
 */
export const logAuditEntry = async (
  userId: string,
  action: AuditEntry['action'],
  resourceType: string,
  resourceId: string,
  details?: Record<string, unknown>
): Promise<void> => {
  try {
    const auditEntry = createAuditEntry(userId, action, resourceType, resourceId, details);

    // Import dynamically to avoid circular dependencies
    const { apiClient } = await import('@/lib/api/api-client');

    // Send to backend audit log endpoint
    await apiClient.post('/api/v1/audit', auditEntry, {
      withAuth: true,
      // Don't throw on failure - audit logging should not break user actions
      // but log error for monitoring
    });
  } catch (error) {
    // Log error but don't throw - audit logging failures should not block user operations
    console.error('Failed to log audit entry:', error);
    // In production, this would be sent to monitoring service
  }
};

/**
 * @deprecated DO NOT USE - Input-time HTML encoding corrupts data
 *
 * This function was incorrectly designed for input sanitization.
 * HTML encoding at input time causes:
 * - Data corruption: "O'Brien" becomes "O&#x27;Brien" in the database
 * - Double-encoding: If output is also encoded, you get "O&amp;#x27;Brien"
 * - Broken validation: Length checks fail, regex patterns don't match
 * - Search issues: Can't find "O'Brien" when searching for the name
 *
 * CORRECT XSS PREVENTION STRATEGY:
 * 1. Store raw user input (preserve data integrity)
 * 2. Validate input (reject if it contains truly invalid characters)
 * 3. Encode at OUTPUT time, appropriate to the context:
 *    - HTML: React JSX does this automatically
 *    - URLs: Use encodeURIComponent()
 *    - SQL: Use parameterized queries (never string concat)
 *    - JSON: JSON.stringify() handles encoding
 *
 * React automatically escapes text content in JSX, so XSS via text
 * is prevented by default. Only dangerouslySetInnerHTML bypasses this.
 *
 * @see https://react.dev/reference/react-dom/components/common#dangerously-setting-the-inner-html
 */
export const sanitizeInput = (input: string): string => {
  // DEPRECATED: Return input unchanged to prevent data corruption
  // This function is kept for backwards compatibility but does nothing
  // Use proper output encoding instead
  return input;
};

/**
 * Validate that input contains only safe characters for a given field type
 * Use this instead of sanitizeInput for input validation
 *
 * @param input - The input string to validate
 * @param fieldType - The type of field being validated
 * @returns true if input is valid, false otherwise
 */
export const isValidInput = (
  input: string,
  fieldType: 'name' | 'address' | 'general' = 'general'
): boolean => {
  if (!input) return true; // Empty is valid (use required validation separately)

  switch (fieldType) {
    case 'name':
      // Names: letters, spaces, hyphens, apostrophes, periods
      return /^[\p{L}\s\-'.]+$/u.test(input);
    case 'address':
      // Addresses: alphanumeric, spaces, common punctuation
      return /^[\p{L}\p{N}\s\-'.,#/]+$/u.test(input);
    case 'general':
    default:
      // General: block only script tags and event handlers
      const dangerous = /<script|javascript:|on\w+\s*=/i;
      return !dangerous.test(input);
  }
};

/**
 * Validate date of birth (must be in the past and reasonable)
 */
export const isValidDateOfBirth = (dob: Date): boolean => {
  const now = new Date();
  const age = now.getFullYear() - dob.getFullYear();

  // Must be in the past
  if (dob > now) return false;

  // Reasonable age range (0-150 years)
  if (age < 0 || age > 150) return false;

  return true;
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dob: Date): number => {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }

  return age;
};

/**
 * Check if user has permission to access patient data
 */
export interface PermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  reason?: string;
}

export const checkPatientDataPermission = (
  userRoles: string[],
  action: 'view' | 'edit' | 'delete'
): PermissionCheck => {
  const adminRoles = ['ADMIN', 'DOCTOR', 'NURSE'];
  const viewOnlyRoles = ['RECEPTIONIST', 'LAB_TECHNICIAN'];

  const canView = [...adminRoles, ...viewOnlyRoles].some(role =>
    userRoles.includes(role)
  );

  const canEdit = adminRoles.some(role => userRoles.includes(role));
  const canDelete = userRoles.includes('ADMIN');

  if (action === 'view' && !canView) {
    return { canView, canEdit, canDelete, reason: 'Insufficient permissions to view patient data' };
  }

  if (action === 'edit' && !canEdit) {
    return { canView, canEdit, canDelete, reason: 'Insufficient permissions to edit patient data' };
  }

  if (action === 'delete' && !canDelete) {
    return { canView, canEdit, canDelete, reason: 'Insufficient permissions to delete patient data' };
  }

  return { canView, canEdit, canDelete };
};
