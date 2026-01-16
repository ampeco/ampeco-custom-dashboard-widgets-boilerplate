# CLAUDE.md - AI Agent Context

This file provides context for AI development agents (Claude Code, GitHub Copilot, etc.) working on the AMPECO Custom Widget Template project.

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
3. **Public Key Fetch**: Fetches public key from `https://{tenant}/api/v1/marketplace/public-key`
4. **Token Verification**: Verifies ES256 signature, validates issuer, audience, expiration
5. **Context Storage**: Stores validated JWT payload in request headers for Server Components
6. **API Impersonation**: When `impersonate: true`, API calls use format: `Bearer {api_token}:{jwt_token}`

### JWT Payload Structure

```typescript
{
  iss: string;              // AMPECO tenant URL
  aud: string | string[];   // Widget domain
  user_id: number;          // Admin user ID
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

- **Endpoint**: `GET https://{tenant}/api/v1/marketplace/public-key`
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

## AMPECO API Integration

### Base URL Structure

```text
https://{AMPECO_BASE_DOMAIN}/public-api/resources/{resource}/{version}
```

### Common Resources

- **Charge Points**: `/public-api/resources/charge-points/v2.0`
- **Sessions**: `/public-api/resources/sessions/v1.0`
- **EVSEs**: `/public-api/resources/evses/v2.1`

### Authorization Header Format

**With Impersonation** (when `impersonate: true`):

```http
Authorization: Bearer {api_token}:{jwt_token}
```

**Without Impersonation**:

```http
Authorization: Bearer {api_token}
```

### API Service Usage

#### Server Components (Direct API Calls)

```typescript
import { getApiService } from "@/lib/services/api";
import type { ApiResponse } from "@/lib/services/api";

// In Server Component
const apiService = getApiService();
const response = await apiService.request<ApiResponse<unknown[]>>(
  "charge-points/v1.0",
  {
    method: "GET",
      params: {
        page: 1,
        per_page: 10,
        status: "active",
      },
  }
);

// Response structure
{
  data: unknown[],
  meta: {
    current_page: number,
    last_page: number,
    per_page: number,
    total: number
  }
}
```

#### Client Components (TanStack Query)

```typescript
"use client";
import { useGet } from "@/lib/hooks";

export function DashboardClient() {
  // TanStack Query handles caching, refetching, and error states
  const { data, isLoading, error } = useGet("/api/charge-points/v1.0", {
    per_page: 10,
    status: "active",
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

### TanStack Query Integration

The template includes TanStack Query for efficient data fetching in Client Components:

- **Provider**: `lib/providers/query-provider.tsx` - Wraps the app with QueryClientProvider
- **Hooks**: `lib/hooks/` - Generic hooks for API calls
  - `index.ts` - Main entry point (re-exports all hooks)
  - `use-api.ts` - Generic API hooks (useGet, usePost, usePatch, usePut, useDelete)
  - `utils.ts` - Shared utilities (token extraction, URL helpers)
- **DevTools**: React Query DevTools enabled in development mode

**Import Options:**

```typescript
// Option 1: Import from main entry (recommended)
import { useGet } from "@/lib/hooks";

// Option 2: Import from specific files (better tree-shaking)
import { useGet } from "@/lib/hooks/use-api";
```

**Available Hooks:**

- `useGet(endpoint, params?, options?)` - Fetch data from any endpoint
- `usePost(endpoint, options?)` - Create resources
- `usePatch(endpoint, options?)` - Update resources
- `usePut(endpoint, options?)` - Replace resources
- `useDelete(endpoint, options?)` - Delete resources

**Modular Hook Structure:**

The hooks are organized in `lib/hooks/` for better maintainability:

- **`index.ts`** - Main entry point (re-exports all hooks)
- **`use-api.ts`** - Generic API hooks (useGet, usePost, usePatch, usePut, useDelete)
- **`utils.ts`** - Shared utilities (token extraction, URL helpers)
- **`HOOK_TEMPLATE.md`** - Template guide for creating custom hooks

**Creating New Hooks:**

For most use cases, you can use the generic hooks directly in your components without creating new files:

```typescript
// Just use the generic hooks directly
import { useGet, usePost, usePatch, useDelete } from "@/lib/hooks";

// In your component
const { data } = useGet("/api/your-resource/v1.0", { per_page: 10 });
```

If you need custom hooks with specific logic, see the [Hook Template Guide](lib/hooks/HOOK_TEMPLATE.md) for examples.

**Default Query Options:**

- `staleTime`: 60 seconds
- `refetchOnWindowFocus`: false
- `retry`: 1

**When to Use:**

- ✅ **Client Components**: Use TanStack Query hooks for real-time updates, auto-refresh, optimistic updates
- ✅ **Server Components**: Use direct API calls with `getApiService()` for initial data
- ✅ **Hybrid Approach**: Fetch initial data in Server Component, use TanStack Query in Client Component for updates

## Environment Configuration

### Required Variables

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

## Adding New Features

### New Route

1. Create `app/your-route/page.tsx` (Server Component)
2. Use `getJwtContext()` to access JWT context
3. Use `getApiService()` for API calls
4. Handle errors with `formatApiError()`

```typescript
import { getApiService } from "@/lib/services/api";
import type { ApiResponse } from "@/lib/services/api";

export default async function YourRoute() {
  const jwtContext = await getJwtContext();
  if (!jwtContext) {
    return <AuthError />;
  }

  const apiService = getApiService();
  const data = await apiService.request<ApiResponse<unknown[]>>(
    "charge-points/v1.0",
    {
      method: "GET",
      params: { per_page: 100 },
    }
  );

  return <YourComponent data={data} />;
}
```

### New API Endpoint

1. Use `getApiService()` from `lib/services/api.ts`
2. Call `request()` method directly with endpoint and options
3. No need to extend the service - it's fully generic

```typescript
import { getApiService } from "@/lib/services/api";

// In your component or server action
const apiService = getApiService();
const data = await apiService.request("your-resource/v1.0", {
  method: "GET",
  params: { id: "123" },
});
```

### New Component

1. Create component in `components/` or route-specific `components/` directory
2. Use design system classes (e.g., `ampeco-card`, `ampeco-btn`)
3. For client interactivity, add `"use client"` directive
4. Use TypeScript interfaces for props

**For Client Components with Data Fetching:**

```typescript
"use client";
import { useGet } from "@/lib/hooks";

export function MyComponent() {
  const { data, isLoading, error } = useGet("/api/charge-points/v1.0", {
    per_page: 10,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

**For Custom Query Hooks:**

Create a new file `lib/hooks/use-your-resource.ts`:

```typescript
import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { appendTokenToUrl } from "./utils";

// Define query keys locally in the hook file
const resourceKeys = {
  all: ["ampeco", "your-resource"] as const,
  lists: () => [...resourceKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...resourceKeys.lists(), params] as QueryKey,
};

export function useCustomResource(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: resourceKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.set(key, String(value));
          }
        });
      }

      let url = `/api/your-resource${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 60 * 1000,
  });
}
```

Then re-export from `lib/hooks/index.ts`:

```typescript
export { useCustomResource } from "./use-your-resource";
```

### Form Handling

**Recommended:** Use TanStack Query mutations for form submissions in Client Components:

```typescript
"use client";
import { usePatch } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";

export function EditForm() {
  const queryClient = useQueryClient();
  const updateMutation = usePatch("/api/charge-points/v1.0", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
    },
  });

  const handleSubmit = async (data: FormData) => {
    await updateMutation.mutateAsync({
      id: "123",
      data: { name: data.name, status: "active" },
    });
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

**Note:** Server Actions are not used in this template. All form submissions use TanStack Query mutations for better client-side state management and caching.

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

// ✅ Also Good: Fetch in Server Component for initial data
import { getApiService } from "@/lib/services/api";

export default async function Page() {
  const apiService = getApiService();
  const data = await apiService.request("your-resource/v1.0", {
    method: "GET",
  }); // Server-side
  return <ClientComponent initialData={data} />;
}
```

## File Structure Reference

```text
app/
  dashboard/          # Full dashboard example
  listings/          # Data table example
  form/              # Form demo example
  edit-charge-point/ # Edit charge point example
  widget/            # Single widget example
  api/               # API routes
    health/          # Health check endpoint
    [...path]/       # Generic API proxy route (handles all AMPECO API calls)

lib/
  auth/              # JWT authentication
    jwt-verifier.ts  # Token verification
    get-jwt-context.ts # Context helpers
  config/            # Configuration
    ampeco.ts        # AMPECO config helper
  services/          # API services
    api.ts           # Generic API client
  hooks/             # TanStack Query hooks
    index.ts         # Main entry point (re-exports all hooks)
    use-api.ts       # Generic API hooks (useGet, usePost, etc.)
    utils.ts         # Shared utilities (token extraction)
    HOOK_TEMPLATE.md # Template guide for creating new hooks
  providers/         # React providers
    query-provider.tsx # TanStack Query provider
  middleware/        # Security utilities
    security.ts      # Security helpers
  utils/             # Utilities
    error-handler.ts # Error formatting
    iframe-communication.ts # iframe utilities
    preserve-token.ts # Token URL preservation

components/
  ui/                # Design system components
  layout/            # Layout components

middleware.ts        # Next.js middleware (JWT validation)
```

## Testing Guidelines

### Unit Tests

- Test JWT verification logic
- Test API service methods
- Test utility functions
- Mock external dependencies

### Integration Tests

- Test complete authentication flow
- Test API calls with impersonation
- Test error handling
- Test form submissions

### Test Data

- Use mock JWT tokens for testing
- Mock API responses
- Test edge cases (expired tokens, invalid signatures)

## Performance Considerations

- **Public Key Caching**: Cache for 1 hour minimum
- **API Response Caching**: TanStack Query handles automatic caching
  - Default `staleTime`: 60 seconds
  - Adjust per query based on data freshness needs
  - Use `refetchInterval` for real-time data (e.g., 30 seconds for active sessions)
- **Parallel Requests**: TanStack Query automatically batches and deduplicates requests
- **Server Components**: Prefer Server Components for initial data fetching
- **Client Components**: Use TanStack Query for real-time updates and optimistic UI
- **Code Splitting**: Next.js automatically splits by route

## Security Checklist

Before deploying:

- [ ] All environment variables set
- [ ] JWT validation implemented
- [ ] API token stored securely
- [ ] CSP headers configured
- [ ] CORS allows only AMPECO domains
- [ ] Input validation on all forms
- [ ] Error messages don't expose sensitive data
- [ ] HTTPS enabled
- [ ] Dependencies updated (`npm audit`)

## Resources

- **AMPECO API Docs**: <https://developers.ampeco.com/>
- **Next.js Docs**: <https://nextjs.org/docs>
- **JWT Spec**: <https://jwt.io/introduction>
- **ES256 Algorithm**: ECDSA using P-256 curve and SHA-256

## Critical Rules Summary

1. ✅ ALWAYS use `/public-api/resources/` endpoints (NOT `/api/v1/`)
2. ✅ ALWAYS validate JWT before processing requests
3. ✅ ALWAYS use impersonation format: `Bearer {api_token}:{jwt_token}` when `impersonate: true`
4. ✅ ALWAYS cache public key for at least 1 hour
5. ✅ ALWAYS validate JWT issuer matches AMPECO tenant domain
6. ❌ NEVER log JWT tokens or API tokens
7. ❌ NEVER skip JWT validation for "testing"
8. ❌ NEVER use client-side data fetching for sensitive operations
