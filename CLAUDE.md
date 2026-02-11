# CLAUDE.md - AI Agent Context

This file provides context for AI development agents (Claude Code, GitHub Copilot, etc.) working on the AMPECO Custom Widget Template project.

For detailed examples, data fetching patterns, layout patterns, API reference, and troubleshooting, read [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md).

## Project Overview

This is a **Next.js 16 template** for building custom widgets that embed in AMPECO's Laravel Nova backend via iframe. The template demonstrates:

- JWT-based authentication with ES256 algorithm
- API impersonation for automatic data filtering
- Five example implementations (dashboard, listings, form, edit-charge-point, widget)
- Security best practices (CSP, CORS, rate limiting)
- TypeScript for type safety

**Key Technologies:**

- Next.js 16 (App Router)
- TypeScript
- React Server Components
- TanStack Query (React Query) - Data fetching and caching
- React Hook Form with Zod validation
- Tailwind CSS
- AMPECO Nova Design System
- date-fns for date formatting

## Authentication Flow

### JWT Token Flow

1. **Token Reception**: JWT token arrives via `?token=` query parameter when AMPECO loads the widget in iframe
2. **Token Extraction**: Middleware (`middleware.ts`) extracts token from query param or Authorization header
3. **Public Key Fetch**: Fetches public key from `https://{tenant}/.well-known/jwks.json`
4. **Token Verification**: Verifies ES256 signature, validates issuer, audience, expiration
5. **Context Storage**: Stores validated JWT payload in request headers for Server Components
6. **API Impersonation**: When `impersonate: true`, API calls use format: `Bearer {api_token}:{jwt_token}`

### JWT Payload Structure

```typescript
{
  iss: string;              // AMPECO tenant URL
  aud: string | string[];   // Widget domain
  admin_id: number;          // Admin user ID
  app_id: number;           // Integration ID
  widget_id: number;        // Widget instance ID
  widget_name: string;      // Widget name
  impersonate: boolean;     // API impersonation enabled
  resource: string;          // Resource type (e.g., "dashboard")
  resource_id?: string;      // Resource ID
  exp: number;              // Expiration timestamp
}
```

### Public Key Verification

- **Endpoint**: `GET https://{tenant}/.well-known/jwks.json`
- **Format**: JWKS (JSON Web Key Set)
- **Algorithm**: ES256 (ECDSA P-256)
- **Caching**: 1 hour (in-memory cache)
- **Key ID**: Look for `kid: "1"` and `alg: "ES256"`

## Development Guidelines

### Code Style

- **TypeScript**: Use strict mode, prefer interfaces over types for public APIs
- **Naming**: Use camelCase for variables/functions, PascalCase for components
- **Async/Await**: Always use async/await, avoid callbacks
- **Error Handling**: Always use try/catch, provide user-friendly messages
- **Comments**: JSDoc for public functions, inline comments for complex logic

### Security Rules

✅ **ALWAYS:**

- Validate JWT tokens before processing requests
- Use environment variables for secrets
- Validate all user inputs
- Use HTTPS in production
- Cache public keys (1 hour minimum)
- Check `impersonate` flag before using JWT for API calls

❌ **NEVER:**

- Log JWT tokens or API tokens
- Skip JWT validation for "testing"
- Commit secrets to version control
- Use deprecated `/api/v1/` endpoints (use `/public-api/resources/`)
- Trust client-side data without server validation

### Error Handling Patterns

```typescript
// ✅ Good: User-friendly error messages
try {
  const apiService = getApiService();
  const data = await apiService.request("charge-points/v1.0", {
    method: "GET",
    params: { per_page: 100 },
  });
} catch (error) {
  const message = formatApiError(error);
  return <ErrorMessage message={message} />;
}

// ❌ Bad: Exposing internal errors
catch (error) {
  return <div>{error.toString()}</div>; // Exposes stack traces
}
```

### API Integration Patterns

```typescript
// ✅ Good: Use API service with impersonation
import { getApiService } from "@/lib/services/api";
const apiService = getApiService();
const data = await apiService.request("charge-points/v1.0", {
  method: "GET",
  params: { per_page: 100 },
}); // Automatically uses JWT if available

// ❌ Bad: Manual API calls without service
const response = await fetch(url, {
  headers: { Authorization: `Bearer ${token}` }, // Missing impersonation format
});
```

## Quick Reference

### Environment Variables

```bash
AMPECO_BASE_DOMAIN=demo.charge.ampeco.tech  # Without https://
AMPECO_API_TOKEN=sk_live_xxxxx               # From Settings > API Tokens
```

### Configuration Helper

```typescript
import { getAmpecoConfig } from "@/lib/config/ampeco";

const config = getAmpecoConfig();
// Returns: { baseDomain, apiToken, urls: { publicKey, apiBase, tenant }, jwt: {...} }
```

### API Base URL

```text
https://{AMPECO_BASE_DOMAIN}/public-api/resources/{resource}/{version}
```

### Authorization Header

- **With Impersonation** (`impersonate: true`): `Bearer {api_token}:{jwt_token}`
- **Without Impersonation**: `Bearer {api_token}`

### Data Fetching

- **Server Components**: Use `getApiService()` from `lib/services/api.ts`
- **Client Components**: Use TanStack Query hooks (`useGet`, `usePost`, `usePatch`, `usePut`, `useDelete`) from `lib/hooks`
- **No Server Actions**: All form submissions use TanStack Query mutations

## Common Pitfalls

### ❌ Using Deprecated Endpoints

```typescript
// ❌ Bad: Old endpoint
GET /api/v1/charge-points

// ✅ Good: New endpoint
GET /public-api/resources/charge-points/v2.0
```

### ❌ Skipping JWT Validation

```typescript
// ❌ Bad: No validation
const token = request.query.token;
const data = await fetch(url, { headers: { Authorization: token } });

// ✅ Good: Validate first
const payload = await verifyJwt(token);
const apiService = getApiService();
const data = await apiService.request("charge-points/v1.0", {
  method: "GET",
});
```

### ❌ Wrong Authorization Format

```typescript
// ❌ Bad: Missing impersonation format
Authorization: Bearer ${jwtToken}

// ✅ Good: Correct format when impersonate: true
Authorization: Bearer ${apiToken}:${jwtToken}
```

### ❌ Not Checking Impersonate Flag

```typescript
// ❌ Bad: Always using JWT
const authHeader = `Bearer ${apiToken}:${jwtToken}`;

// ✅ Good: Check flag first
const authHeader = payload.impersonate
  ? `Bearer ${apiToken}:${jwtToken}`
  : `Bearer ${apiToken}`;
```

### ❌ Client-Side Data Fetching

```typescript
// ❌ Bad: Manual fetch in Client Component
"use client";
useEffect(() => {
  fetch("/api/data").then(...); // Exposes API token, no caching
}, []);

// ✅ Good: Use TanStack Query in Client Component
"use client";
import { useGet } from "@/lib/hooks";

export function MyComponent() {
  const { data } = useGet("/api/charge-points/v1.0"); // Automatic caching, refetching
  return <div>{/* Render */}</div>;
}
```

## Resources

- **Integration Guide**: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) — Setup, examples, data fetching patterns, layout patterns, API reference, and troubleshooting
- **Hook Template Guide**: [lib/hooks/HOOK_TEMPLATE.md](lib/hooks/HOOK_TEMPLATE.md) — Creating custom TanStack Query hooks
- **AMPECO API Docs**: <https://developers.ampeco.com/>
- **AMPECO UI Docs**: <https://ampeco.github.io/ampeco-backend-ui-package/>
- **Next.js Docs**: <https://nextjs.org/docs>

## Critical Rules Summary

1. ✅ ALWAYS use `/public-api/resources/` endpoints (NOT `/api/v1/`)
2. ✅ ALWAYS validate JWT before processing requests
3. ✅ ALWAYS use impersonation format: `Bearer {api_token}:{jwt_token}` when `impersonate: true`
4. ✅ ALWAYS cache public key for at least 1 hour
5. ✅ ALWAYS validate JWT issuer matches AMPECO tenant domain
6. ❌ NEVER log JWT tokens or API tokens
7. ❌ NEVER skip JWT validation for "testing"
8. ❌ NEVER use client-side data fetching for sensitive operations
