/**
 * TanStack Query keys for AMPECO API
 *
 * Centralized query key factory for consistent cache management
 */

/**
 * Query key factory for AMPECO API resources
 */
export const ampecoKeys = {
  all: ["ampeco"] as const,
  chargePoints: () => [...ampecoKeys.all, "charge-points"] as const,
  chargePoint: (id: string) => [...ampecoKeys.chargePoints(), id] as const,
  chargePointsList: (params?: Record<string, unknown>) =>
    [...ampecoKeys.chargePoints(), "list", params] as const,
  sessions: () => [...ampecoKeys.all, "sessions"] as const,
  session: (id: string) => [...ampecoKeys.sessions(), id] as const,
  sessionsList: (params?: Record<string, unknown>) =>
    [...ampecoKeys.sessions(), "list", params] as const,
};
