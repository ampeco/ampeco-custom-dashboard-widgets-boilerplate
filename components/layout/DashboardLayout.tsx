/**
 * Dashboard Layout Component
 *
 * Main layout for full-width dashboard with navigation
 */

import { ReactNode } from "react";
import { getTokenFromSearchParams } from "@/lib/utils/preserve-token";
import { MainNavigation } from "../ui/MainNavigation";

interface DashboardLayoutProps {
  children: ReactNode;
  searchParams?: { [key: string]: string | string[] | undefined };
}

export function DashboardLayout({
  children,
  searchParams,
}: DashboardLayoutProps) {
  const token = searchParams ? getTokenFromSearchParams(searchParams) : null;

  return (
    <div className="min-h-screen p-4">
      <MainNavigation token={token} />
      <div className="mt-4">{children}</div>
    </div>
  );
}
