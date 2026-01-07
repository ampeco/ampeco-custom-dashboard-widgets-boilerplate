/**
 * AMPECO TanStack Query Hooks
 *
 * Generic hooks for fetching and mutating AMPECO API data.
 * Import from this file for convenience, or import specific hooks
 * from their individual files for better tree-shaking.
 *
 * @example
 * ```tsx
 * // Option 1: Import generic hooks
 * import { useGet, usePost, usePatch, useDelete } from "@/lib/hooks";
 *
 * // Option 2: Import from specific files for better tree-shaking
 * import { useGet } from "@/lib/hooks/use-api";
 * ```
 */

// Generic API hooks
export { useGet, usePost, usePatch, usePut, useDelete } from "./use-api";

// Utilities
export { getTokenFromUrl, appendTokenToUrl } from "./utils";

