/**
 * Listings Page
 *
 * Displays paginated, sortable tables of charge points and sessions
 * Uses client-side pagination with TanStack Query
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getJwtContext } from "@/lib/auth/get-jwt-context";
import { ListingsClient } from "./components/ListingsClient";
import { Message } from "@ampeco/ampeco-ui";

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
      <ListingsClient />
    </DashboardLayout>
  );
}
