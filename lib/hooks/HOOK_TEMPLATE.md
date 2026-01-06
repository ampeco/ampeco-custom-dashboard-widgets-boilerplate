# Creating a New API Call

There are two ways to make API calls in this project:

## Option 1: Use Generic Hooks (Recommended) ⭐

The easiest way is to use the generic hooks (`useGet`, `usePost`, `usePatch`, `usePut`, `useDelete`) directly in your components. No need to create new hook files!

### Example: Using Generic Hooks

```tsx
"use client";

import { useGet, usePost, usePatch, useDelete } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/services/api";

export function ChargePointsList() {
  const queryClient = useQueryClient();

  // GET - Fetch list
  const { data, isLoading } = useGet("/api/charge-points/v1.0", {
    page: 1,
    per_page: 10,
    status: "online",
  });

  // POST - Create
  const createMutation = usePost("/api/charge-points/v1.0", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
    },
  });

  // PATCH - Update
  const updateMutation = usePatch("/api/charge-points/v1.0", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
    },
  });

  // DELETE
  const deleteMutation = useDelete<void, string>("/api/charge-points/v1.0", {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
    },
  });

  const handleCreate = () => {
    createMutation.mutate({ name: "New CP", status: "offline" });
  };

  const handleUpdate = (id: string) => {
    updateMutation.mutate({ id, data: { status: "online" } });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {Array.isArray(data?.data) &&
        data.data.map((cp: any) => (
          <div key={cp?.id}>
            {cp?.name}
            <button onClick={() => handleUpdate(cp?.id)}>Update</button>
            <button onClick={() => handleDelete(cp?.id)}>Delete</button>
          </div>
        ))}
      <button onClick={handleCreate}>Create New</button>
    </div>
  );
}
```

### Benefits of Generic Hooks

- ✅ **No new files needed** - Use directly in components
- ✅ **Works with any endpoint** - Just pass the URL
- ✅ **Automatic token handling** - Token is appended automatically
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Flexible** - Pass any query options or mutation options

## Option 2: Create Resource-Specific Hooks

If you prefer to create custom hooks with specific logic, follow this template:

## Template Structure

```typescript
/**
 * TanStack Query hooks for {Resource Name}
 *
 * Hooks for fetching and mutating {resource} data from AMPECO API
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/services/api";
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
  return useQuery<ApiResponse<unknown[]>, Error>({
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
  return useQuery<unknown, Error>({
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

  return useMutation<unknown, Error, Record<string, unknown>>({
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
    unknown,
    Error,
    { id: string; data: Record<string, unknown> }
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

1. Create a new file: `lib/hooks/use-your-resource.ts`
2. Define query keys locally in the file (see template below)
3. Implement your hooks using `useQuery` or `useMutation` from TanStack Query
4. Use `appendTokenToUrl` from `./utils` for token handling
5. Export the hooks from the file
6. Optionally re-export from `index.ts` for convenience

## Example: Creating EVSE Hooks

```typescript
// File: lib/hooks/use-evses.ts

import { useQuery } from "@tanstack/react-query";
import type { QueryKey } from "@tanstack/react-query";
import type { ApiResponse } from "@/lib/services/api";
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
  return useQuery<ApiResponse<unknown[]>, Error>({
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
