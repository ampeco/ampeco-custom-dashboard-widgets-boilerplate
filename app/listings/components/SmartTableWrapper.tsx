"use client";

/**
 * SmartTable Wrapper Component
 *
 * Client component wrapper for SmartTable from @ampeco/ampeco-ui
 */

import { SmartTable } from "@ampeco/ampeco-ui";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { preserveToken } from "@/lib/utils/preserve-token";

// Generic row type with rowId and computed fields for SmartTable
type RowWithId = Record<string, unknown> & {
  rowId: string;
  // Add computed fields for display
  locationDisplay: string;
  connectorsDisplay: string;
  nameLink: React.ReactNode;
};

interface SmartTableWrapperProps {
  data: unknown[];
}

export function SmartTableWrapper({ data }: SmartTableWrapperProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Transform data to include rowId and computed fields
  const rows: RowWithId[] = data.map((item) => {
    const record = item as Record<string, unknown>;
    const id = record.id?.toString() || "";
    const name = record.name?.toString() || `Charge Point ${id}`;
    const connectors = Array.isArray(record.connectors)
      ? record.connectors
      : [];
    const location =
      record.location && typeof record.location === "object"
        ? (record.location as Record<string, unknown>)
        : null;
    const address = location?.address?.toString() || "N/A";
    const count = connectors.length;

    // Create link to edit charge point page with charge point ID
    const editUrl = preserveToken(`/edit-charge-point?id=${id}`, token);

    return {
      ...record,
      rowId: id,
      locationDisplay: address,
      connectorsDisplay: `${count} connector${count !== 1 ? "s" : ""}`,
      nameLink: (
        <Link
          href={editUrl}
          // className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          {name}
        </Link>
      ),
    } as RowWithId;
  });

  // Configure headers
  const headers = [
    {
      key: "nameLink" as keyof RowWithId,
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
