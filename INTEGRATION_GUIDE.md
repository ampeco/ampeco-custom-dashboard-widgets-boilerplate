# AMPECO Custom Widget Integration Guide

Step-by-step guide for integrating your custom widget with AMPECO backend.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AMPECO Backend Configuration](#ampeco-backend-configuration)
3. [Widget Configuration](#widget-configuration)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Testing](#testing)
7. [Data Fetching with TanStack Query](#data-fetching-with-tanstack-query)
8. [Common Integration Patterns](#common-integration-patterns)
9. [Layout Patterns with Tailwind CSS Grid System](#layout-patterns-with-tailwind-css-grid-system)
10. [API Endpoint Reference](#api-endpoint-reference)
11. [Security Best Practices](#security-best-practices)
12. [Performance Optimization](#performance-optimization)
13. [Troubleshooting](#troubleshooting)

## Prerequisites

Before integrating your widget, ensure you have:

- ✅ AMPECO tenant access (staging or production)
- ✅ AMPECO API token (from Settings > API Tokens)
- ✅ Deployed widget application (with HTTPS)
- ✅ Widget URL accessible from AMPECO backend

## AMPECO Backend Configuration

### Step 1: Create Custom Widget Integration

1. Log in to your AMPECO tenant admin panel
2. Navigate to **Marketplace** > **Catalog** > **Custom Widgets**
3. Create a new custom widget
4. Fill in the following:

   | Field                               | Value                            | Description                        |
   | ----------------------------------- | -------------------------------- | ---------------------------------- |
   | **Name**                            | Your Widget Name                 | Human-readable name for the widget |
   | **URL to embed**                    | `https://your-widget.com/`       | Full URL of your widget            |
   | **Width**                           | Full width or 1/3                | Widget width in dashboard          |
   | **Height**                          | Fixed height in pixels or "auto" | Fixed height in pixels or auto     |
   | **Sandbox options**                 | See below                        | iframe sandbox attributes          |
   | **Enable admin user impersonation** | ✅ Enabled                       | Allow JWT for API calls            |

### Step 2: Configure Sandbox Options

The sandbox attribute for the iframe. If nothing is selected the iframe will not be sandboxed and everything will be allowed.

- Allows to run scripts
- Allows form submission
- Allows to open modal windows
- Allows the iframe content to be treated as being from the same origin
- Allows to lock the screen orientation
- Allows to use the Pointer Lock API
- Allows popups
- Allows popups to open new windows without inheriting the sandboxing
- Allows to start a presentation session
- Allows the iframe content to navigate its top-level browsing context
- Allows the iframe content to navigate its top-level browsing context, but only if initiated by user

### Step 3: Enable Impersonation

**Important:** Enable "Admin user impersonation" to allow your widget to make API calls with the admin user's permissions.

## Widget Configuration

### Environment Variables

Set the following in your deployment platform:

```bash
AMPECO_BASE_DOMAIN=demo.charge.ampeco.tech
AMPECO_API_TOKEN=sk_live_your_token_here
```

### CORS Configuration

Ensure your widget allows requests from AMPECO domains:

- `https://*.charge.ampeco.tech`
- `https://*.ampeco.tech`

## Project Structure

```text
ampeco-custom-widget-template/
├── app/
│   ├── dashboard/         # Full dashboard example
│   ├── listings/          # Data listing example
│   ├── form/              # Form demo example
│   ├── edit-charge-point/ # Edit charge point example
│   ├── widget/            # Single widget example
│   ├── api/               # API routes
│   ├── error.tsx          # Error boundary
│   ├── not-found.tsx      # 404 page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Design system components
│   └── layout/            # Layout components
├── lib/
│   ├── auth/              # JWT authentication
│   ├── config/            # Configuration
│   ├── hooks/             # React hooks
│   ├── middleware/        # Security utilities
│   ├── providers/         # React providers (QueryProvider)
│   ├── services/          # API services
│   └── utils/             # Helper utilities
├── .env.example           # Environment variables example
├── CHANGELOG.md           # Changelog
├── CLAUDE.md              # AI development context
├── INTEGRATION_GUIDE.md   # Integration guide
├── middleware.ts          # Next.js middleware
├── next.config.ts         # Next.js configuration
├── package.json           # Package configuration
├── README.md              # README
└── vercel.json            # Vercel configuration
```

## Development Workflow

### Development Prerequisites

- Node.js 20.9.0 or higher
- npm or yarn
- AMPECO tenant access
- AMPECO API token

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/ampeco/ampeco-custom-dashboard-widgets-boilerplate
   cd ampeco-custom-dashboard-widgets-boilerplate
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and fill in:

   - `AMPECO_BASE_DOMAIN` - Your AMPECO tenant domain (e.g., `demo.charge.ampeco.tech`)
   - `AMPECO_API_TOKEN` - Your AMPECO API token (from Settings > API Tokens)
   - `NPM_TOKEN` - GitHub token with `read:packages` for installing `@ampeco/ampeco-ui`
   - `NODE_ENV` - development

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Access the application with JWT token**
   - Obtain JWT token from browser dev tools when viewing an existing custom widget in AMPECO
   - Access your local widget: `http://localhost:3000/dashboard?token={jwt}` (or any route like `/listings`, `/form`, etc.)
   - The token is automatically passed through to all API routes
   - Once the token is set, it'll be automatically preserved in all navigation and API requests

### Adding New Features

1. **New Route**: Create `app/your-route/page.tsx`
2. **New API Integration**: Use `getApiService()` from `lib/services/api.ts` for server-side data fetching
3. **New Component**: Add to `components/` directory
4. **Client Component with Data Fetching**: Use TanStack Query hooks (`useGet`, `usePost`, etc.) from `lib/hooks`

### Data Fetching Patterns

**Server Components** (Initial Data Fetching):

```typescript
import { getApiService } from "@/lib/services/api";
import type { ApiResponse } from "@/lib/services/api";

export default async function Page() {
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

**Client Components** (Real-time Updates with TanStack Query):

```typescript
"use client";
import { useGet } from "@/lib/hooks";

export function YourComponent() {
  const { data, isLoading } = useGet("/api/charge-points/v1.0", {
    per_page: 10,
  });
  // TanStack Query handles caching, refetching, and error states
  return <div>{/* Render */}</div>;
}
```

See the [Data Fetching with TanStack Query](#data-fetching-with-tanstack-query) section below for detailed information about hook structure and usage.

## Testing

This section covers how to test your widget integration, verify JWT authentication, and ensure API calls work correctly.

### Testing Locally

Before deploying, test your widget locally:

1. **Start your development server** (see [Local Development Setup](#local-development-setup))

2. **Get a JWT token**:

   - Open an existing custom widget in AMPECO backend
   - Open browser DevTools (F12 or Cmd+Option+I)
   - Go to Network tab
   - Find a request to your widget URL
   - Copy the `token` query parameter value from the URL

3. **Access your local widget**:

   - Open `http://localhost:3000/dashboard?token={jwt}` (or any route)
   - Verify the widget loads without errors
   - Check browser console for any warnings or errors

4. **Test different routes**:
   - `/dashboard` - Full dashboard
   - `/listings` - Data tables
   - `/form` - Form demo
   - `/edit-charge-point` - Edit resource
   - `/widget` - Single widget

### Testing JWT Validation

1. **Verify JWT token in URL**:

   - Widget should load with JWT token in query parameter: `?token={jwt}`
   - Token should be automatically preserved in navigation

2. **Check JWT payload** (using browser DevTools):

   - Open Console tab
   - Decode JWT token (use `jwt.io` or browser extension)
   - Verify payload includes:
     - `admin_id` - Admin user ID
     - `app_id` - Integration ID
     - `widget_id` - Widget instance ID
     - `impersonate: true` - Required for API calls
     - `iss` - Should match your AMPECO tenant domain
     - `aud` - Should include your widget domain
     - `exp` - Expiration timestamp (tokens expire after 12 hours)

3. **Verify JWT validation**:
   - Check browser console for authentication errors
   - Verify middleware validates token correctly
   - Test with invalid/expired token to ensure proper error handling

### Testing API Calls

1. **Verify API request format**:

   - Open browser DevTools → Network tab
   - Look for requests to `/api/` routes
   - Check Authorization header:
     - Should be: `Bearer {api_token}:{jwt_token}` (when `impersonate: true`)
     - Or: `Bearer {api_token}` (when impersonation disabled)

2. **Test data filtering**:

   - Verify API responses are filtered based on user permissions
   - Test with different user roles (if available)
   - Ensure users only see data they have access to

3. **Test API endpoints**:

   - GET requests should return data successfully
   - POST/PATCH requests should update resources
   - DELETE requests should remove resources
   - Verify error handling for invalid requests

4. **Check API response format**:

   - Responses should match `ApiResponse<T>` structure:

     ```typescript
     {
       data: T[],
       meta: {
         current_page: number,
         last_page: number,
         per_page: number,
         total: number
       }
     }
     ```

### Testing Error Scenarios

1. **Missing JWT token**:

   - Access widget without `?token=` parameter
   - Should show authentication error message
   - Should not make API calls

2. **Invalid JWT token**:

   - Use an invalid or expired token
   - Should show authentication error
   - Should not proceed with API calls

3. **API failures**:

   - Test with invalid API token
   - Test with incorrect endpoint URLs
   - Verify error messages are user-friendly
   - Check error handling in components

4. **Network issues**:
   - Test with network disconnected
   - Verify loading states display correctly
   - Check error messages for network failures

### Testing in Production

1. **Deploy to production** (Vercel, etc.)

2. **Update widget URL in AMPECO**:

   - Go to Marketplace → Catalog → Custom Widgets
   - Edit your widget
   - Update "URL to embed" to production URL
   - Save changes

3. **Test from AMPECO backend**:

   - Access widget from AMPECO dashboard
   - Verify widget loads correctly in iframe
   - Test all functionality
   - Check console for errors

4. **Verify HTTPS**:
   - Ensure production URL uses HTTPS
   - Check SSL certificate is valid
   - Verify CSP headers allow AMPECO domains

### Browser DevTools Tips

**Console Tab**:

- Check for JavaScript errors
- Look for authentication warnings
- Verify React Query DevTools (if enabled)

**Network Tab**:

- Filter by "Fetch/XHR" to see API calls
- Check request headers (especially Authorization)
- Verify response status codes (200, 401, 403, etc.)
- Inspect response payloads

**Application Tab**:

- Check localStorage/sessionStorage (if used)
- Verify cookies (if used)
- Check service workers (if used)

### Common Issues to Check

- ✅ JWT token present in URL
- ✅ `impersonate: true` in JWT payload
- ✅ Authorization header format correct
- ✅ API endpoints use `/public-api/resources/` prefix
- ✅ CORS headers allow AMPECO domains
- ✅ CSP headers configured correctly
- ✅ Widget URL accessible from AMPECO backend
- ✅ Environment variables set correctly
- ✅ No console errors or warnings

## Data Fetching with TanStack Query

This template includes [TanStack Query](https://tanstack.com/query) (React Query) for efficient data fetching, caching, and state management.

### Quick Start: Generic Hooks (Recommended) ⭐

The easiest way to make API calls is using the generic hooks directly in your components:

```tsx
"use client";

import { useGet, usePost, usePatch, useDelete } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/services/api";

export function MyComponent() {
  const queryClient = useQueryClient();

  // GET - Fetch data
  const { data, isLoading } = useGet("/api/charge-points/v1.0", {
    page: 1,
    per_page: 10,
  });

  // POST - Create
  const create = usePost("/api/charge-points/v1.0", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
    },
  });

  // PATCH - Update (pass { id, data })
  const update = usePatch("/api/charge-points/v1.0");

  // DELETE (pass id as string)
  const deleteItem = useDelete<void, string>("/api/charge-points/v1.0");

  // Use the hooks
  const handleCreate = () => create.mutate({ name: "New", status: "offline" });
  const handleUpdate = (id: string) =>
    update.mutate({ id, data: { status: "online" } });
  const handleDelete = (id: string) => deleteItem.mutate(id);

  return <div>{/* Your UI */}</div>;
}
```

**Benefits:**

- ✅ No need to create new hook files
- ✅ Works with any AMPECO API endpoint
- ✅ Automatic token handling
- ✅ Full TypeScript support
- ✅ Flexible - pass any query/mutation options

For more examples, see the [Hook Template Guide](../lib/hooks/HOOK_TEMPLATE.md).

### Why TanStack Query?

- ✅ **Automatic Caching**: Reduces unnecessary API calls
- ✅ **Background Refetching**: Keeps data fresh automatically
- ✅ **Optimistic Updates**: Better UX for mutations
- ✅ **Error Handling**: Built-in retry and error states
- ✅ **DevTools**: Visual debugging of queries

### Setup

TanStack Query is already configured in the template:

- **Provider**: `lib/providers/query-provider.tsx`
- **Hooks**: `lib/hooks/` - Generic hooks for API calls
- **DevTools**: Enabled in development mode

### Using Query Hooks

#### Fetching Data (Queries)

```tsx
"use client";

import { useGet } from "@/lib/hooks";

export function DashboardStats() {
  const {
    data: chargePoints,
    isLoading,
    error,
  } = useGet("/api/charge-points/v1.0", {
    per_page: 100,
  });
  const { data: sessions } = useGet("/api/sessions/v1.0", {
    per_page: 100,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Charge Points: {chargePoints?.data?.length || 0}</p>
      <p>Sessions: {sessions?.data?.length || 0}</p>
    </div>
  );
}
```

**Modular Hook Structure:**

The hooks are organized in a modular structure for easier maintenance and better tree-shaking. Each hook file is self-contained with its own query keys:

```text
lib/hooks/
├── index.ts              # Main entry point (re-exports all hooks)
├── use-api.ts            # Generic hooks (useGet, usePost, usePatch, usePut, useDelete) ⭐
├── utils.ts              # Shared utilities (token extraction, URL helpers)
└── HOOK_TEMPLATE.md      # Template guide for creating new hooks
```

**Import Options:**

```typescript
// Option 1: Import generic hooks (recommended)
import { useGet, usePost, usePatch, useDelete } from "@/lib/hooks";

// Option 2: Import from specific files (better tree-shaking)
import { useGet } from "@/lib/hooks/use-api";

// Option 3: Import utilities separately
import { appendTokenToUrl } from "@/lib/hooks/utils";
```

**Creating New API Calls:**

**Recommended:** Use the generic hooks (`useGet`, `usePost`, etc.) directly in your components - no new files needed! See the [Hook Template Guide](lib/hooks/HOOK_TEMPLATE.md) for examples.

#### Creating/Updating Data (Mutations)

```tsx
"use client";

import { usePost, usePatch } from "@/lib/hooks";
import { useState } from "react";

export function ChargePointForm() {
  const queryClient = useQueryClient();
  const createMutation = usePost("/api/charge-points/v1.0", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
    },
  });
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ name, status: "offline" });
      setName("");
      // Query will automatically refetch after mutation
    } catch (error) {
      console.error("Failed to create charge point:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Charge Point Name"
      />
      <button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
```

#### Fetching Single Resource

```tsx
"use client";

import { useGet } from "@/lib/hooks";

export function ChargePointDetails({ id }: { id: string }) {
  const { data, isLoading, error } = useGet(`/api/charge-points/v1.0/${id}`);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading charge point</div>;

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>Status: {data?.status}</p>
    </div>
  );
}
```

### Query Configuration

Default query options (configured in `query-provider.tsx`):

- **staleTime**: 60 seconds (data considered fresh)
- **refetchOnWindowFocus**: false (prevents refetch on tab focus)
- **retry**: 1 (retry failed requests once)

You can override these per query:

```tsx
const { data } = useGet(
  "/api/charge-points/v1.0",
  { per_page: 10 },
  {
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  }
);
```

### React Query DevTools

In development mode, React Query DevTools appear automatically:

- **Location**: Bottom-right corner of the screen
- **Features**: View all queries, mutations, cache state
- **Usage**: Click to expand and inspect query details

### Server Components vs Client Components

**Important**: TanStack Query hooks only work in Client Components.

- ✅ **Client Components**: Use `useQuery`, `useMutation` hooks
- ✅ **Server Components**: Use direct API calls with `getApiService()`

Example pattern:

```tsx
// app/dashboard/page.tsx (Server Component)
import { getApiService } from "@/lib/services/api";
import type { ApiResponse } from "@/lib/services/api";

export default async function DashboardPage() {
  const apiService = getApiService();
  const chargePoints = await apiService.request<ApiResponse<unknown[]>>(
    "charge-points/v1.0",
    {
      method: "GET",
      params: { per_page: 100 },
    }
  );

  return <DashboardClient initialData={chargePoints} />;
}

// app/dashboard/components/DashboardClient.tsx (Client Component)
("use client");
import { useGet } from "@/lib/hooks";

export function DashboardClient({ initialData }: { initialData: any }) {
  // Can use queries for real-time updates
  const { data } = useGet(
    "/api/charge-points/v1.0",
    { per_page: 100 },
    {
      initialData, // Use server-fetched data as initial
    }
  );

  return <div>{/* Render data */}</div>;
}
```

#### Option 2: Create Resource-Specific Hooks

For creating custom hooks, see the [Hook Template Guide](../lib/hooks/HOOK_TEMPLATE.md) for a complete template and step-by-step instructions.

#### Example: Creating a simple custom hook

```tsx
// lib/hooks/use-active-sessions.ts
import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/services/api";
import { appendTokenToUrl } from "./utils";

const activeSessionKeys = {
  all: ["ampeco", "sessions", "active"] as const,
};

export function useActiveSessions() {
  return useQuery<ApiResponse<unknown[]>, Error>({
    queryKey: activeSessionKeys.all,
    queryFn: async () => {
      let url = "/api/sessions/v1.0?status=active";
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch active sessions: ${response.statusText}`
        );
      }
      return response.json();
    },
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
  });
}
```

Then re-export from `lib/hooks/index.ts`:

```typescript
export { useActiveSessions } from "./use-active-sessions";
```

**For complete CRUD hooks (list, detail, create, update, delete)**, see the [Hook Template Guide](../lib/hooks/HOOK_TEMPLATE.md).

## Common Integration Patterns

The template includes five example implementations that demonstrate different patterns and use cases. Each pattern below corresponds to an example in the codebase and shows how to implement similar functionality.

### Pattern 1: Full Dashboard (`/dashboard`)

**Example implementation:** See `app/dashboard/` in the codebase

**Use case:** Complete dashboard with navigation and multiple views

**Configuration:**

- Width: Full width
- Height: Auto or fixed (e.g., 800px)
- URL: `https://your-widget.com/dashboard?token={jwt}`

**Implementation:**

- Use `DashboardLayout` component
- Fetch data in Server Components
- Implement navigation between views
- Multiple KPI cards using Card component from @ampeco/ampeco-ui
- Charts and visualizations
- Responsive layout for full-width iframe
- Server-side data fetching with error handling

### Pattern 2: Single Metric Widget (`/widget`)

**Example implementation:** See `app/widget/` in the codebase

**Use case:** Display single KPI (e.g., "Active Sessions: 42")

**Configuration:**

- Width: 1/3 or 2/3
- Height: Auto or fixed (e.g., 200px)
- URL: `https://your-widget.com/widget?token={jwt}`

**Implementation:**

- Use `WidgetLayout` component
- Use TanStack Query with `refetchInterval` for auto-refresh
- Minimal UI, focused on single metric
- Compact single-metric display
- Auto-refreshing data using TanStack Query with `refetchInterval`
- Designed for 1/3 or 2/3 width

**Example with TanStack Query:**

```tsx
"use client";
import { useGet } from "@/lib/hooks";

export function ActiveSessionsWidget() {
  const { data, isLoading } = useGet(
    "/api/sessions/v1.0",
    { status: "active", per_page: 1 },
    {
      refetchInterval: 30 * 1000, // Refresh every 30 seconds
    }
  );

  if (isLoading) return <div>Loading...</div>;

  const activeCount = data?.meta?.total || 0;
  return <div>Active Sessions: {activeCount}</div>;
}
```

### Pattern 3: Data Table (`/listings`)

**Example implementation:** See `app/listings/` in the codebase

**Use case:** Paginated list of resources (charge points, sessions, etc.)

**Configuration:**

- Width: Full width
- Height: Auto
- URL: `https://your-widget.com/listings?token={jwt}`

**Implementation:**

- Server-side pagination
- Filtering and sorting
- Export functionality (optional)
- Paginated table of charge points
- Client-side pagination using TanStack Query

### Pattern 4: Form Demo (`/form`)

**Example implementation:** See `app/form/` in the codebase

**Use case:** Demonstrate form components and validation

**Configuration:**

- Width: Full width or 2/3
- Height: Auto
- URL: `https://your-widget.com/form?token={jwt}`

**Implementation:**

- Comprehensive form demonstration with react-hook-form and zod
- Shows all available form components from @ampeco/ampeco-ui
- Client-side validation examples
- Form reset functionality

### Pattern 5: Edit Resource (`/edit-charge-point`)

**Example implementation:** See `app/edit-charge-point/` in the codebase

**Use case:** Edit existing resources (e.g., charge points)

**Configuration:**

- Width: Full width or 2/3
- Height: Auto
- URL: `https://your-widget.com/edit-charge-point?token={jwt}&id={resourceId}`

**Implementation:**

- Use TanStack Query mutations (`usePatch`)
- Select resource from dropdown or via URL parameter
- Automatic form prefilling when resource is selected
- Client and server-side validation
- Error handling and success messages
- Automatic cache invalidation after mutations
- Can be linked from listings tables for direct navigation
- Edit charge point resources using PATCH requests with TanStack Query mutations
- Select charge point from dropdown or via URL parameter (`?id={chargePointId}`)

**Example with TanStack Query:**

```tsx
"use client";
import { usePost } from "@/lib/hooks";

export function CreateChargePointForm() {
  const queryClient = useQueryClient();
  const createMutation = usePost("/api/charge-points/v1.0", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
    },
  });

  const handleSubmit = async (data: FormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.get("name") as string,
        status: "offline",
      });
      // Query automatically refetches charge points list
    } catch (error) {
      // Handle error
    }
  };

  return <form action={handleSubmit}>{/* Form fields */}</form>;
}
```

## Layout Patterns with Tailwind CSS Grid System

When building dashboards, you often need cards and widgets of different widths. Tailwind CSS provides a flexible grid system that makes this easy.

### Basic Grid Setup

Use a 12-column grid system for maximum flexibility:

```tsx
<div className="grid md:grid-cols-12 gap-4">{/* Your cards here */}</div>
```

**Key classes:**

- `grid` - Creates a CSS grid container
- `md:grid-cols-12` - Creates 12 columns on medium screens and up (stacks on mobile)
- `gap-4` - Adds spacing between grid items (1rem / 16px)

### Card Width Examples

Control card width using `col-span-*` classes:

```tsx
<div className="grid md:grid-cols-12 gap-4">
  {/* Full width (12/12) */}
  <Card className="md:col-span-12">
    <p>Full width card</p>
  </Card>

  {/* 2/3 width (8/12) */}
  <Card className="md:col-span-8">
    <p>Two-thirds width card</p>
  </Card>

  {/* 1/3 width (4/12) */}
  <Card className="md:col-span-4">
    <p>One-third width card</p>
  </Card>

  {/* 1/2 width (6/12) */}
  <Card className="md:col-span-6">
    <p>Half width card</p>
  </Card>

  {/* 1/4 width (3/12) */}
  <Card className="md:col-span-3">
    <p>Quarter width card</p>
  </Card>
</div>
```

### Common Width Patterns

| Width | Class            | Columns | Use Case                           |
| ----- | ---------------- | ------- | ---------------------------------- |
| Full  | `md:col-span-12` | 12/12   | Main content, tables, wide charts  |
| 2/3   | `md:col-span-8`  | 8/12    | Primary metrics, large charts      |
| 1/2   | `md:col-span-6`  | 6/12    | Side-by-side comparisons           |
| 1/3   | `md:col-span-4`  | 4/12    | KPI cards, small widgets           |
| 1/4   | `md:col-span-3`  | 3/12    | Compact metrics, status indicators |

### Real-World Example

Here's how the dashboard example uses different card widths:

```tsx
<div className="grid md:grid-cols-12 gap-4">
  {/* 2/3 width - Active Sessions */}
  <Card className="md:col-span-8">
    <h3>Active Sessions</h3>
    <p className="text-3xl font-bold">42</p>
  </Card>

  {/* 1/3 width - Total Energy */}
  <Card className="md:col-span-4">
    <h3>Total Energy Delivered</h3>
    <p className="text-3xl font-bold">1,234.56 kWh</p>
  </Card>

  {/* 1/4 width - Status cards (4 cards in a row) */}
  <Card className="md:col-span-3">
    <h3>Active</h3>
    <p className="text-3xl font-bold">25</p>
  </Card>
  <Card className="md:col-span-3">
    <h3>Disabled</h3>
    <p className="text-3xl font-bold">5</p>
  </Card>
  <Card className="md:col-span-3">
    <h3>Out of Order</h3>
    <p className="text-3xl font-bold">2</p>
  </Card>
  <Card className="md:col-span-3">
    <h3>Demo</h3>
    <p className="text-3xl font-bold">1</p>
  </Card>

  {/* Full width - Large chart */}
  <Card className="md:col-span-12">
    <h3>Power Consumption</h3>
    <PowerConsumptionChart />
  </Card>

  {/* 1/2 width - Side-by-side charts */}
  <Card className="md:col-span-6">
    <h3>Sessions by Status</h3>
    <SessionsStatusChart />
  </Card>
  <Card className="md:col-span-6">
    <h3>Energy Over Time</h3>
    <EnergyChart />
  </Card>
</div>
```

### Responsive Behavior

Cards automatically stack on mobile devices:

- **Mobile (< md breakpoint)**: All cards stack vertically (full width)
- **Tablet/Desktop (≥ md breakpoint)**: Cards use their specified column spans

You can also add responsive variations:

```tsx
<Card className="col-span-12 md:col-span-6 lg:col-span-4">
  {/* Full width on mobile, half on tablet, third on desktop */}
</Card>
```

### Tips

1. **Always use `md:` prefix** - Ensures cards stack on mobile for better UX
2. **Sum to 12** - Each row should total 12 columns (e.g., `col-span-8` + `col-span-4` = 12)
3. **Use `gap-4` or `gap-6`** - Provides consistent spacing between cards
4. **Combine with Card component** - The `Card` component from `@ampeco/ampeco-ui` works perfectly with grid layouts

## API Endpoint Reference

### Base URL Structure

All API endpoints follow this pattern:

```text
https://{tenant-domain}/public-api/resources/{resource}/{version}
```

### Common Endpoints

#### Charge Points

```bash
# List charge points
GET /public-api/resources/charge-points/v2.0
Query params: page, per_page, status, search

# Get single charge point
GET /public-api/resources/charge-points/v2.0/{id}

# Create charge point
POST /public-api/resources/charge-points/v2.0
Body: { name, status, ... }

# Update charge point
PATCH /public-api/resources/charge-points/v2.0/{id}
Body: { name, status, ... }
```

#### Sessions

```bash
# List sessions
GET /public-api/resources/sessions/v1.0
Query params: page, per_page, status, charge_point_id, start_date, end_date

# Get single session
GET /public-api/resources/sessions/v1.0/{id}
```

#### EVSEs

```bash
# List EVSEs
GET /public-api/resources/evses/v2.1
Query params: page, per_page, charge_point_id

# Get single EVSE
GET /public-api/resources/evses/v2.1/{id}
```

### Authorization Header

When `impersonate: true` in JWT:

```http
Authorization: Bearer {api_token}:{jwt_token}
```

Otherwise:

```http
Authorization: Bearer {api_token}
```

### Complete API Documentation

For full API reference, see: <https://developers.ampeco.com/>

## Security Best Practices

### 1. JWT Validation

✅ **Always validate JWT tokens**

- Verify signature using public key
- Check issuer matches AMPECO tenant
- Validate audience includes your domain
- Check expiration with clock tolerance

❌ **Never skip validation for "testing"**

### 2. API Token Security

✅ **Store API token in environment variables**
✅ **Never commit tokens to version control**
✅ **Rotate tokens regularly**
✅ **Never log API tokens or JWT tokens**

### 3. Input Validation

✅ **Validate all user inputs**
✅ **Sanitize data before API calls**
✅ **Use TypeScript for type safety**

### 4. HTTPS

✅ **Always use HTTPS in production**
✅ **Enforce HTTPS redirects**
✅ **Use secure cookies**

### 5. CSP Headers

✅ **Configure Content Security Policy**
✅ **Allow only necessary sources**
✅ **Restrict frame-ancestors to AMPECO domains**

### 6. General Security Practices

✅ **Always validate JWT tokens before processing**
✅ **Keep dependencies updated** (`npm audit`)
✅ **Use environment variables for secrets**

## Performance Optimization

### 1. Caching

- **Public Key**: Cache for 1 hour (already implemented)
- **API Responses**: TanStack Query handles automatic caching
  - Default `staleTime`: 60 seconds
  - Adjust per query based on data freshness needs
  - Use `gcTime` (formerly `cacheTime`) to control how long unused data stays in cache
- **Static Assets**: Use CDN for images, fonts, etc.

**TanStack Query Caching Tips:**

```tsx
// For frequently changing data (sessions, real-time metrics)
useGet("/api/sessions/v1.0", {}, { staleTime: 0, refetchInterval: 30 * 1000 });

// For relatively static data (charge points, configurations)
useGet("/api/charge-points/v1.0", {}, { staleTime: 5 * 60 * 1000 }); // 5 minutes
```

### 2. API Calls

- **Batch Requests**: Fetch multiple resources in parallel using `Promise.all()` or multiple `useQuery` hooks
- **Pagination**: Use server-side pagination for large datasets
- **Debounce**: Debounce search/filter inputs (TanStack Query supports this with `enabled` option)
- **Parallel Queries**: TanStack Query automatically batches and deduplicates requests

**Example - Parallel Queries:**

```tsx
"use client";
import { useGet } from "@/lib/hooks";

export function Dashboard() {
  // Both queries run in parallel automatically
  const { data: chargePoints } = useGet("/api/charge-points/v1.0", {
    per_page: 100,
  });
  const { data: sessions } = useGet("/api/sessions/v1.0", {
    per_page: 100,
  });

  // Queries are deduplicated - if multiple components use same query,
  // only one request is made
}
```

### 3. Code Splitting

- **Route-based**: Next.js automatically splits by route
- **Component-based**: Use dynamic imports for large components
- **Lazy Loading**: Load charts/visualizations on demand

### 4. Database Queries

- **Indexing**: Ensure API endpoints use indexed queries
- **Filtering**: Use API filters instead of client-side filtering
- **Pagination**: Always paginate large datasets

### 5. Monitoring

- **Response Times**: Monitor API response times
- **Error Rates**: Track authentication and API errors
- **User Experience**: Monitor page load times

## Troubleshooting

### Widget Not Loading

**Symptoms:** Widget shows blank or error in iframe

**Solutions:**

1. Check browser console for errors
2. Verify JWT token is present in URL
3. Check CSP headers allow AMPECO domains
4. Verify widget URL is accessible from AMPECO backend
5. Check that "Admin user impersonation" is enabled in AMPECO
6. Verify `frame-ancestors` includes AMPECO tenant URL

### JWT Verification Fails

**Symptoms:** 401 error, "JWT verification failed"

**Solutions:**

1. Check that `AMPECO_BASE_DOMAIN` is correct
2. Verify API token is valid
3. Ensure widget URL in AMPECO matches your deployment URL
4. Check that "Admin user impersonation" is enabled in AMPECO
5. Check public key endpoint is accessible
6. Verify JWT token format is correct
7. Check token expiration (tokens expire after 12 hours)

### API Calls Fail

**Symptoms:** API returns 401 or 403 errors

**Solutions:**

1. Verify `AMPECO_API_TOKEN` is correct
2. Check that JWT token includes `impersonate: true`
3. Verify authorization header format: `Bearer {api_token}:{jwt_token}`
4. Check API endpoint URL is correct (use `/public-api/resources/`)
5. Check if the API endpoint is correct and accessible

### Data Not Filtered

**Symptoms:** Widget shows data user shouldn't see

**Solutions:**

1. Verify "Admin user impersonation" is enabled
2. Check JWT includes `impersonate: true`
3. Verify authorization header uses impersonation format
4. Test with different user roles
