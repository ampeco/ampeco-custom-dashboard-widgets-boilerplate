import type { NextConfig } from "next";

// A tenant on a local development stack (TENANT_URL_SCHEME=http) is not covered
// by the https entries below, so it is allowed to embed the widget explicitly
const httpTenantOrigin =
  process.env.TENANT_URL_SCHEME?.trim().toLowerCase() === "http" &&
  process.env.AMPECO_BASE_DOMAIN
    ? `http://${process.env.AMPECO_BASE_DOMAIN.replace(/^https?:\/\//, "").trim()}`
    : null;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // 'unsafe-eval' needed for some chart libraries
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.charge.ampeco.tech https://*.ampeco.tech",
              [
                "frame-ancestors 'self' https://*.charge.ampeco.tech https://*.ampeco.tech",
                httpTenantOrigin,
              ]
                .filter(Boolean)
                .join(" "),
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
