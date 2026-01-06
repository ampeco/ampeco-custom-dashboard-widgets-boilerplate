/**
 * Shared utilities for AMPECO hooks
 */

import { preserveToken } from "@/lib/utils/preserve-token";

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
