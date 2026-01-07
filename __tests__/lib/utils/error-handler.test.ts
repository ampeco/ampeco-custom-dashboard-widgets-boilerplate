/**
 * Tests for error handler utilities
 */

import {
  formatApiError,
  isNetworkError,
  isAuthError,
  ERROR_MESSAGES,
} from "@/lib/utils/error-handler";
import type { ApiError } from "@/lib/services/api";

describe("Error Handler", () => {
  describe("formatApiError", () => {
    it("should format API error with message", () => {
      const error: ApiError = {
        message: "API request failed",
        status: 500,
      };
      expect(formatApiError(error)).toBe("API request failed");
    });

    it("should handle expired JWT error", () => {
      const error = new Error("JWT token has expired");
      expect(formatApiError(error)).toBe(ERROR_MESSAGES.JWT_EXPIRED);
    });

    it("should handle invalid signature error", () => {
      const error = new Error("Invalid JWT signature");
      expect(formatApiError(error)).toBe(ERROR_MESSAGES.JWT_INVALID);
    });

    it("should handle network error", () => {
      const error = new Error("Network request failed");
      expect(formatApiError(error)).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it("should handle unknown error", () => {
      const error = new Error("Some other error");
      expect(formatApiError(error)).toBe("Some other error");
    });

    it("should handle non-Error objects", () => {
      expect(formatApiError("string error")).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
      expect(formatApiError(null)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });
  });

  describe("isNetworkError", () => {
    it("should detect network errors", () => {
      expect(isNetworkError(new Error("fetch failed"))).toBe(true);
      expect(isNetworkError(new Error("network error"))).toBe(true);
      expect(isNetworkError(new Error("ECONNREFUSED"))).toBe(true);
      expect(isNetworkError(new Error("other error"))).toBe(false);
    });
  });

  describe("isAuthError", () => {
    it("should detect authentication errors", () => {
      expect(isAuthError(new Error("JWT verification failed"))).toBe(true);
      expect(isAuthError(new Error("token expired"))).toBe(true);
      expect(isAuthError(new Error("unauthorized"))).toBe(true);
      expect(isAuthError(new Error("401"))).toBe(true);
      expect(isAuthError(new Error("other error"))).toBe(false);
    });
  });
});
