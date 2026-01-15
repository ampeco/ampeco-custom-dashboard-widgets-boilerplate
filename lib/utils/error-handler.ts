/**
 * Error Handler Utilities
 *
 * Centralized error handling and user-friendly error messages
 */

import type { ApiError } from "@/lib/services/api";

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  JWT_MISSING:
    "Authentication token is missing. Please ensure the widget is loaded from AMPECO backend.",
  JWT_EXPIRED: "Your session has expired. Please refresh the page.",
  JWT_INVALID: "Invalid authentication token. Please check your configuration.",
  API_ERROR: "Failed to fetch data from AMPECO API. Please try again later.",
  NETWORK_ERROR: "Network error. Please check your connection and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
};

/**
 * Formats API error into user-friendly message
 */
export function formatApiError(error: unknown): string {
  // Check for ApiError type (has status property)
  if (
    error &&
    typeof error === "object" &&
    "message" in error &&
    "status" in error
  ) {
    const apiError = error as ApiError;
    return apiError.message || ERROR_MESSAGES.API_ERROR;
  }

  // Check for Error instances and apply pattern matching
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    // Check for specific error types (case-insensitive)
    if (message.includes("expired")) {
      return ERROR_MESSAGES.JWT_EXPIRED;
    }
    if (message.includes("signature") || message.includes("invalid")) {
      return ERROR_MESSAGES.JWT_INVALID;
    }
    if (message.includes("network") || message.includes("fetch")) {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message;
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

/**
 * Checks if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("fetch") ||
      error.message.includes("network") ||
      error.message.includes("ECONNREFUSED")
    );
  }
  return false;
}

/**
 * Checks if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes("JWT") ||
      error.message.includes("token") ||
      error.message.includes("unauthorized") ||
      error.message.includes("401")
    );
  }
  return false;
}
