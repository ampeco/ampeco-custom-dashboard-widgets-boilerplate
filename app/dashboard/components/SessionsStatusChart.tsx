"use client";

/**
 * Sessions by Status Chart
 *
 * Displays distribution of sessions by status using a donut chart
 */

import { useMemo } from "react";
import { Chart } from "@ampeco/ampeco-ui";
import type { ApexOptions } from "apexcharts";

interface SessionsStatusChartProps {
  sessions: Record<string, unknown>[];
}

export function SessionsStatusChart({ sessions }: SessionsStatusChartProps) {
  const chartData = useMemo(() => {
    // Count sessions by status
    const statusCounts = new Map<string, number>();

    sessions.forEach((session) => {
      if (
        session &&
        typeof session === "object" &&
        "status" in session &&
        typeof session.status === "string"
      ) {
        const status = session.status || "unknown";
        const current = statusCounts.get(status) || 0;
        statusCounts.set(status, current + 1);
      }
    });

    // Convert to arrays and sort by count (descending)
    const sortedEntries = Array.from(statusCounts.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    return {
      labels: sortedEntries.map(([status]) => {
        // Capitalize first letter
        return status.charAt(0).toUpperCase() + status.slice(1);
      }),
      data: sortedEntries.map(([, count]) => count),
      statuses: sortedEntries.map(([status]) => status),
    };
  }, [sessions]);

  const options: ApexOptions = {
    chart: {
      id: "sessions-status-chart",
      toolbar: {
        show: false,
      },
    },
    labels: chartData.labels,
    colors: ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
    legend: {
      position: "bottom",
      fontSize: "14px",
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return `${val.toFixed(1)}%`;
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "16px",
              fontWeight: 600,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              formatter: (val: string) => {
                return val;
              },
            },
            total: {
              show: true,
              label: "Total Sessions",
              fontSize: "14px",
              fontWeight: 600,
              formatter: () => {
                return sessions.length.toString();
              },
            },
          },
        },
      },
    },
    tooltip: {
      y: {
        formatter: (val: number) => {
          return `${val} session${val !== 1 ? "s" : ""}`;
        },
      },
    },
  };

  const series = chartData.data;

  if (chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No session data available
      </div>
    );
  }

  return (
    <Chart
      type="donut"
      options={options}
      series={series}
      height={250}
      width="100%"
    />
  );
}
