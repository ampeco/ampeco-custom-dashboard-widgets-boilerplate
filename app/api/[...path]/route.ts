import { NextRequest, NextResponse } from "next/server";
import { getApiService } from "@/lib/services/api";
import { ApiRequestError, ApiUnreachableError } from "@/lib/utils/api-error";

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
 * Answers a failed call with the status that says what actually happened
 *
 * | What happened                                  | Status           |
 * | ---------------------------------------------- | ---------------- |
 * | AMPECO answered with an error status           | the same status  |
 * | AMPECO could not be reached, or did not answer | 502              |
 * | Any other error in the widget server           | 500              |
 *
 * A request without a valid widget token never reaches here: the middleware
 * answers it with 401.
 *
 * The body keeps its shape, `{ "error": "<message>" }`, and carries AMPECO's
 * field validation errors as `errors` when it returned them, so a form can
 * show them next to its fields.
 */
function errorResponse(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiRequestError) {
    return NextResponse.json(
      error.errors
        ? { error: error.message, errors: error.errors }
        : { error: error.message },
      { status: error.status }
    );
  }

  if (error instanceof ApiUnreachableError) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json(
    { error: error instanceof Error ? error.message : fallbackMessage },
    { status: 500 }
  );
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

    const apiService = getApiService();
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

    const response = await apiService.request(endpoint, {
      method: "GET",
      params: queryParams,
    });

    return NextResponse.json(response);
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error fetching ${endpoint}:`, error);
    return errorResponse(error, `Failed to fetch ${endpoint}`);
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
    const apiService = getApiService();
    const body = await request.json();

    const response = await apiService.request(endpoint, {
      method: "POST",
      body,
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error creating ${endpoint}:`, error);
    return errorResponse(error, `Failed to create ${endpoint}`);
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
    const apiService = getApiService();
    const body = await request.json();

    const response = await apiService.request(endpoint, {
      method: "PATCH",
      body,
    });

    return NextResponse.json(response);
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error updating ${endpoint}:`, error);
    return errorResponse(error, `Failed to update ${endpoint}`);
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
    const apiService = getApiService();
    const body = await request.json();

    const response = await apiService.request(endpoint, {
      method: "PUT",
      body,
    });

    return NextResponse.json(response);
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error replacing ${endpoint}:`, error);
    return errorResponse(error, `Failed to replace ${endpoint}`);
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
    const apiService = getApiService();

    await apiService.request(endpoint, {
      method: "DELETE",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const { path } = await params;
    const endpoint = path.join("/");
    console.error(`Error deleting ${endpoint}:`, error);
    return errorResponse(error, `Failed to delete ${endpoint}`);
  }
}
