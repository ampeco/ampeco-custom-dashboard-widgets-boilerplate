"use client";

/**
 * Daily Session Count Chart
 *
 * Displays number of sessions per day using a bar chart
 */

import { useMemo } from "react";
import { Chart } from "@ampeco/ampeco-ui";
import type { ApexOptions } from "apexcharts";

interface DailySessionCountChartProps {
  sessions: Record<string, unknown>[];
}

export function DailySessionCountChart({ sessions }: DailySessionCountChartProps) {
  const chartData = useMemo(() => {
    // Count sessions by date
    const sessionsByDate = new Map<string, number>();

    sessions.forEach((session) => {
      if (
        session &&
        typeof session === "object" &&
        "startedAt" in session
      ) {
        const startedAt = session.startedAt;

        if (typeof startedAt === "string") {
          try {
            const date = new Date(startedAt);
            const dateKey = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            const current = sessionsByDate.get(dateKey) || 0;
            sessionsByDate.set(dateKey, current + 1);
          } catch {
            // Skip invalid dates
          }
        }
      }
    });

    // Sort by date and convert to arrays
    const sortedEntries = Array.from(sessionsByDate.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

    return {
      categories: sortedEntries.map(([date]) => date),
      data: sortedEntries.map(([, count]) => count),
    };
  }, [sessions]);

  const options: ApexOptions = {
    chart: {
      id: "daily-sessions-chart",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    xaxis: {
      categories: chartData.categories,
      title: {
        text: "Date",
      },
    },
    yaxis: {
      title: {
        text: "Number of Sessions",
      },
      labels: {
        formatter: (value) => {
          return Math.floor(value).toString();
        },
      },
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "60%",
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => {
        return Math.floor(val).toString();
      },
      offsetY: -20,
      style: {
        fontSize: "12px",
        colors: ["#304758"],
      },
    },
    tooltip: {
      y: {
        formatter: (value) => {
          return `${value} session${value !== 1 ? "s" : ""}`;
        },
      },
    },
    colors: ["#0ea5e9"],
  };

  const series = [
    {
      name: "Sessions",
      data: chartData.data,
    },
  ];

  if (chartData.categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No session data available
      </div>
    );
  }

  return (
    <Chart
      type="bar"
      options={options}
      series={series}
      height={250}
      width="100%"
    />
  );
}

