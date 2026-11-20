# AMPECO Custom Dashboard Widgets Boilerplate

## 0.6.0 (security fix)

An existing deployment needs no change to keep working after this update. Adding `WIDGET_ORIGIN` is recommended.

### Security

- **Audience validation from configuration**: new optional setting `WIDGET_ORIGIN`, the widget's own public origin (scheme, host and port of the **URL to embed**)
  - When set, a JWT is accepted only if its audience equals `WIDGET_ORIGIN`. The `Origin` request header is not used, and `localhost`, `127.0.0.1` and development mode are not exempt
  - When not set, the audience check of earlier versions is kept and the server logs a warning at startup. In that mode a token issued for another widget on the same tenant can be accepted, so set `WIDGET_ORIGIN`
  - For local development set `WIDGET_ORIGIN=http://localhost:3000` and register the widget with a `http://localhost:3000/...` URL
- **Token delivery by postMessage**: the widget now accepts the JWT through the AMPECO delivery channel **postMessage**, which keeps the token out of the URL. Query parameter delivery keeps working
  - A page opened without a token asks the parent window for it and accepts it only from the tenant origin and the parent window
  - A page opened without a token is served without authentication and holds no data. It shows "JWT token is required..." after 3 seconds without a token, instead of an HTTP 401 response
  - Every request to `/api/*` still requires a valid token
- Requests from the hooks in `lib/hooks` to `/api/*` carry the token in the `Authorization` header instead of the URL, in both delivery channels. `appendTokenToUrl` and `preserveToken` are unchanged
- JWT context headers (`x-ampeco-*`) sent by a caller are removed from page requests without a token
- `getApiService().request()` now throws when the request has no validated JWT, instead of calling AMPECO with the API token alone. A page can be requested without a token, so a Server Component that fetches data must not return unfiltered data to an anonymous caller
- A request to `/api/*` whose path ends in a static file extension (for example `.js`) no longer skips JWT validation

### Check when updating a fork

- A Server Component of yours that renders data from another source than `getApiService()` (your own database, another API) was protected by the middleware rejecting every page request without a token. Pages are now served without a token. Keep or add a `getJwtContext()` check in such a component, as the example pages had before this version

### Changed

- The tenant's signing keys are reused across requests for one hour instead of being set up again on every request. The API token is no longer sent to the tenant's public JWKS endpoint
- Pages no longer check for the JWT on the server. `WidgetTokenProvider` in `app/layout.tsx` renders page content once the widget has a token
- Removed the `node-cache` dependency
- Integration guide, setup, deploy and create-widget skills updated for `WIDGET_ORIGIN` and both delivery channels

## 0.5.1 (feat/changed-jwt-payload)

- Updated JWT payload to include `admin_id` instead of `user_id`
- Updated JWT verification endpoint to use `/.well-known/jwks.json` instead of `/api/v1/marketplace/public-key`
- Fixed security vulnerabilities in Next.js by updating from 16.0.10 to 16.1.6
  - Fixed DoS vulnerability via Image Optimizer remotePatterns configuration
  - Fixed unbounded memory consumption via PPR Resume Endpoint
  - Fixed HTTP request deserialization DoS when using insecure React Server Components

## 0.5.0

### Added

- **Comprehensive Documentation**: Complete documentation overhaul
  - README.md: Added deploy button setup instructions
  - INTEGRATION_GUIDE.md: Added comprehensive integration guide with examples and patterns
  - CLAUDE.md: Added AI development context

### Cleaned up

- Removed unused environment variables from .env.example
- Removed unused server actions

## 0.4.0 (feat/example-pages)

### Added

- **Dashboard Charts**: Demonstration of different chart types and how to use the Card component from @ampeco/ampeco-ui
  - Layout using Tailwind CSS grid system
  - Card component implementation from @ampeco/ampeco-ui
  - Sessions by Status (Donut Chart) - Visual distribution of session statuses
  - Energy Delivered Over Time (Area Chart) - Groups sessions by date and displays energy consumption
  - Revenue Over Time (Line Chart) - Revenue trends grouped by date
  - Daily Session Count (Bar Chart) - Number of sessions per day
  - Power Consumption (Line Chart) - Average power consumption over time
- **Sessions Table**: Added sessions table to listings page using SmartTable from @ampeco/ampeco-ui
  - Displays ID Tag, Status, Started At, Duration, Energy, and Revenue
  - Formatted date/time, duration calculation, and currency display
  - Independent pagination from charge points table
- **Client-Side Pagination**: Client-side pagination using TanStack Query
  - No page refreshes when navigating between pages
  - Uses Pagination component from @ampeco/ampeco-ui
  - Independent pagination state for charge points and sessions
- **Loading States**: Added Loader component from @ampeco/ampeco-ui
  - Consistent loading indicators across the application
  - Centered display with proper spacing
- **Demo Form**: Comprehensive form demonstration with react-hook-form and zod validation
  - Demonstrates all major form components from @ampeco/ampeco-ui:
    - Input (text, email, tel, password)
    - Textarea
    - Select dropdowns
    - Checkboxes
    - Radio buttons with RadioGroup
    - Toggle switches
    - DatePicker
  - Full zod schema validation with error messages
  - Form reset functionality
  - Displays submitted data in JSON format
- **Form Libraries**: Added react-hook-form, zod, and @hookform/resolvers
  - Type-safe form handling
  - Schema-based validation
  - Easy integration with @ampeco/ampeco-ui components
- **Edit Charge Point Form**: Form for editing charge point resources
  - Select charge point from dropdown or via URL parameter
  - Automatic form prefilling when charge point is selected
  - Uses react-hook-form and zod validation
  - Integrated with API using usePatch hook for PATCH requests
  - Supports status options: active, disabled, out of order, demo
  - Query invalidation on successful update
  - Loading and error states with Loader and Message components
- **Edit Charge Point Page**: Dedicated page at `/edit-charge-point` for editing charge points
  - Linked in navigation bar
  - Supports URL parameter (`?id={chargePointId}`) for direct charge point selection
  - Automatic form population when navigating from listings
- **Charge Point Name Links**: Made charge point names in listings table clickable
  - Names link to edit charge point page with charge point ID
  - Preserves JWT token in URL
  - Auto-prefills form when navigating from listings table

### Changed

- **Listings Page**: Converted to client-side component with TanStack Query
  - Removed server-side data fetching
  - Added client-side pagination with Pagination component
  - Improved loading and error states with Loader and Message components
- **Dashboard**: Enhanced with multiple chart visualizations
  - Replaced placeholder charts with functional ApexCharts implementations
  - Data grouping and aggregation for time-series charts
  - Status distribution visualization
- **Form Page**: Added DemoForm with comprehensive form demonstration
  - Demonstrates all available form components
  - Shows best practices for form validation
- **Navigation**: Added "Edit Charge Point" link to navigation bar
  - Provides quick access to charge point editing functionality
- **Listings Table**: Charge point names are now clickable links
  - Direct navigation to edit page with charge point pre-selected
  - Improved user experience for editing charge points
- **UI Components**: All components use design system components from @ampeco/ampeco-ui

### Fixed

- Fixed pagination to use client-side state management
- Improved error handling with Message component from @ampeco/ampeco-ui
- Enhanced loading states with proper Loader component usage

## 0.3.0 (feat/api-integration)

### Added

- **TanStack Query Integration**: Added @tanstack/react-query for efficient data fetching and caching
  - QueryProvider component with default configuration
  - Generic API hooks (useGet, usePost, usePatch, usePut, useDelete) for any endpoint
  - React Query DevTools in development mode
  - Unified hook structure for easy API integration
- **Unified API Route Handler**: Created catch-all route `/api/[...path]/route.ts` that handles all AMPECO API requests dynamically
  - Supports GET, POST, PATCH, PUT, DELETE methods
  - Automatic query parameter parsing (numbers, booleans, strings)
  - Works with any AMPECO API endpoint without code changes
- **Hook Template Guide**: Created HOOK_TEMPLATE.md with complete template and examples for creating new hooks
  - Step-by-step instructions
  - Self-contained hook structure
  - Example implementations

### Changed

- **Next.js 16 Compatibility**: Updated all page components to handle async searchParams (Next.js 16 requirement)
- **Git Configuration**: Updated .gitignore to allow .env.example file to be committed

### Fixed

- Fixed linting errors in dashboard page (JSX in try/catch warnings)
- Fixed TypeScript type issues with React type version mismatches

## 0.2.0 (feat/config-and-auth)

### Added

- **JWT Authentication System**: Complete JWT verification and validation
  - ES256 algorithm support with public key verification
  - JWKS (JSON Web Key Set) format support
  - Public key caching with 1-hour TTL
  - Audience validation with development mode bypass for localhost
  - Clock tolerance for token expiration (30 seconds)
- **Configuration Management**: Centralized configuration system
  - Environment variable validation
  - AMPECO URL construction helpers
  - Domain normalization (handles URLs with/without protocol)
  - JWT algorithm and settings configuration
- **Next.js Middleware**: JWT token extraction and verification middleware
  - Extracts token from query parameter or Authorization header
  - Validates JWT and stores context in request headers
  - Skips static files and health check endpoints
  - Provides user-friendly error messages
- **API Service**: AMPECO API client with impersonation support
  - Automatic JWT impersonation when `impersonate: true`
  - TypeScript interfaces for ChargePoint, Session, EVSE resources
  - Pagination and filtering support
  - Error handling and response typing
- **JWT Context Helpers**: Utilities for accessing JWT data in Server Components
  - `getJwtContext()` - Retrieves user ID, app ID, widget ID, etc.
  - `getJwtToken()` - Gets JWT token for API impersonation
  - Type-safe JWT context interface
- **Token Preservation**: JWT token query parameter now persists across all navigation links
  - Utility functions for preserving token in URLs
  - Updated all navigation components to maintain token parameter
- **Error Handling**: Centralized error handling utilities
  - `formatApiError()` for consistent error message formatting
- **Security Headers**: Content Security Policy and security headers configuration
  - CSP with frame-ancestors for AMPECO domains
  - XSS protection, HSTS, and other security headers

### Changed

- **Environment Variables**: Added comprehensive environment variable support
  - `AMPECO_BASE_DOMAIN` - AMPECO tenant domain
  - `AMPECO_API_TOKEN` - API token for authentication
  - Validation on application startup

## 0.1.0

- Next.js initial setup
