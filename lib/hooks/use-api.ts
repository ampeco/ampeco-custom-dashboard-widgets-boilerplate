/**
 * Generic API Hooks
 *
 * Universal hooks for making API calls to AMPECO API.
 * These hooks can be used with any endpoint by passing the URL and parameters.
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import { appendTokenToUrl } from "./utils";

/**
 * Generic query key factory for any API endpoint
 */
function createQueryKey(
  endpoint: string,
  params?: Record<string, unknown>
): QueryKey {
  return ["ampeco", "api", endpoint, params] as QueryKey;
}

/**
 * Generic GET hook for fetching data from any AMPECO API endpoint
 *
 * @example
 * ```tsx
 * const { data, isLoading } = useGet(
 *   "/api/charge-points/v1.0",
 *   { page: 1, per_page: 10 }
 * );
 * ```
 */
export function useGet<T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | boolean>,
  options?: Omit<UseQueryOptions<T, Error>, "queryKey" | "queryFn">
) {
  return useQuery<T, Error>({
    queryKey: createQueryKey(endpoint, params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.set(key, String(value));
          }
        });
      }

      let url = `${endpoint}${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds default
    ...options,
  });
}

/**
 * Generic POST hook for creating resources
 *
 * @example
 * ```tsx
 * const createMutation = usePost(
 *   "/api/charge-points/v1.0",
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ["ampeco", "api", "/api/charge-points/v1.0"] });
 *     }
 *   }
 * );
 * createMutation.mutate({ name: "New Charge Point", status: "offline" });
 * ```
 */
export function usePost<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (data) => {
      const url = appendTokenToUrl(endpoint);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create: ${response.statusText}`);
      }
      return response.json();
    },
    ...options,
  });
}

/**
 * Generic PATCH hook for updating resources
 *
 * @example
 * ```tsx
 * const updateMutation = usePatch(
 *   "/api/charge-points/v1.0",
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ["ampeco", "api", "/api/charge-points/v1.0"] });
 *     }
 *   }
 * );
 * updateMutation.mutate({ id: "123", data: { status: "online" } });
 * ```
 */
export function usePatch<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      // For PATCH, we expect variables to have { id, data } or just data
      // If it's an object with id, we append it to the endpoint
      let url = endpoint;
      let body: unknown;

      if (
        typeof variables === "object" &&
        variables !== null &&
        "id" in variables &&
        "data" in variables
      ) {
        // Format: { id: string, data: T }
        url = `${endpoint}/${(variables as { id: string }).id}`;
        body = (variables as { data: unknown }).data;
      } else {
        // Format: just the data
        body = variables;
      }

      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Failed to update: ${response.statusText}`);
      }
      return response.json();
    },
    ...options,
  });
}

/**
 * Generic PUT hook for replacing resources
 *
 * @example
 * ```tsx
 * const replaceMutation = usePut(
 *   "/api/charge-points/v1.0",
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ["ampeco", "api", "/api/charge-points/v1.0"] });
 *     }
 *   }
 * );
 * replaceMutation.mutate({ id: "123", data: resourceData });
 * ```
 */
export function usePut<TData = unknown, TVariables = unknown>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      // For PUT, we expect variables to have { id, data } or just data
      let url = endpoint;
      let body: unknown;

      if (
        typeof variables === "object" &&
        variables !== null &&
        "id" in variables &&
        "data" in variables
      ) {
        // Format: { id: string, data: T }
        url = `${endpoint}/${(variables as { id: string }).id}`;
        body = (variables as { data: unknown }).data;
      } else {
        // Format: just the data
        body = variables;
      }

      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(`Failed to replace: ${response.statusText}`);
      }
      return response.json();
    },
    ...options,
  });
}

/**
 * Generic DELETE hook for deleting resources
 *
 * @example
 * ```tsx
 * const deleteMutation = useDelete<void, string>(
 *   "/api/charge-points/v1.0",
 *   {
 *     onSuccess: () => {
 *       queryClient.invalidateQueries({ queryKey: ["ampeco", "api", "/api/charge-points/v1.0"] });
 *     }
 *   }
 * );
 * deleteMutation.mutate("123");
 * ```
 */
export function useDelete<TData = void, TVariables = string>(
  endpoint: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn">
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: async (id) => {
      const url = appendTokenToUrl(`${endpoint}/${id}`);

      const response = await fetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.statusText}`);
      }
      // DELETE might return empty body
      if (
        response.status === 204 ||
        response.headers.get("content-length") === "0"
      ) {
        return undefined as TData;
      }
      return response.json();
    },
    ...options,
  });
}
