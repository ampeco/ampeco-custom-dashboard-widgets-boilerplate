/**
 * AMPECO Configuration Helper
 *
 * Provides configuration utilities for AMPECO API integration,
 * including URL construction and JWT settings.
 */

interface AmpecoConfig {
  baseDomain: string;
  apiToken: string;
  /** Widget's own public origin (from WIDGET_ORIGIN), or null when not set */
  widgetOrigin: string | null;
  urls: {
    publicKey: string;
    apiBase: string;
    tenant: string;
  };
  jwt: {
    algorithm: "ES256";
    clockTolerance: number;
  };
}

/**
 * Validates required environment variables
 */
function validateEnv(): void {
  const required = ["AMPECO_BASE_DOMAIN", "AMPECO_API_TOKEN"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
}

/**
 * Normalizes domain by removing protocol if present
 * @param domain Domain string (with or without protocol)
 * @returns Domain without protocol
 */
function normalizeDomain(domain: string): string {
  // Remove https:// or http:// if present
  return domain.replace(/^https?:\/\//, "").trim();
}

/**
 * Gets the widget's own public origin from WIDGET_ORIGIN
 *
 * The value is reduced to its origin (scheme, host and port), which is what
 * AMPECO puts in the JWT audience claim. When it is set, the audience check is
 * strict. When it is not set, the legacy check is used (see verifyJwt).
 * @returns Origin string, or null when WIDGET_ORIGIN is not set
 * @throws Error if WIDGET_ORIGIN is set but is not a valid http(s) URL
 */
export function getWidgetOrigin(): string | null {
  const raw = process.env.WIDGET_ORIGIN?.trim();
  if (!raw) {
    return null;
  }

  try {
    const url = new URL(raw);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return url.origin;
    }
  } catch {
    // Handled below
  }

  throw new Error(
    "Invalid WIDGET_ORIGIN: expected a URL such as https://widgets.example.com"
  );
}

/**
 * Gets the scheme of the AMPECO tenant URL from TENANT_URL_SCHEME
 *
 * Defaults to https. http is only for a tenant on a local development stack:
 * over http the tenant's signing keys and the API token travel unencrypted.
 * @returns "https" or "http"
 * @throws Error if TENANT_URL_SCHEME is set to anything else
 */
export function getTenantUrlScheme(): "https" | "http" {
  const raw = process.env.TENANT_URL_SCHEME?.trim().toLowerCase();
  if (!raw || raw === "https") {
    return "https";
  }
  if (raw === "http") {
    return "http";
  }

  throw new Error('Invalid TENANT_URL_SCHEME: expected "https" or "http"');
}

/**
 * Gets AMPECO configuration from environment variables
 * @returns AmpecoConfig object with URLs and settings
 */
export function getAmpecoConfig(): AmpecoConfig {
  validateEnv();

  const rawDomain = process.env.AMPECO_BASE_DOMAIN!;
  const baseDomain = normalizeDomain(rawDomain);
  const apiToken = process.env.AMPECO_API_TOKEN!;
  const tenant = `${getTenantUrlScheme()}://${baseDomain}`;

  return {
    baseDomain,
    apiToken,
    widgetOrigin: getWidgetOrigin(),
    urls: {
      publicKey: `${tenant}/.well-known/jwks.json`,
      apiBase: `${tenant}/public-api/resources`,
      tenant,
    },
    jwt: {
      algorithm: "ES256",
      clockTolerance: 30, // seconds
    },
  };
}

/**
 * Gets the AMPECO base domain
 */
export function getAmpecoBaseDomain(): string {
  return process.env.AMPECO_BASE_DOMAIN || "";
}

/**
 * Gets the AMPECO tenant origin (e.g. https://demo.charge.ampeco.tech)
 * @returns Tenant origin, or empty string if AMPECO_BASE_DOMAIN is not set
 */
export function getAmpecoTenantOrigin(): string {
  const baseDomain = normalizeDomain(getAmpecoBaseDomain());
  return baseDomain ? `${getTenantUrlScheme()}://${baseDomain}` : "";
}

/**
 * Gets the AMPECO API token
 */
export function getAmpecoApiToken(): string {
  return process.env.AMPECO_API_TOKEN || "";
}
