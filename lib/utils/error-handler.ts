/**
 * Error Handler Utilities
 *
 * Centralized error handling and user-friendly error messages
 */

import type { ApiError } from "@/lib/services/ampeco-api";

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES = {
  JWT_MISSING: "Authentication token is missing. Please ensure the widget is loaded from AMPECO backend.",
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
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError;
    return apiError.message || ERROR_MESSAGES.API_ERROR;
  }

  if (error instanceof Error) {
    // Check for specific error types
    if (error.message.includes("expired")) {
      return ERROR_MESSAGES.JWT_EXPIRED;
    }
    if (error.message.includes("signature") || error.message.includes("invalid")) {
      return ERROR_MESSAGES.JWT_INVALID;
    }
    if (error.message.includes("network") || error.message.includes("fetch")) {
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

