/**
 * Next.js Middleware for JWT Authentication
 *
 * Validates JWT tokens from AMPECO backend and stores
 * user context in request headers for use in Server Components.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt, extractJwtToken } from "@/lib/auth/jwt-verifier";

/**
 * Request headers that carry the validated JWT context to Server Components.
 * Only this middleware may set them.
 */
const JWT_CONTEXT_HEADERS = [
  "x-ampeco-admin-id",
  "x-ampeco-app-id",
  "x-ampeco-widget-id",
  "x-ampeco-impersonate",
  "x-ampeco-jwt-token",
  "x-ampeco-tenant-url",
];

/**
 * Middleware to validate JWT tokens
 *
 * A request that carries a token (Authorization header or ?token=) is always
 * validated. A request without a token is rejected on /api routes. A page
 * without a token is served without JWT context: with postMessage delivery the
 * page receives the token in the browser after it has loaded, so the page
 * itself holds no data.
 *
 * Excludes:
 * - /api/health (health check endpoint)
 * - Static files
 * - Next.js internal routes
 */
export async function middleware(request: NextRequest) {
  // Skip health check endpoint
  if (request.nextUrl.pathname === "/api/health") {
    return NextResponse.next();
  }

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  // Skip static files and Next.js internals (never an API route, whatever its extension)
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    (!isApiRoute &&
      request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/))
  ) {
    return NextResponse.next();
  }

  // Extract JWT token
  const token = extractJwtToken(request);

  if (!token && !isApiRoute) {
    // Page without a token (postMessage delivery). Remove JWT context headers
    // sent by the caller so that Server Components cannot be given a forged context.
    const requestHeaders = new Headers(request.headers);
    JWT_CONTEXT_HEADERS.forEach((header) => requestHeaders.delete(header));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (!token) {
    return NextResponse.json(
      {
        error: "Missing JWT token",
        message:
          "JWT token is required. Please ensure the widget is loaded from AMPECO backend.",
      },
      { status: 401 }
    );
  }

  try {
    // Expected audience for the legacy check, used only when WIDGET_ORIGIN is not set
    const legacyExpectedAudience =
      request.headers.get("origin") || request.nextUrl.origin;

    // Verify JWT token
    const payload = await verifyJwt(token, legacyExpectedAudience);

    // Store JWT payload in request headers for Server Components
    // Note: Headers are immutable in Next.js, so we use a custom header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-ampeco-admin-id", payload.admin_id.toString());
    requestHeaders.set("x-ampeco-app-id", payload.app_id.toString());
    requestHeaders.set("x-ampeco-widget-id", payload.widget_id.toString());
    requestHeaders.set("x-ampeco-impersonate", payload.impersonate.toString());
    requestHeaders.set("x-ampeco-jwt-token", token); // Store token for API calls
    requestHeaders.set("x-ampeco-tenant-url", payload.iss);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("JWT verification failed:", error);

    return NextResponse.json(
      {
        error: "JWT verification failed",
        message:
          error instanceof Error
            ? error.message
            : "Invalid or expired JWT token. Please refresh the page.",
      },
      { status: 401 }
    );
  }
}

/**
 * Middleware matcher - only run on specific routes
 * Exclude API routes except those that need auth
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/health (health check)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api/health|_next/static|_next/image|favicon.ico).*)",
  ],
};
