/**
 * AMPECO Configuration Helper
 *
 * Provides configuration utilities for AMPECO API integration,
 * including URL construction and JWT settings.
 */

interface AmpecoConfig {
  baseDomain: string;
  apiToken: string;
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
 * Gets AMPECO configuration from environment variables
 * @returns AmpecoConfig object with URLs and settings
 */
export function getAmpecoConfig(): AmpecoConfig {
  validateEnv();

  const rawDomain = process.env.AMPECO_BASE_DOMAIN!;
  const baseDomain = normalizeDomain(rawDomain);
  const apiToken = process.env.AMPECO_API_TOKEN!;

  return {
    baseDomain,
    apiToken,
    urls: {
      publicKey: `https://${baseDomain}/api/v1/marketplace/public-key`,
      apiBase: `https://${baseDomain}/public-api/resources`,
      tenant: `https://${baseDomain}`,
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
 * Gets the AMPECO API token
 */
export function getAmpecoApiToken(): string {
  return process.env.AMPECO_API_TOKEN || "";
}
