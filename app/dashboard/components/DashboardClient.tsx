"use client";

import { useGet } from "@/lib/hooks";
import { Card as AmpecoCard } from "@ampeco/ampeco-ui";
import { ChartCard } from "./ChartCard";
import { EnergyChart } from "./EnergyChart";
import { SessionsStatusChart } from "./SessionsStatusChart";
import { RevenueChart } from "./RevenueChart";
import { DailySessionCountChart } from "./DailySessionCountChart";
import { PowerConsumptionChart } from "./PowerConsumptionChart";

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
      <div className="px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (chargePointsError || sessionsError) {
    const errorMessage =
      chargePointsError?.message || sessionsError?.message || "Unknown error";
    return (
      <div className="px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-red-700">{errorMessage}</p>
        </div>
      </div>
    );
  }

  // Extract data arrays from response (handle both ApiResponse format and direct arrays)
  const chargePoints =
    chargePointsResponse &&
    typeof chargePointsResponse === "object" &&
    "data" in chargePointsResponse &&
    Array.isArray(chargePointsResponse.data)
      ? chargePointsResponse.data
      : Array.isArray(chargePointsResponse)
      ? chargePointsResponse
      : [];

  const sessions =
    sessionsResponse &&
    typeof sessionsResponse === "object" &&
    "data" in sessionsResponse &&
    Array.isArray(sessionsResponse.data)
      ? sessionsResponse.data
      : Array.isArray(sessionsResponse)
      ? sessionsResponse
      : [];

  // Calculate KPIs (safely access properties)
  const onlineChargePoints = chargePoints.filter(
    (cp) =>
      cp && typeof cp === "object" && "status" in cp && cp.status === "online"
  ).length;
  const offlineChargePoints = chargePoints.filter(
    (cp) =>
      cp && typeof cp === "object" && "status" in cp && cp.status === "offline"
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
    <>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <AmpecoCard header="Total Charge Points" showFooter={false}>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{chargePoints.length}</span>
            <span className="ml-2 text-sm text-gray-500">points</span>
          </div>
        </AmpecoCard>
        <AmpecoCard header="Online Charge Points" showFooter={false}>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{onlineChargePoints}</span>
            <span className="ml-2 text-sm text-gray-500">
              of {chargePoints.length}
            </span>
          </div>
        </AmpecoCard>
        <AmpecoCard header="Active Sessions" showFooter={false}>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{activeSessions}</span>
            <span className="ml-2 text-sm text-gray-500">
              currently charging
            </span>
          </div>
        </AmpecoCard>
        <AmpecoCard header="Total Energy Delivered" showFooter={false}>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">
              {totalEnergyDelivered.toFixed(2)}
            </span>
            <span className="ml-2 text-sm text-gray-500">kWh</span>
          </div>
        </AmpecoCard>
      </div>

      {/* Additional KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <AmpecoCard header="Offline Charge Points" showFooter={false}>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{offlineChargePoints}</span>
            <span className="ml-2 text-sm text-gray-500">
              of {chargePoints.length}
            </span>
          </div>
        </AmpecoCard>
        <AmpecoCard header="Total Revenue" showFooter={false}>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">
              ${totalRevenue.toFixed(2)}
            </span>
          </div>
        </AmpecoCard>
        <AmpecoCard header="Total Sessions" showFooter={false}>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{sessions.length}</span>
            <span className="ml-2 text-sm text-gray-500">sessions</span>
          </div>
        </AmpecoCard>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Sessions by Status">
          <SessionsStatusChart sessions={sessions} />
        </ChartCard>
        <ChartCard title="Energy Delivered Over Time">
          <EnergyChart sessions={sessions} />
        </ChartCard>
      </div>

      {/* Additional Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard title="Revenue Over Time">
          <RevenueChart sessions={sessions} />
        </ChartCard>
        <ChartCard title="Daily Session Count">
          <DailySessionCountChart sessions={sessions} />
        </ChartCard>
      </div>

      {/* Power Consumption Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Power Consumption">
          <PowerConsumptionChart sessions={sessions} />
        </ChartCard>
      </div>
    </>
  );
}
