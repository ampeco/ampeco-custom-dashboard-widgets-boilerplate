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
 * Middleware to validate JWT tokens
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

  // Skip static files and Next.js internals
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico") ||
    request.nextUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Extract JWT token
  const token = extractJwtToken(request);

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
    // Get expected audience from request origin
    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const expectedAudience = origin;

    // Verify JWT token
    const payload = await verifyJwt(token, expectedAudience);

    // Store JWT payload in request headers for Server Components
    // Note: Headers are immutable in Next.js, so we use a custom header
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-ampeco-user-id", payload.user_id.toString());
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
