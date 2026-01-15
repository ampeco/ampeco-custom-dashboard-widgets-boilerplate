/**
 * Widget Page
 *
 * Single metric widget with auto-refresh (for 1/3 or 2/3 width display)
 */

"use client";

import { useEffect } from "react";
import { useGet } from "@/lib/hooks";
import { WidgetLayout } from "@/components/layout/WidgetLayout";
import { Card, Loader, Message } from "@ampeco/ampeco-ui";
import { autoAdjustHeight } from "@/lib/utils/iframe-communication";
import { getAmpecoBaseDomain } from "@/lib/config/ampeco";
import { ApiResponse } from "@/lib/services/api";

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
  const sessionsTotal =
    (sessionsResponse as ApiResponse<Record<string, unknown>[]>)?.meta?.total ||
    0;

  useEffect(() => {
    // Auto-adjust iframe height
    const baseDomain = getAmpecoBaseDomain();
    if (baseDomain) {
      autoAdjustHeight(`https://${baseDomain}`);
    }
  }, []);

  return (
    <WidgetLayout>
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader size="sm" />
        </div>
      ) : error ? (
        <Message
          text={
            "Error loading sessions: " +
            (error instanceof Error ? error.message : "Unknown error")
          }
        />
      ) : (
        <Card header="Total Sessions" showHeader showFooter={false}>
          <div className="text-4xl font-bold">{sessionsTotal}</div>
        </Card>
      )}
    </WidgetLayout>
  );
}
