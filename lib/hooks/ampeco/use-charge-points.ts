/**
 * TanStack Query hooks for Charge Points
 *
 * Hooks for fetching and mutating charge point data from AMPECO API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ApiResponse, ChargePoint } from "@/lib/services/ampeco-api";
import { ampecoKeys } from "./query-keys";
import { appendTokenToUrl } from "./utils";

/**
 * Hook to fetch charge points
 */
export function useChargePoints(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  search?: string;
}) {
  return useQuery<ApiResponse<ChargePoint[]>, Error>({
    queryKey: ampecoKeys.chargePointsList(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.per_page)
        searchParams.set("per_page", params.per_page.toString());
      if (params?.status) searchParams.set("status", params.status);
      if (params?.search) searchParams.set("search", params.search);

      let url = `/api/charge-points${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch charge points: ${response.statusText}`
        );
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single charge point by ID
 */
export function useChargePoint(id: string) {
  return useQuery<ChargePoint, Error>({
    queryKey: ampecoKeys.chargePoint(id),
    queryFn: async () => {
      let url = `/api/charge-points/${id}`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch charge point: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create a charge point
 */
export function useCreateChargePoint() {
  const queryClient = useQueryClient();

  return useMutation<ChargePoint, Error, Partial<ChargePoint>>({
    mutationFn: async (data) => {
      let url = "/api/charge-points";
      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to create charge point: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate charge points list to refetch
      queryClient.invalidateQueries({
        queryKey: ampecoKeys.chargePoints(),
      });
    },
  });
}

/**
 * Hook to update a charge point
 */
export function useUpdateChargePoint() {
  const queryClient = useQueryClient();

  return useMutation<
    ChargePoint,
    Error,
    { id: string; data: Partial<ChargePoint> }
  >({
    mutationFn: async ({ id, data }) => {
      let url = `/api/charge-points/${id}`;
      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to update charge point: ${response.statusText}`
        );
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific charge point and list
      queryClient.invalidateQueries({
        queryKey: ampecoKeys.chargePoint(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ampecoKeys.chargePoints(),
      });
    },
  });
}

/**
 * Hook to delete a charge point
 */
export function useDeleteChargePoint() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      let url = `/api/charge-points/${id}`;
      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          `Failed to delete charge point: ${response.statusText}`
        );
      }
    },
    onSuccess: () => {
      // Invalidate charge points list
      queryClient.invalidateQueries({
        queryKey: ampecoKeys.chargePoints(),
      });
    },
  });
}

