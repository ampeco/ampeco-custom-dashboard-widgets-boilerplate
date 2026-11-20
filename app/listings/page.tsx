/**
 * Listings Page
 *
 * Displays paginated, sortable tables of charge points and sessions
 * Uses client-side pagination with TanStack Query
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ListingsClient } from "./components/ListingsClient";

interface ListingsPageProps {
  searchParams: Promise<{
    token?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function ListingsPage({
  searchParams,
}: ListingsPageProps) {
  const params = await searchParams;
  return (
    <DashboardLayout searchParams={params}>
      <ListingsClient />
    </DashboardLayout>
  );
}
