/**
 * TanStack Query hooks for Sessions
 *
 * Hooks for fetching session data from AMPECO API
 */

import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { ApiResponse, Session } from "@/lib/services/ampeco-api";
import { appendTokenToUrl } from "./utils";

/**
 * Query keys for sessions
 */
const sessionKeys = {
  all: ["ampeco", "sessions"] as const,
  lists: () => [...sessionKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...sessionKeys.lists(), params] as QueryKey,
  details: () => [...sessionKeys.all, "detail"] as const,
  detail: (id: string) => [...sessionKeys.details(), id] as QueryKey,
};

/**
 * Hook to fetch sessions
 */
export function useSessions(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  charge_point_id?: string;
  start_date?: string;
  end_date?: string;
}) {
  return useQuery<ApiResponse<Session[]>, Error>({
    queryKey: sessionKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.per_page)
        searchParams.set("per_page", params.per_page.toString());
      if (params?.status) searchParams.set("status", params.status);
      if (params?.charge_point_id)
        searchParams.set("charge_point_id", params.charge_point_id);
      if (params?.start_date) searchParams.set("start_date", params.start_date);
      if (params?.end_date) searchParams.set("end_date", params.end_date);

      let url = `/api/sessions/v1.0${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch sessions: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
