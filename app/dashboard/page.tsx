/**
 * Dashboard Page
 *
 * Main dashboard with KPI cards and charts displaying
 * data from AMPECO API using TanStack Query
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DashboardClient } from "./components/DashboardClient";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  return (
    <DashboardLayout searchParams={params}>
      <DashboardClient />
    </DashboardLayout>
  );
}
