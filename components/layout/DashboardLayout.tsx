/**
 * Dashboard Layout Component
 *
 * Main layout for full-width dashboard with navigation
 */

import { ReactNode } from "react";
import Link from "next/link";
import {
  preserveToken,
  getTokenFromSearchParams,
} from "@/lib/utils/preserve-token";

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
    <div className="min-h-screen">
      {/* Navigation */}
      <nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-16">
            <h1 className="text-xl font-bold mr-4">AMPECO Custom Widget</h1>
            <div className="flex items-center gap-4">
              <Link href={preserveToken("/dashboard", token)}>Dashboard</Link>
              <Link href={preserveToken("/listings", token)}>Listings</Link>
              <Link href={preserveToken("/form", token)}>Form Demo</Link>
              <Link href={preserveToken("/edit-charge-point", token)}>
                Edit Charge Point
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
