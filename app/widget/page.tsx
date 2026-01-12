/**
 * Widget Page
 *
 * Single metric widget with auto-refresh (for 1/3 or 2/3 width display)
 */

"use client";

import { useEffect } from "react";
import { useGet } from "@/lib/hooks";
import { WidgetLayout } from "@/components/layout/WidgetLayout";
import { Card } from "@ampeco/ampeco-ui";
import { autoAdjustHeight } from "@/lib/utils/iframe-communication";
import { getAmpecoBaseDomain } from "@/lib/config/ampeco";

export default function WidgetPage() {
  // Fetch active sessions using generic hook with auto-refresh
  const {
    data: sessionsResponse,
    isLoading,
    error,
  } = useGet(
    "/api/sessions/v1.0",
    { status: "active", per_page: 100 },
    {
      refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    }
  );

  // Extract sessions array from response (handle both ApiResponse format and direct arrays)
  const sessions =
    sessionsResponse &&
    typeof sessionsResponse === "object" &&
    "data" in sessionsResponse &&
    Array.isArray(sessionsResponse.data)
      ? sessionsResponse.data
      : Array.isArray(sessionsResponse)
      ? sessionsResponse
      : [];

  const activeSessions = sessions.length;

  useEffect(() => {
    // Auto-adjust iframe height
    const baseDomain = getAmpecoBaseDomain();
    if (baseDomain) {
      autoAdjustHeight(`https://${baseDomain}`);
    }
  }, []);

  return (
    <WidgetLayout>
      <Card header="Active Sessions" showHeader>
        {isLoading ? (
          <div className="text-3xl font-bold text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-sm text-red-600">
            {error instanceof Error ? error.message : "Failed to load"}
          </div>
        ) : (
          <div className="text-4xl font-bold text-blue-600">
            {activeSessions}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">Currently charging</p>
      </Card>
    </WidgetLayout>
  );
}
