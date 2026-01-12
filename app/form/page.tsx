/**
 * Form Page
 *
 * Displays form for creating/editing charge points
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DemoForm } from "./components/DemoForm";
import { getJwtContext } from "@/lib/auth/get-jwt-context";

interface FormPageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function FormPage({ searchParams }: FormPageProps) {
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
      <div className="px-4 py-8">
        <h1>Form Demo</h1>
        <DemoForm />
      </div>
    </DashboardLayout>
  );
}
