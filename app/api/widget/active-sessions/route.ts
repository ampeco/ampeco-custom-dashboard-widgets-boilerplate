/**
 * API Route for Widget Active Sessions
 *
 * Server-side endpoint for fetching active sessions count
 * Used by the widget page client component
 */

import { NextResponse } from "next/server";
import { getAmpecoApiService } from "@/lib/services/ampeco-api";
import { getJwtToken } from "@/lib/auth/get-jwt-context";
import { formatApiError } from "@/lib/utils/error-handler";

export async function GET() {
  try {
    const jwtToken = await getJwtToken();

    if (!jwtToken) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const apiService = getAmpecoApiService();
    const response = await apiService.getSessions({
      status: "active",
      per_page: 100,
    });

    const activeSessions = response.data || [];

    return NextResponse.json({
      count: activeSessions.length,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: formatApiError(error),
      },
      { status: 500 }
    );
  }
}

