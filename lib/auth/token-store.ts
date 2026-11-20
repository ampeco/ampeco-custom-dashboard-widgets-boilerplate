/**
 * Widget token store (browser)
 *
 * Holds the JWT token the widget received from AMPECO, in memory only.
 * The token comes from the ?token= query parameter of the page, or from a
 * postMessage sent by the AMPECO parent frame (see WidgetTokenProvider).
 */

let token: string | null = null;
let urlChecked = false;
const listeners = new Set<() => void>();

/**
 * Gets the current widget token
 * @returns JWT token string, or null if none was received yet (always null on the server)
 */
export function getWidgetToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  // Query parameter delivery: read the token from the page URL once
  if (!urlChecked) {
    urlChecked = true;
    token = new URLSearchParams(window.location.search).get("token") || null;
  }

  return token;
}

/**
 * Stores a widget token received by postMessage
 * @param value JWT token string
 */
export function setWidgetToken(value: string): void {
  urlChecked = true;
  if (token === value) {
    return;
  }

  token = value;
  listeners.forEach((listener) => listener());
}

/**
 * Subscribes to token changes
 * @param listener Called when the token changes
 * @returns Cleanup function
 */
export function subscribeToWidgetToken(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Clears the store (for tests)
 */
export function resetWidgetToken(): void {
  token = null;
  urlChecked = false;
}
