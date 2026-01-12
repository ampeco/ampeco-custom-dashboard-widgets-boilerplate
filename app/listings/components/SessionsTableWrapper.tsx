"use client";

/**
 * Sessions Table Wrapper Component
 *
 * Client component wrapper for SmartTable from @ampeco/ampeco-ui
 * Displays session data in a table format
 */

import { SmartTable } from "@ampeco/ampeco-ui";

// Generic row type with rowId and computed fields for SmartTable
type SessionRowWithId = Record<string, unknown> & {
  rowId: string;
  // Add computed fields for display
  dateDisplay: string;
  durationDisplay: string;
  energyDisplay: string;
  revenueDisplay: string;
};

interface SessionsTableWrapperProps {
  data: unknown[];
}

export function SessionsTableWrapper({ data }: SessionsTableWrapperProps) {
  // Transform data to include rowId and computed fields
  const rows: SessionRowWithId[] = data.map((item) => {
    const record = item as Record<string, unknown>;
    const id = record.id?.toString() || "";

    // Format date
    let dateDisplay = "N/A";
    if (record.startedAt && typeof record.startedAt === "string") {
      try {
        const date = new Date(record.startedAt);
        dateDisplay = date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch {
        dateDisplay = record.startedAt.toString();
      }
    }

    // Calculate duration
    let durationDisplay = "N/A";
    if (
      record.startedAt &&
      typeof record.startedAt === "string" &&
      record.stoppedAt &&
      typeof record.stoppedAt === "string"
    ) {
      try {
        const start = new Date(record.startedAt);
        const stop = new Date(record.stoppedAt);
        const diffMs = stop.getTime() - start.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        if (hours > 0) {
          durationDisplay = `${hours}h ${mins}m`;
        } else {
          durationDisplay = `${mins}m`;
        }
      } catch {
        durationDisplay = "N/A";
      }
    } else if (record.startedAt && typeof record.startedAt === "string") {
      durationDisplay = "Active";
    }

    // Format energy
    let energyDisplay = "0 kWh";
    if (record.energy !== undefined && record.energy !== null) {
      const energy = Number(record.energy) || 0;
      energyDisplay = `${energy.toFixed(2)} kWh`;
    }

    // Format revenue
    let revenueDisplay = "$0.00";
    if (
      record.totalAmount &&
      typeof record.totalAmount === "object" &&
      "withTax" in record.totalAmount
    ) {
      const revenue = Number(record.totalAmount.withTax) || 0;
      revenueDisplay = `$${revenue.toFixed(2)}`;
    } else if (record.amount !== undefined && record.amount !== null) {
      const revenue = Number(record.amount) || 0;
      revenueDisplay = `$${revenue.toFixed(2)}`;
    }

    return {
      ...record,
      rowId: id,
      dateDisplay,
      durationDisplay,
      energyDisplay,
      revenueDisplay,
    } as SessionRowWithId;
  });

  // Configure headers
  const headers = [
    {
      key: "idTag" as keyof SessionRowWithId,
      label: "ID Tag",
    },
    {
      key: "status" as keyof SessionRowWithId,
      label: "Status",
    },
    {
      key: "dateDisplay" as keyof SessionRowWithId,
      label: "Started At",
    },
    {
      key: "durationDisplay" as keyof SessionRowWithId,
      label: "Duration",
    },
    {
      key: "energyDisplay" as keyof SessionRowWithId,
      label: "Energy",
    },
    {
      key: "revenueDisplay" as keyof SessionRowWithId,
      label: "Revenue",
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

