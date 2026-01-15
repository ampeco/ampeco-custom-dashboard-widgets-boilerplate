/**
 * Chart Card Component
 *
 * Wrapper for charts with title and optional loading state
 */

import { Card } from "@ampeco/ampeco-ui";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
  isLoading?: boolean;
}

export function ChartCard({
  title,
  children,
  isLoading = false,
}: ChartCardProps) {
  return (
    <Card
      header={title}
      showHeader={!!title}
      showFooter={false}
      showDivider={false}
    >
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading chart...</div>
        </div>
      ) : (
        <>{children}</>
      )}
    </Card>
  );
}
