"use client";

import { useGet } from "@/lib/hooks";
import { Card } from "@ampeco/ampeco-ui";
import { EnergyChart } from "./EnergyChart";
import { SessionsStatusChart } from "./SessionsStatusChart";
import { RevenueChart } from "./RevenueChart";
import { DailySessionCountChart } from "./DailySessionCountChart";
import { PowerConsumptionChart } from "./PowerConsumptionChart";
import { ApiResponse } from "@/lib/services/api";

export function DashboardClient() {
  // Fetch data using generic hooks
  const {
    data: chargePointsResponse,
    isLoading: isLoadingChargePoints,
    error: chargePointsError,
  } = useGet("/api/charge-points/v1.0", {
    per_page: 100,
  });

  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useGet("/api/sessions/v1.0", {
    per_page: 100,
  });

  // Show loading state
  if (isLoadingChargePoints || isLoadingSessions) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  // Show error state
  if (chargePointsError || sessionsError) {
    const errorMessage =
      chargePointsError?.message || sessionsError?.message || "Unknown error";
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-red-800 mb-2">
          Error Loading Dashboard
        </h2>
        <p className="text-red-700">{errorMessage}</p>
      </div>
    );
  }

  // Extract data arrays from response (handle both ApiResponse format and direct arrays)
  const chargePoints =
    (chargePointsResponse as ApiResponse<Record<string, unknown>[]>)?.data ||
    [];

  const sessions =
    (sessionsResponse as ApiResponse<Record<string, unknown>[]>)?.data || [];

  const totalSessions =
    (sessionsResponse as ApiResponse<Record<string, unknown>[]>)?.meta?.total ||
    0;

  // Calculate KPIs for charge points by status
  const activeChargePoints = chargePoints.filter(
    (cp) =>
      cp && typeof cp === "object" && "status" in cp && cp.status === "active"
  ).length;
  const disabledChargePoints = chargePoints.filter(
    (cp) =>
      cp && typeof cp === "object" && "status" in cp && cp.status === "disabled"
  ).length;
  const outOfOrderChargePoints = chargePoints.filter(
    (cp) =>
      cp &&
      typeof cp === "object" &&
      "status" in cp &&
      cp.status === "out of order"
  ).length;
  const demoChargePoints = chargePoints.filter(
    (cp) =>
      cp && typeof cp === "object" && "status" in cp && cp.status === "demo"
  ).length;
  const activeSessions = sessions.filter(
    (s) => s && typeof s === "object" && "status" in s && s.status === "active"
  ).length;
  const totalEnergyDelivered = sessions.reduce((sum: number, s) => {
    // Try 'energy' first, then 'energy_delivered' as fallback
    let energy = 0;
    if (s && typeof s === "object") {
      if ("energy" in s) {
        energy = Number(s.energy) || 0;
      } else if ("energy_delivered" in s) {
        energy = Number(s.energy_delivered) || 0;
      }
    }
    return sum + (isNaN(energy) ? 0 : energy);
  }, 0);
  const totalRevenue = sessions.reduce((sum: number, s) => {
    // Try 'totalAmount.withTax' first, then 'amount', then 'cost' as fallback
    let revenue = 0;
    if (s && typeof s === "object") {
      if (
        "totalAmount" in s &&
        s.totalAmount &&
        typeof s.totalAmount === "object" &&
        "withTax" in s.totalAmount
      ) {
        revenue = Number(s.totalAmount.withTax) || 0;
      } else if ("amount" in s) {
        revenue = Number(s.amount) || 0;
      } else if ("cost" in s) {
        revenue = Number(s.cost) || 0;
      }
    }
    return sum + (isNaN(revenue) ? 0 : revenue);
  }, 0);

  return (
    <div className="grid md:grid-cols-12 gap-4">
      {/* 2/3 width */}
      <Card
        header="Active Sessions"
        showFooter={false}
        className="md:col-span-8"
      >
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{activeSessions}</span>
          <span className="ml-2 text-sm text-gray-500">currently charging</span>
        </div>
      </Card>

      {/* 1/3 width */}
      <Card
        header="Total Energy Delivered"
        showFooter={false}
        className="md:col-span-4"
      >
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">
            {totalEnergyDelivered.toFixed(2)}
          </span>
          <span className="ml-2 text-sm text-gray-500">kWh</span>
        </div>
      </Card>

      {/* 1/3 width */}
      <Card header="Total Revenue" showFooter={false} className="md:col-span-4">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">${totalRevenue.toFixed(2)}</span>
        </div>
      </Card>

      {/* 2/3 width */}
      <Card
        header="Total Sessions"
        showFooter={false}
        className="md:col-span-8"
      >
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{totalSessions}</span>
          <span className="ml-2 text-sm text-gray-500">
            session{totalSessions !== 1 ? "s" : ""}
          </span>
        </div>
      </Card>

      {/* 1/4 width */}
      <Card
        header="Active Charge Points"
        showFooter={false}
        className="md:col-span-3"
      >
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{activeChargePoints}</span>
          <span className="ml-2 text-sm text-gray-500">
            of {chargePoints.length}
          </span>
        </div>
      </Card>

      {/* 1/4 width */}
      <Card
        header="Disabled Charge Points"
        showFooter={false}
        className="md:col-span-3"
      >
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{disabledChargePoints}</span>
          <span className="ml-2 text-sm text-gray-500">
            of {chargePoints.length}
          </span>
        </div>
      </Card>

      {/* 1/4 width */}
      <Card header="Out of Order" showFooter={false} className="md:col-span-3">
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{outOfOrderChargePoints}</span>
          <span className="ml-2 text-sm text-gray-500">
            of {chargePoints.length}
          </span>
        </div>
      </Card>

      {/* 1/4 width */}
      <Card
        header="Demo Charge Points"
        showFooter={false}
        className="md:col-span-3"
      >
        <div className="flex items-baseline">
          <span className="text-3xl font-bold">{demoChargePoints}</span>
          <span className="ml-2 text-sm text-gray-500">
            of {chargePoints.length}
          </span>
        </div>
      </Card>

      {/* Full width */}
      <Card header="Power Consumption" className="md:col-span-12">
        <PowerConsumptionChart sessions={sessions} />
      </Card>

      {/* 1/2 width */}
      <Card header="Sessions by Status" className="md:col-span-6">
        <SessionsStatusChart sessions={sessions} />
      </Card>

      {/* 1/2 width */}
      <Card header="Energy Delivered Over Time" className="md:col-span-6">
        <EnergyChart sessions={sessions} />
      </Card>

      {/* 1/2 width */}
      <Card header="Revenue Over Time" className="md:col-span-6">
        <RevenueChart sessions={sessions} />
      </Card>

      {/* 1/2 width */}
      <Card header="Daily Session Count" className="md:col-span-6">
        <DailySessionCountChart sessions={sessions} />
      </Card>
    </div>
  );
}
