# AMPECO Custom Dashboard Widgets Boilerplate

## 0.3.0 (feat/api-integration)

### Added

- **TanStack Query Integration**: Added @tanstack/react-query for efficient data fetching and caching
  - QueryProvider component with default configuration
  - Custom hooks for AMPECO API (useChargePoints, useSessions, useChargePoint, etc.)
  - React Query DevTools in development mode
  - Query key factory for consistent cache management
- **Documentation**: Updated INTEGRATION_GUIDE.md with TanStack Query usage examples and best practices

### Changed

- **Dashboard Components**: Replaced custom KPICard component with Card from @ampeco/ampeco-ui
- **Next.js 16 Compatibility**: Updated all page components to handle async searchParams (Next.js 16 requirement)
- **Git Configuration**: Updated .gitignore to allow .env.example file to be committed

### Fixed

- Fixed linting errors in dashboard page (JSX in try/catch warnings)
- Fixed TypeScript type issues with React type version mismatches
- Improved error handling structure in dashboard page

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
