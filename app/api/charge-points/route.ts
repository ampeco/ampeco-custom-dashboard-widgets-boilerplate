import { NextRequest, NextResponse } from "next/server";
import { getAmpecoApiService } from "@/lib/services/ampeco-api";
import { getJwtContext } from "@/lib/auth/get-jwt-context";

/**
 * GET /api/charge-points
 * Fetches charge points from AMPECO API
 */
export async function GET(request: NextRequest) {
  try {
    // Debug logging
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
      console.log("[API Route: GET /api/charge-points]");
      console.log(
        "  Query Params:",
        Object.fromEntries(request.nextUrl.searchParams)
      );
    }

    // Check JWT context
    const jwtContext = await getJwtContext();

    if (isDevelopment && jwtContext) {
      console.log("  JWT Context Available:");
      console.log("    User ID:", jwtContext.userId);
      console.log("    App ID:", jwtContext.appId);
      console.log("    Widget ID:", jwtContext.widgetId);
      console.log("    Impersonate:", jwtContext.impersonate);
      console.log("    JWT Token Present:", jwtContext.jwtToken ? "yes" : "no");
      console.log("    Tenant URL:", jwtContext.tenantUrl);
    } else if (isDevelopment) {
      console.log(
        "  ⚠️  WARNING: JWT Context is NULL - authentication may fail!"
      );
    }

    const apiService = getAmpecoApiService();
    const searchParams = request.nextUrl.searchParams;

    const params: {
      page?: number;
      per_page?: number;
      status?: string;
      search?: string;
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
    if (searchParams.has("search")) {
      params.search = searchParams.get("search") || undefined;
    }

    const response = await apiService.getChargePoints(params);

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
      console.error("[API Route Error: GET /api/charge-points]");
      console.error("  Error:", error);
      if (error instanceof Error) {
        console.error("  Message:", error.message);
        console.error("  Stack:", error.stack);
      }
    } else {
      console.error("Error fetching charge points:", error);
    }
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch charge points",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/charge-points
 * Creates a new charge point
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiService = getAmpecoApiService();
    const chargePoint = await apiService.createChargePoint(body);

    return NextResponse.json(chargePoint, { status: 201 });
  } catch (error) {
    console.error("Error creating charge point:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create charge point",
      },
      { status: 500 }
    );
  }
}
