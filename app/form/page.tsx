/**
 * Form Page
 *
 * Displays form for creating/editing charge points
 */

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DemoForm } from "./components/DemoForm";

interface FormPageProps {
  searchParams: Promise<{
    id?: string;
    token?: string;
    [key: string]: string | string[] | undefined;
  }>;
}

export default async function FormPage({ searchParams }: FormPageProps) {
  const params = await searchParams;
  return (
    <DashboardLayout searchParams={params}>
      <DemoForm />
    </DashboardLayout>
  );
}
