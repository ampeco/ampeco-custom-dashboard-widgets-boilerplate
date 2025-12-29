/**
 * Security Utilities
 *
 * Additional security helpers for request validation,
 * rate limiting, and input sanitization.
 */

/**
 * Validates if a domain is an allowed AMPECO domain
 * @param domain Domain to validate
 * @returns True if domain is allowed
 */
export function isAllowedAmpecoDomain(domain: string): boolean {
  const allowedPatterns = [
    /^https?:\/\/.*\.charge\.ampeco\.tech$/,
    /^https?:\/\/.*\.ampeco\.tech$/,
  ];

  return allowedPatterns.some((pattern) => pattern.test(domain));
}

/**
 * Sanitizes string input to prevent XSS
 * @param input Input string
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .trim();
}

/**
 * Validates request origin
 * @param origin Request origin
 * @returns True if origin is valid
 */
export function validateOrigin(origin: string | null): boolean {
  if (!origin) {
    return false;
  }

  return isAllowedAmpecoDomain(origin);
}

/**
 * Rate limiting configuration
 * Note: For production, use a proper rate limiting service like Upstash
 */
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per window
};

