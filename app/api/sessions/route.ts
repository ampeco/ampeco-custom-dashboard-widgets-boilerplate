import { NextRequest, NextResponse } from "next/server";
import { getAmpecoApiService } from "@/lib/services/ampeco-api";
import { getJwtContext } from "@/lib/auth/get-jwt-context";

/**
 * GET /api/sessions
 * Fetches sessions from AMPECO API
 */
export async function GET(request: NextRequest) {
  try {
    // Debug logging
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
      console.log("[API Route: GET /api/sessions]");
      console.log(
        "  Query Params:",
        Object.fromEntries(request.nextUrl.searchParams)
      );

      // Check JWT context
      const jwtContext = await getJwtContext();
      if (jwtContext) {
        console.log("  JWT Context Available:");
        console.log("    User ID:", jwtContext.userId);
        console.log("    App ID:", jwtContext.appId);
        console.log("    Widget ID:", jwtContext.widgetId);
        console.log("    Impersonate:", jwtContext.impersonate);
        console.log(
          "    JWT Token Present:",
          jwtContext.jwtToken ? "yes" : "no"
        );
        console.log("    Tenant URL:", jwtContext.tenantUrl);
      } else {
        console.log(
          "  ⚠️  WARNING: JWT Context is NULL - authentication may fail!"
        );
      }
    }

    const apiService = getAmpecoApiService();
    const searchParams = request.nextUrl.searchParams;

    const params: {
      page?: number;
      per_page?: number;
      status?: string;
      charge_point_id?: string;
      start_date?: string;
      end_date?: string;
    } = {};

    if (searchParams.has("page")) {
      params.page = parseInt(searchParams.get("page") || "1", 10);
    }
    if (searchParams.has("per_page")) {
      params.per_page = parseInt(searchParams.get("per_page") || "10", 10);
    }
    if (searchParams.has("status")) {
      params.status = searchParams.get("status") || undefined;
    }
    if (searchParams.has("charge_point_id")) {
      params.charge_point_id = searchParams.get("charge_point_id") || undefined;
    }
    if (searchParams.has("start_date")) {
      params.start_date = searchParams.get("start_date") || undefined;
    }
    if (searchParams.has("end_date")) {
      params.end_date = searchParams.get("end_date") || undefined;
    }

    const response = await apiService.getSessions(params);

    if (isDevelopment) {
      console.log(
        "  Response received, data count:",
        response.data?.length || 0
      );
    }

    return NextResponse.json(response);
  } catch (error) {
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
      console.error("[API Route Error: GET /api/sessions]");
      console.error("  Error:", error);
      if (error instanceof Error) {
        console.error("  Message:", error.message);
        console.error("  Stack:", error.stack);
      }
    } else {
      console.error("Error fetching sessions:", error);
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch sessions",
      },
      { status: 500 }
    );
  }
}
