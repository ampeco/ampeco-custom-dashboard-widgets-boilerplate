/**
 * Helper to extract JWT context from Next.js request headers
 *
 * Used in Server Components and Server Actions to access
 * JWT payload information without re-verifying the token.
 */

import { headers } from "next/headers";

/**
 * JWT Context extracted from request headers
 */
export interface JwtContext {
  adminId: number;
  appId: number;
  widgetId: number;
  impersonate: boolean;
  jwtToken: string;
  tenantUrl: string;
}

/**
 * Gets JWT context from request headers
 * @returns JWT context or null if not available
 */
export async function getJwtContext(): Promise<JwtContext | null> {
  const headersList = await headers();

  const adminId = headersList.get("x-ampeco-admin-id");
  const appId = headersList.get("x-ampeco-app-id");
  const widgetId = headersList.get("x-ampeco-widget-id");
  const impersonate = headersList.get("x-ampeco-impersonate");
  const jwtToken = headersList.get("x-ampeco-jwt-token");
  const tenantUrl = headersList.get("x-ampeco-tenant-url");

  if (!adminId || !appId || !widgetId || !jwtToken) {
    return null;
  }

  return {
    adminId: parseInt(adminId, 10),
    appId: parseInt(appId, 10),
    widgetId: parseInt(widgetId, 10),
    impersonate: impersonate === "true",
    jwtToken,
    tenantUrl: tenantUrl || "",
  };
}

/**
 * Gets JWT token for API impersonation
 * @returns JWT token string or null
 */
export async function getJwtToken(): Promise<string | null> {
  const context = await getJwtContext();
  return context?.jwtToken || null;
}
