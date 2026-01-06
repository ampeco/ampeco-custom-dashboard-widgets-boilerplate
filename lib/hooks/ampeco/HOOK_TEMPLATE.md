# Creating a New Hook

To create a new hook for a new AMPECO API resource, follow this template:

## Template Structure

```typescript
/**
 * TanStack Query hooks for {Resource Name}
 *
 * Hooks for fetching and mutating {resource} data from AMPECO API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { ApiResponse, {ResourceType} } from "@/lib/services/ampeco-api";
import { appendTokenToUrl } from "./utils";

/**
 * Query keys for {resource}
 * Each hook file defines its own query keys for better modularity
 */
const {resource}Keys = {
  all: ["ampeco", "{resource}"] as const,
  lists: () => [...{resource}Keys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...{resource}Keys.lists(), params] as QueryKey,
  details: () => [...{resource}Keys.all, "detail"] as const,
  detail: (id: string) => [...{resource}Keys.details(), id] as QueryKey,
};

/**
 * Hook to fetch {resource} list
 */
export function use{ResourceName}(params?: {
  page?: number;
  per_page?: number;
  // Add other filter params
}) {
  return useQuery<ApiResponse<{ResourceType}[]>, Error>({
    queryKey: {resource}Keys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.per_page)
        searchParams.set("per_page", params.per_page.toString());
      // Add other params

      let url = `/api/{resource}/v1.0${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch {resource}: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch a single {resource} by ID
 */
export function use{ResourceName}(id: string) {
  return useQuery<{ResourceType}, Error>({
    queryKey: {resource}Keys.detail(id),
    queryFn: async () => {
      let url = `/api/{resource}/v1.0/${id}`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch {resource}: ${response.statusText}`);
      }
      return response.json();
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Hook to create a {resource}
 */
export function useCreate{ResourceName}() {
  const queryClient = useQueryClient();

  return useMutation<{ResourceType}, Error, Partial<{ResourceType}>>({
    mutationFn: async (data) => {
      let url = "/api/{resource}/v1.0";
      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to create {resource}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate list to refetch
      queryClient.invalidateQueries({
        queryKey: {resource}Keys.lists(),
      });
    },
  });
}

/**
 * Hook to update a {resource}
 */
export function useUpdate{ResourceName}() {
  const queryClient = useQueryClient();

  return useMutation<
    {ResourceType},
    Error,
    { id: string; data: Partial<{ResourceType}> }
  >({
    mutationFn: async ({ id, data }) => {
      let url = `/api/{resource}/v1.0/${id}`;
      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`Failed to update {resource}: ${response.statusText}`);
      }
      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate specific item and list
      queryClient.invalidateQueries({
        queryKey: {resource}Keys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: {resource}Keys.lists(),
      });
    },
  });
}

/**
 * Hook to delete a {resource}
 */
export function useDelete{ResourceName}() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      let url = `/api/{resource}/v1.0/${id}`;
      url = appendTokenToUrl(url);

      const response = await fetch(url, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Failed to delete {resource}: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      // Invalidate list
      queryClient.invalidateQueries({
        queryKey: {resource}Keys.lists(),
      });
    },
  });
}
```

## Steps to Create a New Hook

1. Copy `use-charge-points.ts` as a template
2. Replace all occurrences of:
   - `ChargePoint` → Your resource type
   - `charge-points` → Your resource endpoint
   - `chargePoint` → Your resource variable name
   - `chargePointKeys` → Your resource keys name
3. Update the API endpoint version if needed (e.g., `v1.0`, `v2.1`)
4. Add/remove query parameters as needed
5. Export the hooks from `index.ts`

## Example: Creating EVSE Hooks

```typescript
// File: lib/hooks/ampeco/use-evses.ts

import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { ApiResponse, Evse } from "@/lib/services/ampeco-api";
import { appendTokenToUrl } from "./utils";

const evseKeys = {
  all: ["ampeco", "evses"] as const,
  lists: () => [...evseKeys.all, "list"] as const,
  list: (params?: Record<string, unknown>) =>
    [...evseKeys.lists(), params] as QueryKey,
  details: () => [...evseKeys.all, "detail"] as const,
  detail: (id: string) => [...evseKeys.details(), id] as QueryKey,
};

export function useEvses(params?: {
  page?: number;
  per_page?: number;
  charge_point_id?: string;
}) {
  return useQuery<ApiResponse<Evse[]>, Error>({
    queryKey: evseKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set("page", params.page.toString());
      if (params?.per_page)
        searchParams.set("per_page", params.per_page.toString());
      if (params?.charge_point_id)
        searchParams.set("charge_point_id", params.charge_point_id);

      let url = `/api/evses/v2.1${
        searchParams.toString() ? `?${searchParams.toString()}` : ""
      }`;
      url = appendTokenToUrl(url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch evses: ${response.statusText}`);
      }
      return response.json();
    },
    staleTime: 30 * 1000,
  });
}
```

