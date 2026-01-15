"use client";

/**
 * Power Consumption Chart
 *
 * Displays power consumption over time using a line chart
 */

import { useMemo } from "react";
import { Chart } from "@ampeco/ampeco-ui";
import type { ApexOptions } from "apexcharts";

interface PowerConsumptionChartProps {
  sessions: Record<string, unknown>[];
}

export function PowerConsumptionChart({
  sessions,
}: PowerConsumptionChartProps) {
  const chartData = useMemo(() => {
    // Group sessions by date and average power consumption
    const powerByDate = new Map<string, { total: number; count: number }>();

    sessions.forEach((session) => {
      if (
        session &&
        typeof session === "object" &&
        ("lastUpdatedAt" in session || "startedAt" in session)
      ) {
        // Use lastUpdatedAt if available, otherwise startedAt
        const timestamp = session.lastUpdatedAt || session.startedAt;

        // Get power value - try power.latest first, then powerKw
        let power = 0;
        if (
          "power" in session &&
          session.power &&
          typeof session.power === "object" &&
          "latest" in session.power
        ) {
          power = Number(session.power.latest) || 0;
        } else if ("powerKw" in session) {
          power = Number(session.powerKw) || 0;
        }

        if (typeof timestamp === "string" && power > 0) {
          try {
            const date = new Date(timestamp);
            const dateKey = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            const current = powerByDate.get(dateKey) || { total: 0, count: 0 };
            powerByDate.set(dateKey, {
              total: current.total + power,
              count: current.count + 1,
            });
          } catch {
            // Skip invalid dates
          }
        }
      }
    });

    // Calculate averages and sort by date
    const sortedEntries = Array.from(powerByDate.entries())
      .map(
        ([date, { total, count }]) => [date, total / count] as [string, number]
      )
      .sort((a, b) => a[0].localeCompare(b[0]));

    return {
      categories: sortedEntries.map(([date]) => date),
      data: sortedEntries.map(([, avgPower]) => Number(avgPower.toFixed(2))),
    };
  }, [sessions]);

  const options: ApexOptions = {
    chart: {
      id: "power-consumption-chart",
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
        text: "Power (kW)",
      },
      labels: {
        formatter: (value) => {
          return `${value.toFixed(1)} kW`;
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },

    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} kW`,
      },
    },
    colors: ["#0ea5e9"],
  };

  const series = [
    {
      name: "Power Consumption",
      data: chartData.data,
    },
  ];

  if (chartData.categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No power consumption data available
      </div>
    );
  }

  return (
    <Chart
      type="line"
      options={options}
      series={series}
      height={250}
      width="100%"
    />
  );
}
