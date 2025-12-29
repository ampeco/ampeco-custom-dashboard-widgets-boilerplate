/**
 * JWT Verifier for AMPECO Custom Widget Authentication
 *
 * Verifies JWT tokens issued by AMPECO backend using ES256 algorithm.
 * Supports JWKS (JSON Web Key Set) format for public key retrieval.
 */

import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";
import NodeCache from "node-cache";
import { getAmpecoConfig } from "@/lib/config/ampeco";

/**
 * JWT Payload structure from AMPECO
 */
export interface AmpecoJwtPayload extends JWTPayload {
  iss: string; // Issuer (AMPECO tenant URL)
  aud: string | string[]; // Audience (widget domain)
  user_id: number;
  app_id: number;
  widget_id: number;
  widget_name: string;
  impersonate: boolean;
  resource: string;
  resource_id?: string;
}

/**
 * Cache for public keys (1 hour TTL)
 */
const publicKeyCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

/**
 * Fetches public key from AMPECO API
 * @param publicKeyUrl URL to fetch public key from
 * @returns JWKS endpoint URL for jose library
 */
async function getPublicKeyUrl(
  publicKeyUrl: string,
  apiToken: string
): Promise<string> {
  // Check cache first
  const cached = publicKeyCache.get<string>(publicKeyUrl);
  if (cached) {
    console.log("cached", cached);
    return cached;
  }

  // Fetch from API
  try {
    const response = await fetch(publicKeyUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch public key: ${response.status} ${response.statusText}`
      );
    }

    const jwks = await response.json();

    // Validate JWKS format
    if (!jwks.keys || !Array.isArray(jwks.keys)) {
      throw new Error("Invalid JWKS format: missing keys array");
    }

    // Define a type for JWK to avoid 'any'
    type JWK = { kid?: string; alg?: string };

    // Find key with kid="1" and alg="ES256"
    const key = jwks.keys.find((k: JWK) => k.kid === "1" && k.alg === "ES256");

    if (!key) {
      throw new Error("No matching key found in JWKS (kid=1, alg=ES256)");
    }

    // Cache the URL (jose library will handle caching internally)
    publicKeyCache.set(publicKeyUrl, publicKeyUrl);

    return publicKeyUrl;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Public key fetch failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Verifies JWT token and extracts payload
 * @param token JWT token string
 * @param expectedAudience Expected audience (widget domain)
 * @returns Decoded JWT payload
 * @throws Error if token is invalid, expired, or verification fails
 */
export async function verifyJwt(
  token: string,
  expectedAudience?: string
): Promise<AmpecoJwtPayload> {
  const config = getAmpecoConfig();
  const publicKeyUrl = await getPublicKeyUrl(
    config.urls.publicKey,
    config.apiToken
  );

  // Create remote JWK set (jose handles caching)
  const JWKS = createRemoteJWKSet(new URL(publicKeyUrl));

  try {
    // Verify token - don't validate audience in jwtVerify, we'll do it manually
    // This allows us to see the actual audience value even if it doesn't match
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: [config.jwt.algorithm],
      issuer: config.urls.tenant,
      // Don't pass audience here - validate manually after to get better error messages
      clockTolerance: config.jwt.clockTolerance,
    });

    // Type assertion with validation
    const ampecoPayload = payload as AmpecoJwtPayload;

    // Validate required claims
    if (
      !ampecoPayload.user_id ||
      !ampecoPayload.app_id ||
      !ampecoPayload.widget_id
    ) {
      throw new Error(
        "Missing required JWT claims (user_id, app_id, widget_id)"
      );
    }

    // Validate issuer matches expected tenant
    if (ampecoPayload.iss !== config.urls.tenant) {
      throw new Error(
        `Invalid issuer: expected ${config.urls.tenant}, got ${ampecoPayload.iss}`
      );
    }

    // Validate audience if provided
    // Note: In development (localhost), we allow any audience to support local testing
    // In production, audience must match exactly
    if (expectedAudience) {
      const audiences = Array.isArray(ampecoPayload.aud)
        ? ampecoPayload.aud
        : [ampecoPayload.aud];

      // Allow localhost/127.0.0.1 in development to bypass strict audience validation
      const isLocalhost =
        expectedAudience.includes("localhost") ||
        expectedAudience.includes("127.0.0.1") ||
        process.env.NODE_ENV === "development";

      // In production, require exact match. In development/localhost, allow any valid audience
      if (!audiences.includes(expectedAudience) && !isLocalhost) {
        throw new Error(
          `Invalid audience: expected ${expectedAudience}, got ${JSON.stringify(
            ampecoPayload.aud
          )}`
        );
      }
    }

    return ampecoPayload;
  } catch (error) {
    if (error instanceof Error) {
      // Provide user-friendly error messages
      if (error.message.includes("expired")) {
        throw new Error("JWT token has expired. Please refresh the page.");
      }
      if (error.message.includes("signature")) {
        throw new Error("Invalid JWT signature. Please check configuration.");
      }
      throw new Error(`JWT verification failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Extracts JWT token from request
 * Supports both query parameter (?token=) and Authorization header
 * @param request Next.js request object
 * @returns JWT token string or null
 */
export function extractJwtToken(request: Request): string | null {
  // Try query parameter first (primary method for iframe embedding)
  const url = new URL(request.url);
  const tokenFromQuery = url.searchParams.get("token");

  if (tokenFromQuery) {
    return tokenFromQuery;
  }

  // Try Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return null;
}
