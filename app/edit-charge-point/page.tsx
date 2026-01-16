/**
 * Edit Charge Point Page
 *
 * Page for editing charge point resources
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { EditChargePointForm } from "./components/EditChargePointForm";
import { getJwtContext } from "@/lib/auth/get-jwt-context";

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
  const jwtContext = await getJwtContext();

  if (!jwtContext) {
    return (
      <DashboardLayout searchParams={params}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            Authentication error. Please ensure the widget is loaded from AMPECO
            backend.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchParams={params}>
      <div className="max-w-md mx-auto">
        <EditChargePointForm />
      </div>
    </DashboardLayout>
  );
}
