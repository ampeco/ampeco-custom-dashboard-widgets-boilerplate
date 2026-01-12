"use client";

/**
 * Revenue Over Time Chart
 *
 * Displays revenue over time grouped by day
 */

import { useMemo } from "react";
import { Chart } from "@ampeco/ampeco-ui";
import type { ApexOptions } from "apexcharts";

interface RevenueChartProps {
  sessions: Record<string, unknown>[];
}

export function RevenueChart({ sessions }: RevenueChartProps) {
  const chartData = useMemo(() => {
    // Group sessions by date and sum revenue
    const revenueByDate = new Map<string, number>();

    sessions.forEach((session) => {
      if (session && typeof session === "object" && "startedAt" in session) {
        const startedAt = session.startedAt;

        if (typeof startedAt === "string") {
          // Get revenue value - try totalAmount.withTax first, then amount
          let revenue = 0;
          if (
            "totalAmount" in session &&
            session.totalAmount &&
            typeof session.totalAmount === "object" &&
            "withTax" in session.totalAmount
          ) {
            revenue = Number(session.totalAmount.withTax) || 0;
          } else if ("amount" in session) {
            revenue = Number(session.amount) || 0;
          }

          if (revenue > 0) {
            try {
              const date = new Date(startedAt);
              const dateKey = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });

              const current = revenueByDate.get(dateKey) || 0;
              revenueByDate.set(dateKey, current + revenue);
            } catch {
              // Skip invalid dates
            }
          }
        }
      }
    });

    // Sort by date and convert to arrays
    const sortedEntries = Array.from(revenueByDate.entries()).sort((a, b) => {
      return a[0].localeCompare(b[0]);
    });

    return {
      categories: sortedEntries.map(([date]) => date),
      data: sortedEntries.map(([, revenue]) => Number(revenue.toFixed(2))),
    };
  }, [sessions]);

  const options: ApexOptions = {
    chart: {
      id: "revenue-chart",
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
        text: "Revenue",
      },
      labels: {
        formatter: (value) => {
          return `$${value.toFixed(2)}`;
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100],
      },
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
        formatter: (value) => `$${value.toFixed(2)}`,
      },
    },
    colors: ["#10b981"],
  };

  const series = [
    {
      name: "Revenue",
      data: chartData.data,
    },
  ];

  if (chartData.categories.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-full text-gray-500">
        No revenue data available
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
