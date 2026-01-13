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
        <div className="px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">
              Authentication error. Please ensure the widget is loaded from
              AMPECO backend.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout searchParams={params}>
      <div className="px-4 py-8 max-w-md mx-auto">
        <h1>Edit Charge Point</h1>
        <EditChargePointForm />
      </div>
    </DashboardLayout>
  );
}
