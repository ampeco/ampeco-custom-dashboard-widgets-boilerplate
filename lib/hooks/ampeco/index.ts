/**
 * AMPECO TanStack Query Hooks
 *
 * Modular hooks for fetching and mutating AMPECO API data.
 * Import from this file for backward compatibility, or import
 * specific hooks from their individual files for better tree-shaking.
 *
 * @example
 * ```tsx
 * // Import all hooks
 * import { useChargePoints, useSessions } from "@/lib/hooks/ampeco";
 *
 * // Or import from specific files for better tree-shaking
 * import { useChargePoints } from "@/lib/hooks/ampeco/use-charge-points";
 * ```
 */

// Query keys
export { ampecoKeys } from "./query-keys";

// Charge Points hooks
export {
  useChargePoints,
  useChargePoint,
  useCreateChargePoint,
  useUpdateChargePoint,
  useDeleteChargePoint,
} from "./use-charge-points";

// Sessions hooks
export { useSessions } from "./use-sessions";

// Utilities
export { getTokenFromUrl, appendTokenToUrl } from "./utils";
