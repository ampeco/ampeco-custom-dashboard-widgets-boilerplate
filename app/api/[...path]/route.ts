import { NextRequest, NextResponse } from "next/server";
import { getAmpecoApiService } from "@/lib/services/ampeco-api";

/**
 * Unified API Route Handler
 *
 * Handles all AMPECO API requests dynamically:
 * - GET /api/charge-points/v1.0
 * - GET /api/charge-points/v1.0/{id}
 * - POST /api/charge-points/v1.0
 * - PATCH /api/charge-points/v1.0/{id}
 * - DELETE /api/charge-points/v1.0/{id}
 * - GET /api/sessions/v1.0
 * - GET /api/sessions/v1.0/{id}
 * - GET /api/evses/v2.1
 * - GET /api/evses/v2.1/{id}
 * - And any other AMPECO API endpoint
 */

interface RouteParams {
  path: string[];
}

/**
 * GET handler - Fetch resources
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { path } = await params;
    const endpoint = path.join("/");

    // Debug logging
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
      console.log("[Unified API Route: GET]");
      console.log("  Path segments:", path);
      console.log("  Endpoint:", endpoint);
      console.log("  Full URL:", request.nextUrl.toString());
    }

    const apiService = getAmpecoApiService();
    const searchParams = request.nextUrl.searchParams;

    // Convert search params to object
    const queryParams: Record<string, string | number | boolean> = {};
    searchParams.forEach((value, key) => {
      // Try to parse as number or boolean, otherwise keep as string
      if (value === "true" || value === "false") {
        queryParams[key] = value === "true";
      } else if (!isNaN(Number(value)) && value !== "") {
        queryParams[key] = Number(value);
      } else {
        queryParams[key] = value;
      }
    });

    if (isDevelopment) {
      console.log("  Query params:", queryParams);
    }

    const response = await apiService.customRequest(endpoint, {
      method: "GET",
      params: queryParams,
    });

    return NextResponse.json(response);
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error fetching ${endpoint}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `Failed to fetch ${endpoint}`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST handler - Create resources
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { path } = await params;
    const endpoint = path.join("/");
    const apiService = getAmpecoApiService();
    const body = await request.json();

    const response = await apiService.customRequest(endpoint, {
      method: "POST",
      body,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error creating ${endpoint}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `Failed to create ${endpoint}`,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH handler - Update resources
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { path } = await params;
    const endpoint = path.join("/");
    const apiService = getAmpecoApiService();
    const body = await request.json();

    const response = await apiService.customRequest(endpoint, {
      method: "PATCH",
      body,
    });

    return NextResponse.json(response);
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error updating ${endpoint}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `Failed to update ${endpoint}`,
      },
      { status: 500 }
    );
  }
}

/**
 * PUT handler - Replace resources
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { path } = await params;
    const endpoint = path.join("/");
    const apiService = getAmpecoApiService();
    const body = await request.json();

    const response = await apiService.customRequest(endpoint, {
      method: "PUT",
      body,
    });

    return NextResponse.json(response);
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error replacing ${endpoint}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `Failed to replace ${endpoint}`,
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler - Delete resources
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const { path } = await params;
    const endpoint = path.join("/");
    const apiService = getAmpecoApiService();

    await apiService.customRequest(endpoint, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error deleting ${endpoint}:`, error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : `Failed to delete ${endpoint}`,
      },
      { status: 500 }
    );
  }
}
