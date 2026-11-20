/**
 * JWT Verifier for AMPECO Custom Widget Authentication
 *
 * Verifies JWT tokens issued by AMPECO backend using ES256 algorithm.
 * Supports JWKS (JSON Web Key Set) format for public key retrieval.
 */

import { jwtVerify, createRemoteJWKSet, JWTPayload } from "jose";
import { getAmpecoConfig } from "@/lib/config/ampeco";

/**
 * JWT Payload structure from AMPECO
 */
export interface AmpecoJwtPayload extends JWTPayload {
  iss: string; // Issuer (AMPECO tenant URL)
  aud: string | string[]; // Audience (widget origin)
  admin_id: number;
  app_id: number;
  widget_id: number;
  widget_name: string;
  impersonate: boolean;
  resource: string;
  resource_id?: string;
}

/**
 * How long the tenant's signing keys are reused before they are fetched again (1 hour)
 */
const JWKS_CACHE_MAX_AGE_MS = 60 * 60 * 1000;

type RemoteKeySet = ReturnType<typeof createRemoteJWKSet>;

/**
 * Key set reused across requests. jose fetches the keys on first use, keeps
 * them for JWKS_CACHE_MAX_AGE_MS and fetches again when a token is signed with
 * a key it does not know yet (key rotation).
 */
let cachedKeySet: { url: string; keySet: RemoteKeySet } | null = null;

/**
 * Gets the tenant's signing keys
 * @param publicKeyUrl JWKS endpoint URL
 * @returns Key set for jose's jwtVerify
 */
function getTenantKeySet(publicKeyUrl: string): RemoteKeySet {
  if (cachedKeySet?.url !== publicKeyUrl) {
    cachedKeySet = {
      url: publicKeyUrl,
      keySet: createRemoteJWKSet(new URL(publicKeyUrl), {
        cacheMaxAge: JWKS_CACHE_MAX_AGE_MS,
      }),
    };
  }

  return cachedKeySet.keySet;
}

/**
 * Verifies JWT token and extracts payload
 *
 * The audience is checked against WIDGET_ORIGIN when it is set. When it is not
 * set, the legacy check against legacyExpectedAudience is used, so deployments
 * made before WIDGET_ORIGIN existed keep working.
 * @param token JWT token string
 * @param legacyExpectedAudience Expected audience for the legacy check (ignored when WIDGET_ORIGIN is set)
 * @returns Decoded JWT payload
 * @throws Error if token is invalid, expired, or verification fails
 */
export async function verifyJwt(
  token: string,
  legacyExpectedAudience?: string
): Promise<AmpecoJwtPayload> {
  const config = getAmpecoConfig();
  const JWKS = getTenantKeySet(config.urls.publicKey);
  const expectedAudience = config.widgetOrigin
    ? undefined
    : legacyExpectedAudience;

  try {
    // Verify token. With WIDGET_ORIGIN set, jose rejects any other audience.
    const { payload } = await jwtVerify(token, JWKS, {
      algorithms: [config.jwt.algorithm],
      issuer: config.urls.tenant,
      ...(config.widgetOrigin && { audience: config.widgetOrigin }),
      clockTolerance: config.jwt.clockTolerance,
    });

    // Type assertion with validation
    const ampecoPayload = payload as AmpecoJwtPayload;

    // Validate required claims
    if (
      !ampecoPayload.admin_id ||
      !ampecoPayload.app_id ||
      !ampecoPayload.widget_id
    ) {
      throw new Error(
        "Missing required JWT claims (admin_id, app_id, widget_id)"
      );
    }

    // Validate issuer matches expected tenant
    if (ampecoPayload.iss !== config.urls.tenant) {
      throw new Error(
        `Invalid issuer: expected ${config.urls.tenant}, got ${ampecoPayload.iss}`
      );
    }

    // Legacy audience check, used only when WIDGET_ORIGIN is not set
    // Note: In development (localhost), it allows any audience
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
 * Supports both Authorization header and query parameter (?token=)
 * @param request Next.js request object
 * @returns JWT token string or null
 */
export function extractJwtToken(request: Request): string | null {
  // Try Authorization header first (used by the widget's own data requests)
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  // Try query parameter (query parameter delivery from AMPECO)
  const url = new URL(request.url);
  return url.searchParams.get("token") || null;
}
