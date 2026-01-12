"use client";

/**
 * Energy Delivered Over Time Chart
 *
 * Displays energy consumption over time grouped by day
 */

import { useMemo } from "react";
import { Chart } from "@ampeco/ampeco-ui";
import type { ApexOptions } from "apexcharts";

interface EnergyChartProps {
  sessions: Record<string, unknown>[];
}

export function EnergyChart({ sessions }: EnergyChartProps) {
  const chartData = useMemo(() => {
    // Group sessions by date and sum energy
    const energyByDate = new Map<string, number>();

    sessions.forEach((session) => {
      if (
        session &&
        typeof session === "object" &&
        "startedAt" in session &&
        "energy" in session
      ) {
        const startedAt = session.startedAt;
        const energy = session.energy;

        if (
          typeof startedAt === "string" &&
          (typeof energy === "number" || typeof energy === "string")
        ) {
          try {
            const date = new Date(startedAt);
            const dateKey = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
            const energyValue = Number(energy) || 0;

            const current = energyByDate.get(dateKey) || 0;
            energyByDate.set(dateKey, current + energyValue);
          } catch {
            // Skip invalid dates
          }
        }
      }
    });

    // Sort by date and convert to arrays
    const sortedEntries = Array.from(energyByDate.entries()).sort((a, b) => {
      // Simple sort by date string (works for same year)
      return a[0].localeCompare(b[0]);
    });

    return {
      categories: sortedEntries.map(([date]) => date),
      data: sortedEntries.map(([, energy]) => Number(energy.toFixed(2))),
    };
  }, [sessions]);

  const options: ApexOptions = {
    chart: {
      id: "energy-chart",
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
        text: "Energy (kWh)",
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
        gradientToColors: ["#0ea5e9"],
      },
    },
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: ["#0ea5e9"],
      hover: {
        size: 8,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} kWh`,
      },
    },
    colors: ["#0ea5e9"],
  };

  const series = [
    {
      name: "Energy Delivered",
      data: chartData.data,
    },
  ];

  if (chartData.categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No energy data available
      </div>
    );
  }

  return (
    <Chart
      type="area"
      options={options}
      series={series}
      height={250}
      width="100%"
    />
  );
}
