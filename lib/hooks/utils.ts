/**
 * Shared utilities for AMPECO hooks
 */

import { getWidgetToken } from "@/lib/auth/token-store";
import { preserveToken } from "@/lib/utils/preserve-token";
import { ApiRequestError, toFieldErrors } from "@/lib/utils/api-error";
import { ERROR_MESSAGES } from "@/lib/utils/error-handler";

/**
 * Builds the Authorization header for requests to the widget's own /api routes
 * @returns Headers with the JWT token, or empty object if there is no token
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getWidgetToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Extracts JWT token from current page URL
 * @returns JWT token string or null
 */
export function getTokenFromUrl(): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("token");
}

/**
 * Appends token to a URL if present in the current page URL
 * @param url Base URL to append token to
 * @returns URL with token parameter if token exists
 */
export function appendTokenToUrl(url: string): string {
  const token = getTokenFromUrl();
  return preserveToken(url, token);
}

/**
 * Throws what the widget's own `/api` proxy said went wrong
 *
 * The proxy answers `{ "error": "<message>" }`, and adds `errors` for field
 * validation errors. Reading that body is what lets a page show the real
 * reason instead of the HTTP status text, which is empty over HTTP/2 and left
 * pages showing a sentence that stopped after the colon.
 *
 * @param response The answer from the widget's own /api route
 * @param fallbackMessage Shown when the answer carries no message of its own
 */
export async function throwIfNotOk(
  response: Response,
  fallbackMessage: string
): Promise<void> {
  if (response.ok) {
    return;
  }

  let message = "";
  let errors: Record<string, string[]> | undefined;

  try {
    const body: unknown = await response.json();
    if (typeof body === "object" && body !== null) {
      const { error, errors: fieldErrors } = body as Record<string, unknown>;
      if (typeof error === "string" && error) {
        message = error;
      }
      errors = toFieldErrors(fieldErrors);
    }
  } catch {
    // An answer without a JSON body leaves the fallback message in place.
  }

  // An expired token is the common failure and the message has to say what to
  // do about it, so it is not left to whatever the proxy happened to pass on.
  if (response.status === 401) {
    message = ERROR_MESSAGES.API_UNAUTHORIZED;
  }

  throw new ApiRequestError(message || fallbackMessage, response.status, errors);
}
