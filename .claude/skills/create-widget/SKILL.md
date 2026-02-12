---
name: create-widget
description: |
  Interactive skill for scaffolding new widget pages in the AMPECO Custom Dashboard
  Widgets Boilerplate. Guides through requirements gathering, API endpoint selection,
  and generates production-ready code following codebase patterns.
  Trigger keywords: "create widget", "new widget", "scaffold widget", "add widget page"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Create Widget Skill

This skill helps you create new widget pages for the AMPECO Custom Dashboard Widgets Boilerplate.

---

## Workflow

Follow these 5 steps in order:

### Step 1: Requirements Gathering

Ask the user these questions using `AskUserQuestion`:

**Question 1**: What type of widget do you want to create?
- **Dashboard** - Full page with KPI cards and charts (uses DashboardLayout)
- **Listing** - Paginated data table with search/filter (uses DashboardLayout + SmartTable)
- **Form** - Create or edit resources with validation (uses DashboardLayout + react-hook-form)
- **Widget** - Compact single metric widget for 1/3 or 2/3 width display (uses WidgetLayout)

**Question 2**: What data should this widget display?
- Sessions (charging sessions, consumption stats)
- Charge Points (infrastructure, status monitoring)
- Users (customer management)
- Transactions (payments, billing)
- Other (let user specify)

**Question 3**: What should the route be named?
- Suggest a kebab-case name based on their data choice (e.g., `active-sessions`, `charge-point-status`)

### Step 2: API Endpoint Selection

Use the `ampeco-public-api` skill to find the right endpoint:

1. Read `.claude/skills/ampeco-public-api/SKILL.md` for quick reference
2. Read `.claude/skills/ampeco-public-api/reference/endpoints-index.md` for full endpoint list
3. Present relevant endpoints to the user and confirm their choice
4. Note the endpoint path and version (e.g., `sessions/v1.0`, `charge-points/v2.0`)

**Common Endpoints:**
| Data Type | Endpoint | Version |
|-----------|----------|---------|
| Sessions | `/api/sessions/v1.0` | v1.0 |
| Charge Points | `/api/charge-points/v1.0` | v1.0, v2.0 |
| Users | `/api/users/v1.0` | v1.0, v1.1 |
| EVSEs | `/api/evses/v2.0` | v2.0, v2.1 |
| Locations | `/api/locations/v1.0` | v1.0, v2.0 |
| Transactions | `/api/transactions/v1.0` | v1.0 |

### Step 3: Generate Files

Based on the widget type, create the following files:

| Widget Type | Files to Create |
|-------------|-----------------|
| Dashboard | `app/{name}/page.tsx` + `app/{name}/components/{Name}Client.tsx` |
| Listing | `app/{name}/page.tsx` + `app/{name}/components/{Name}Client.tsx` |
| Form | `app/{name}/page.tsx` + `app/{name}/components/{Name}Form.tsx` |
| Widget | `app/{name}/page.tsx` (single client component file) |

Use the templates below, customizing:
- Route name (kebab-case for folders)
- Component name (PascalCase)
- API endpoint path
- Data fields and display logic

### Step 4: Verify Generated Code

After generating files:
1. Run `npm run dev` to verify no build errors
2. Check that the new route is accessible at `http://localhost:3000/{route-name}?token=...`
3. Confirm imports resolve correctly

### Step 5: Registration Guidance

Explain to the user how to register their widget in AMPECO:

1. **Deploy the widget** to a publicly accessible URL (Vercel, AWS, etc.)
2. **In AMPECO Back Office**, go to **Marketplace > Custom Widgets**
3. **Create a new widget** with:
   - **Name**: A descriptive name for the widget
   - **URL**: `https://your-domain.com/{route-name}`
   - **Width**: 1/3, 2/3, or Full (depending on widget type)
   - **Resource Type**: Dashboard, Charge Point, User, etc.
4. **Enable impersonation** if the widget needs user-scoped data filtering
5. **Add to a dashboard** to see it in action

---

## Templates

### Dashboard Template

**Server Component: `app/{name}/page.tsx`**

```tsx
/**
 * {Name} Dashboard Page
 *
 * {Description of what this dashboard displays}
 */

import { getJwtContext } from "@/lib/auth/get-jwt-context";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { {Name}Client } from "./components/{Name}Client";
import { Message } from "@ampeco/ampeco-ui";

interface {Name}PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function {Name}Page({
  searchParams,
}: {Name}PageProps) {
  const params = await searchParams;
  const jwtContext = await getJwtContext();

  if (!jwtContext) {
    return (
      <DashboardLayout searchParams={params}>
        <Message text="Authentication error. Please ensure the widget is loaded from AMPECO backend." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchParams={params}>
      <{Name}Client />
    </DashboardLayout>
  );
}
```

**Client Component: `app/{name}/components/{Name}Client.tsx`**

```tsx
"use client";

/**
 * {Name} Client Component
 *
 * Client-side component with TanStack Query data fetching
 */

import { useGet } from "@/lib/hooks";
import { Card, Loader, Message } from "@ampeco/ampeco-ui";
import { ApiResponse } from "@/lib/services/api";

export function {Name}Client() {
  const {
    data: response,
    isLoading,
    error,
  } = useGet("/api/{endpoint}", {
    per_page: 100,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader size="sm" />
      </div>
    );
  }

  if (error) {
    return (
      <Message
        text={
          "Error loading data: " +
          (error instanceof Error ? error.message : "Unknown error")
        }
      />
    );
  }

  const data =
    (response as ApiResponse<Record<string, unknown>[]>)?.data || [];
  const total =
    (response as ApiResponse<Record<string, unknown>[]>)?.meta?.total || 0;

  return (
    <div className="grid md:grid-cols-12 gap-4">
      {/* KPI Card - Full width */}
      <Card header="Total Items" showFooter={false} className="md:col-span-12">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{total}</span>
          <span className="ml-2 text-sm text-gray-500">items</span>
        </div>
      </Card>

      {/* Add more cards and charts as needed */}
    </div>
  );
}
```

---

### Listing Template

**Server Component: `app/{name}/page.tsx`**

```tsx
/**
 * {Name} Listing Page
 *
 * Displays paginated table of {description}
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJwtContext } from "@/lib/auth/get-jwt-context";
import { {Name}Client } from "./components/{Name}Client";
import { Message } from "@ampeco/ampeco-ui";

interface {Name}PageProps {
  searchParams: Promise<{
    token?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function {Name}Page({
  searchParams,
}: {Name}PageProps) {
  const params = await searchParams;
  const jwtContext = await getJwtContext();

  if (!jwtContext) {
    return (
      <DashboardLayout searchParams={params}>
        <Message text="Authentication error. Please ensure the widget is loaded from AMPECO backend." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchParams={params}>
      <{Name}Client />
    </DashboardLayout>
  );
}
```

**Client Component: `app/{name}/components/{Name}Client.tsx`**

```tsx
"use client";

/**
 * {Name} Client Component
 *
 * Client-side component for displaying paginated data table
 */

import { useState } from "react";
import { useGet } from "@/lib/hooks";
import { SmartTable, Pagination, Loader, Message } from "@ampeco/ampeco-ui";
import { ApiResponse } from "@/lib/services/api";

export function {Name}Client() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const {
    data: response,
    isLoading,
    error,
  } = useGet("/api/{endpoint}", {
    page,
    per_page: perPage,
  });

  const data =
    (response as ApiResponse<Record<string, unknown>[]>)?.data || [];
  const total =
    (response as ApiResponse<Record<string, unknown>[]>)?.meta?.total || 0;

  // Define table columns
  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    // Add more columns based on your data
  ];

  return (
    <div className="mb-12">
      <h2>{Name}</h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size="sm" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-12">
          <Message
            text={
              "Error loading data: " +
              (error instanceof Error ? error.message : "Unknown error")
            }
          />
        </div>
      ) : (
        <>
          <p>
            Showing {data.length} item(s) of {total}
          </p>

          {data.length === 0 ? (
            <div className="py-8 text-center text-lg">No items found</div>
          ) : (
            <SmartTable data={data} columns={columns} />
          )}

          {total > perPage && (
            <div className="p-4 flex items-center justify-center">
              <Pagination
                page={page}
                totalItems={total}
                pageSize={perPage}
                onChange={(newPage) => setPage(newPage)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

---

### Form Template

**Server Component: `app/{name}/page.tsx`**

```tsx
/**
 * {Name} Form Page
 *
 * Form for creating/editing {description}
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { {Name}Form } from "./components/{Name}Form";
import { getJwtContext } from "@/lib/auth/get-jwt-context";
import { Message } from "@ampeco/ampeco-ui";

interface {Name}PageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function {Name}Page({ searchParams }: {Name}PageProps) {
  const params = await searchParams;
  const jwtContext = await getJwtContext();

  if (!jwtContext) {
    return (
      <DashboardLayout searchParams={params}>
        <Message text="Authentication error. Please ensure the widget is loaded from AMPECO backend." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchParams={params}>
      <{Name}Form />
    </DashboardLayout>
  );
}
```

**Client Component: `app/{name}/components/{Name}Form.tsx`**

```tsx
"use client";

/**
 * {Name} Form Component
 *
 * Form with react-hook-form and zod validation
 */

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { usePost, usePatch } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Input,
  Select,
  Message,
} from "@ampeco/ampeco-ui";
import type { SelectOption } from "@ampeco/ampeco-ui";

// Zod validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  status: z.string().min(1, "Please select a status"),
  // Add more fields as needed
});

type FormData = z.infer<typeof formSchema>;

const statusOptions: SelectOption<string>[] = [
  { label: "Select a status", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

interface {Name}FormProps {
  initialData?: FormData;
  id?: string;
}

export function {Name}Form({ initialData, id }: {Name}FormProps) {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const createMutation = usePost("/api/{endpoint}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ampeco", "api", "/api/{endpoint}"] });
      setSubmitSuccess(true);
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Failed to create");
      setSubmitSuccess(false);
    },
  });

  const updateMutation = usePatch("/api/{endpoint}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ampeco", "api", "/api/{endpoint}"] });
      setSubmitSuccess(true);
      setSubmitError(null);
    },
    onError: (error) => {
      setSubmitError(error instanceof Error ? error.message : "Failed to update");
      setSubmitSuccess(false);
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      status: "",
    },
  });

  const watchedValues = useWatch({ control });

  const onSubmit = async (data: FormData) => {
    if (id) {
      await updateMutation.mutateAsync({ id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleReset = () => {
    reset();
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  return (
    <Card showHeader={false} showFooter={false}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Name"
            inputType="text"
            placeholder="Enter name"
            value={watchedValues.name || ""}
            onChange={(value) => setValue("name", value)}
            error={!!errors.name}
            errorMsg={errors.name?.message}
            required
            className="mb-4"
          />

          <Select
            label="Status"
            value={watchedValues.status || null}
            onChange={(value) => {
              const newValue = Array.isArray(value) ? value[0] : value;
              setValue("status", newValue || "");
            }}
            options={statusOptions}
            error={!!errors.status}
            errorMsg={errors.status?.message}
            required
            className="mb-4"
          />
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" variant="filled" loading={isSubmitting}>
            {id ? "Update" : "Create"}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>

        {submitSuccess && (
          <p className="text-green-600 my-4">
            {id ? "Updated" : "Created"} successfully!
          </p>
        )}

        {submitError && (
          <Message text={submitError} />
        )}
      </form>
    </Card>
  );
}
```

---

### Widget Template (Single File)

**Client Component: `app/{name}/page.tsx`**

```tsx
/**
 * {Name} Widget Page
 *
 * Single metric widget with auto-refresh (for 1/3 or 2/3 width display)
 */

"use client";

import { useEffect } from "react";
import { useGet } from "@/lib/hooks";
import { WidgetLayout } from "@/components/layout/WidgetLayout";
import { Card, Loader, Message } from "@ampeco/ampeco-ui";
import { autoAdjustHeight } from "@/lib/utils/iframe-communication";
import { getAmpecoBaseDomain } from "@/lib/config/ampeco";
import { ApiResponse } from "@/lib/services/api";

export default function {Name}Page() {
  const {
    data: response,
    isLoading,
    error,
  } = useGet(
    "/api/{endpoint}",
    { per_page: 100 },
    {
      refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    }
  );

  const total =
    (response as ApiResponse<Record<string, unknown>[]>)?.meta?.total || 0;

  useEffect(() => {
    const baseDomain = getAmpecoBaseDomain();
    if (baseDomain) {
      autoAdjustHeight(`https://${baseDomain}`);
    }
  }, []);

  return (
    <WidgetLayout>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size="sm" />
        </div>
      ) : error ? (
        <Message
          text={
            "Error loading data: " +
            (error instanceof Error ? error.message : "Unknown error")
          }
        />
      ) : (
        <Card header="{Display Name}" showHeader showFooter={false}>
          <div className="text-4xl font-bold">{total}</div>
        </Card>
      )}
    </WidgetLayout>
  );
}
```

---

## Available UI Components

From `@ampeco/ampeco-ui`:

- **Layout**: `Card`
- **Data Display**: `SmartTable`, `Pagination`, `Loader`, `Message`
- **Forms**: `Input`, `Select`, `Checkbox`, `Radio`, `RadioGroup`, `Toggle`, `DatePicker`, `Textarea`, `Button`

## Available Hooks

From `@/lib/hooks`:

- `useGet(endpoint, params?, options?)` - Fetch data
- `usePost(endpoint, options?)` - Create resources
- `usePatch(endpoint, options?)` - Update resources
- `usePut(endpoint, options?)` - Replace resources
- `useDelete(endpoint, options?)` - Delete resources

## Directory Structure After Scaffolding

```
app/
  {your-widget-name}/
    page.tsx                    # Server component (or client for Widget type)
    components/
      {YourWidgetName}Client.tsx  # Client component (Dashboard/Listing)
      {YourWidgetName}Form.tsx    # Form component (Form type only)
```