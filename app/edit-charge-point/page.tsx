/**
 * Edit Charge Point Page
 *
 * Page for editing charge point resources
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EditChargePointForm } from "./components/EditChargePointForm";

interface EditResourcePageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function EditResourcePage({
  searchParams,
}: EditResourcePageProps) {
  const params = await searchParams;
  return (
    <DashboardLayout searchParams={params}>
      <div className="max-w-md mx-auto">
        <EditChargePointForm />
      </div>
    </DashboardLayout>
  );
}
