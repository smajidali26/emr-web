/**
 * API Client
 * HTTP client for making API requests with authentication
 * SECURITY FIX: Task #2658 - Added rate limit handling with exponential backoff
 */

import { getAccessToken } from '@/lib/auth';
import { ApiRequestConfig, ApiError } from '@/types';

/**
 * Rate limiting configuration
 * SECURITY: Server-side rate limits (must match server configuration):
 * - Global: 100 requests/minute per IP
 * - Auth endpoints: 10 requests/5 minutes
 * - Patient search: 30 requests/minute
 */
const RATE_LIMIT_CONFIG = {
  maxRetries: 3,
  baseDelayMs: 1000, // Start with 1 second
  maxDelayMs: 30000, // Maximum 30 seconds
  jitterFactor: 0.2, // Add 20% random jitter
};

// SECURITY FIX: Task #20 - Fix hardcoded config defaults (Kevin Murphy - 4h)
// SECURITY FIX: Task #22 - Validate API base URL (Kevin Murphy - 4h)
// Remove unsafe localhost fallback and validate URL configuration
const getApiBaseUrl = (): string => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  const isProduction = process.env.NODE_ENV === 'production';

  // SECURITY: In production, API URL must be explicitly configured
  if (!configuredUrl) {
    if (isProduction) {
      throw new Error(
        'SECURITY ERROR: NEXT_PUBLIC_API_URL environment variable is not configured. ' +
        'The API base URL must be explicitly set in production environments. ' +
        'This prevents accidental connections to localhost or insecure endpoints.'
      );
    }
    // Development fallback with warning
    console.warn(
      'SECURITY WARNING: NEXT_PUBLIC_API_URL not configured. Using localhost:5000 for development. ' +
      'This fallback will NOT work in production.'
    );
    return 'http://localhost:5000';
  }

  // SECURITY: Validate URL format
  try {
    const url = new URL(configuredUrl);

    // SECURITY: Enforce HTTPS in production
    if (isProduction && url.protocol !== 'https:') {
      throw new Error(
        `SECURITY ERROR: API URL must use HTTPS in production. Got: ${url.protocol}. ` +
        'Configure NEXT_PUBLIC_API_URL with an https:// URL.'
      );
    }

    // SECURITY: Prevent localhost and private network addresses in production
    // Check for all localhost variants (IPv4 and IPv6)
    const localhostVariants = ['localhost', '127.0.0.1', '::1', '[::1]', '0.0.0.0'];
    const isLocalhost = localhostVariants.includes(url.hostname) ||
      url.hostname.endsWith('.local') ||
      url.hostname.startsWith('127.');  // 127.0.0.0/8 loopback range

    // Check for private IPv4 ranges (RFC 1918)
    const privateIPv4Pattern = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;
    const isPrivateIPv4 = privateIPv4Pattern.test(url.hostname);

    // Check for private IPv6 ranges:
    // - fc00::/7 (Unique Local Addresses - ULA, includes fc and fd prefixes)
    // - fe80::/10 (Link-Local addresses)
    const privateIPv6Pattern = /^(fc|fd|fe80:)/i;
    const isPrivateIPv6 = privateIPv6Pattern.test(url.hostname);

    const isPrivateIP = isPrivateIPv4 || isPrivateIPv6;

    if (isProduction && (isLocalhost || isPrivateIP)) {
      throw new Error(
        'SECURITY ERROR: API URL cannot point to localhost or private network in production. ' +
        `Got: ${url.hostname}. Configure NEXT_PUBLIC_API_URL with the production API server URL.`
      );
    }

    return configuredUrl;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `SECURITY ERROR: Invalid API URL format: "${configuredUrl}". ` +
        'NEXT_PUBLIC_API_URL must be a valid URL (e.g., https://api.example.com).'
      );
    }
    throw error;
  }
};

// SECURITY FIX: Lazy initialization to allow graceful error handling
// Previously, getApiBaseUrl() ran at module load, crashing before error pages could render
let cachedApiBaseUrl: string | null = null;

const getApiBaseUrlLazy = (): string => {
  if (cachedApiBaseUrl === null) {
    cachedApiBaseUrl = getApiBaseUrl();
  }
  return cachedApiBaseUrl;
};

const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Calculate delay for exponential backoff with jitter
 * SECURITY FIX: Task #2658 - Proper rate limit retry handling
 */
const calculateBackoffDelay = (attempt: number, retryAfterSeconds?: number): number => {
  // If server provided Retry-After header, use it
  if (retryAfterSeconds !== undefined && retryAfterSeconds > 0) {
    // Add small jitter to prevent thundering herd
    const jitter = Math.random() * RATE_LIMIT_CONFIG.jitterFactor * retryAfterSeconds * 1000;
    return Math.min(retryAfterSeconds * 1000 + jitter, RATE_LIMIT_CONFIG.maxDelayMs);
  }

  // Exponential backoff: 1s, 2s, 4s, 8s, etc.
  const exponentialDelay = RATE_LIMIT_CONFIG.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.random() * RATE_LIMIT_CONFIG.jitterFactor * exponentialDelay;
  return Math.min(exponentialDelay + jitter, RATE_LIMIT_CONFIG.maxDelayMs);
};

/**
 * Parse Retry-After header value (can be seconds or HTTP date)
 */
const parseRetryAfter = (retryAfter: string | null): number | undefined => {
  if (!retryAfter) return undefined;

  // Try parsing as number of seconds
  const seconds = parseInt(retryAfter, 10);
  if (!isNaN(seconds)) {
    return seconds;
  }

  // Try parsing as HTTP date
  const date = new Date(retryAfter);
  if (!isNaN(date.getTime())) {
    const delayMs = date.getTime() - Date.now();
    return delayMs > 0 ? Math.ceil(delayMs / 1000) : 0;
  }

  return undefined;
};

/**
 * Sleep helper for async delay
 */
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * API Client class for making HTTP requests
 */
class ApiClient {
  private baseUrl: string | null;
  private defaultTimeout: number;

  constructor(baseUrl?: string, timeout: number = DEFAULT_TIMEOUT) {
    // Store explicit baseUrl or null for lazy initialization
    this.baseUrl = baseUrl ?? null;
    this.defaultTimeout = timeout;
  }

  /**
   * Get the base URL, using lazy initialization if not explicitly set
   */
  private getBaseUrl(): string {
    if (this.baseUrl === null) {
      this.baseUrl = getApiBaseUrlLazy();
    }
    return this.baseUrl;
  }

  /**
   * Get CSRF token from meta tag or cookie
   */
  private getCsrfToken(): string | null {
    // Try to get from meta tag first
    const metaTag = document.querySelector('meta[name="csrf-token"]');
    if (metaTag) {
      return metaTag.getAttribute('content');
    }

    // Fallback to cookie
    const cookieMatch = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    return cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
  }

  /**
   * Build request headers
   */
  private async buildHeaders(config?: ApiRequestConfig, method?: string): Promise<Headers> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...config?.headers,
    });

    // Add authentication token if required
    if (config?.withAuth !== false) {
      try {
        const token = await getAccessToken();
        headers.set('Authorization', `Bearer ${token}`);
      } catch (error) {
        console.warn('Failed to get access token:', error);
        // Continue without token for public endpoints
      }
    }

    // Add CSRF token for state-changing requests
    // SECURITY FIX: Enforce CSRF token for state-changing operations (Assigned: Joshua Allen)
    if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      const csrfToken = this.getCsrfToken();
      if (csrfToken) {
        headers.set('X-CSRF-Token', csrfToken);
      } else {
        // SECURITY FIX: Reject state-changing requests without CSRF token in production
        const isProduction = process.env.NODE_ENV === 'production';
        if (isProduction) {
          // Throw proper ApiError object for consistent error handling
          const error: ApiError = {
            code: 'CSRF_TOKEN_MISSING',
            message: 'CSRF token is required for this operation. Please refresh the page and try again.',
            statusCode: 403,
          };
          throw error;
        } else {
          // In development, log warning but allow request
          console.warn(
            `SECURITY WARNING: CSRF token missing for ${method} request. ` +
            `This request would be BLOCKED in production. ` +
            `Ensure CSRF token is set via meta tag or XSRF-TOKEN cookie.`
          );
        }
      }
    }

    return headers;
  }

  /**
   * Build request URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.getBaseUrl()}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: unknown;
    if (isJson) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const error: ApiError = {
        code: `HTTP_${response.status}`,
        message: response.statusText,
        statusCode: response.status,
      };

      if (isJson && typeof data === 'object' && data !== null) {
        const errorData = data as Record<string, unknown>;
        error.message = (errorData.message as string) || error.message;
        error.code = (errorData.code as string) || error.code;
        error.details = errorData.details as Record<string, unknown>;
      }

      throw error;
    }

    return data as T;
  }

  /**
   * Make HTTP request with timeout and rate limit handling
   * SECURITY FIX: Task #2658 - Added automatic retry for 429 responses
   */
  private async request<T>(
    method: string,
    endpoint: string,
    config?: ApiRequestConfig,
    body?: unknown
  ): Promise<T> {
    const timeout = config?.timeout || this.defaultTimeout;
    const url = this.buildUrl(endpoint, config?.params);
    const maxRetries = config?.skipRateLimitRetry ? 0 : RATE_LIMIT_CONFIG.maxRetries;

    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      const headers = await this.buildHeaders(config, method);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const response = await fetch(url, {
          method,
          headers,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        // Handle rate limiting (429 Too Many Requests)
        if (response.status === 429) {
          const retryAfter = parseRetryAfter(response.headers.get('Retry-After'));
          const delay = calculateBackoffDelay(attempt, retryAfter);

          // Log rate limit hit for monitoring
          console.warn(
            `Rate limit hit on ${method} ${endpoint}. ` +
            `Attempt ${attempt + 1}/${maxRetries + 1}. ` +
            `Retrying in ${Math.round(delay / 1000)}s...`
          );

          // Store error in case we exhaust retries
          lastError = {
            code: 'RATE_LIMITED',
            message: 'Too many requests. Please wait and try again.',
            statusCode: 429,
            details: {
              retryAfterSeconds: retryAfter,
              endpoint,
              method,
            },
          };

          // If we have retries left, wait and retry
          if (attempt < maxRetries) {
            clearTimeout(timeoutId);
            await sleep(delay);
            continue;
          }

          // No more retries, throw the error
          throw lastError;
        }

        return await this.handleResponse<T>(response);
      } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
          throw {
            code: 'TIMEOUT',
            message: 'Request timeout',
            statusCode: 408,
          } as ApiError;
        }

        // If it's our rate limit error and we have retries left, it's already handled
        if ((error as ApiError)?.code === 'RATE_LIMITED' && attempt < maxRetries) {
          continue;
        }

        throw error;
      } finally {
        clearTimeout(timeoutId);
      }
    }

    // Should not reach here, but just in case
    throw lastError || { code: 'UNKNOWN', message: 'Request failed', statusCode: 500 };
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, config);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, config, data);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, config, data);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, config, data);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;
