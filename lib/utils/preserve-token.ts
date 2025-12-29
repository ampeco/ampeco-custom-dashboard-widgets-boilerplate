/**
 * Utility to preserve token query parameter in URLs
 */

/**
 * Adds token parameter to a URL if it exists in the current URL
 * @param path Path to add token to
 * @param currentToken Token from current URL (optional)
 * @returns URL with token parameter if token exists
 */
export function preserveToken(
  path: string,
  currentToken?: string | null
): string {
  if (!currentToken) {
    return path;
  }

  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}token=${encodeURIComponent(currentToken)}`;
}

/**
 * Gets token from URL search params
 * @param searchParams URL search params
 * @returns Token string or null
 */
export function getTokenFromSearchParams(
  searchParams:
    | URLSearchParams
    | { [key: string]: string | string[] | undefined }
): string | null {
  if (searchParams instanceof URLSearchParams) {
    return searchParams.get("token");
  }

  const token = searchParams.token;
  if (typeof token === "string") {
    return token;
  }

  if (Array.isArray(token) && token.length > 0) {
    return token[0];
  }

  return null;
}
