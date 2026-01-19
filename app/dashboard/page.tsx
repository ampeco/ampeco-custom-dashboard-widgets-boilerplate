/**
 * Dashboard Page
 *
 * Main dashboard with KPI cards and charts displaying
 * data from AMPECO API using TanStack Query
 */

import { getJwtContext } from "@/lib/auth/get-jwt-context";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardClient } from "./components/DashboardClient";
import { Message } from "@ampeco/ampeco-ui";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const jwtContext = await getJwtContext();

  if (!jwtContext) {
    return (
      <DashboardLayout searchParams={params}>
        <Message text="Authentication error. Please ensure the widget is loaded from AMPECO backend." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchParams={params}>
      <DashboardClient />
    </DashboardLayout>
  );
}
