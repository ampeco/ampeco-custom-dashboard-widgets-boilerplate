"use client";

/**
 * SmartTable Wrapper Component
 *
 * Client component wrapper for SmartTable from @ampeco/ampeco-ui
 */

import { SmartTable } from "@ampeco/ampeco-ui";

// Generic row type with rowId and computed fields for SmartTable
type RowWithId = Record<string, unknown> & {
  rowId: string;
  // Add computed fields for display
  locationDisplay: string;
  connectorsDisplay: string;
};

interface SmartTableWrapperProps {
  data: unknown[];
}

export function SmartTableWrapper({ data }: SmartTableWrapperProps) {
  // Transform data to include rowId and computed fields
  const rows: RowWithId[] = data.map((item) => {
    const record = item as Record<string, unknown>;
    const id = record.id?.toString() || "";
    const connectors = Array.isArray(record.connectors)
      ? record.connectors
      : [];
    const location =
      record.location && typeof record.location === "object"
        ? (record.location as Record<string, unknown>)
        : null;
    const address = location?.address?.toString() || "N/A";
    const count = connectors.length;

    return {
      ...record,
      rowId: id,
      locationDisplay: address,
      connectorsDisplay: `${count} connector${count !== 1 ? "s" : ""}`,
    } as RowWithId;
  });

  // Configure headers
  const headers = [
    {
      key: "name" as keyof RowWithId,
      label: "Name",
    },
    {
      key: "status" as keyof RowWithId,
      label: "Status",
    },
    {
      key: "locationDisplay" as keyof RowWithId,
      label: "Location",
    },
    {
      key: "connectorsDisplay" as keyof RowWithId,
      label: "Connectors",
    },
  ];

  return (
    <SmartTable
      rows={rows}
      headers={headers}
      canEdit={false}
      canAdd={false}
      canDelete={false}
      canSelect={false}
      stripped={true}
    />
  );
}
