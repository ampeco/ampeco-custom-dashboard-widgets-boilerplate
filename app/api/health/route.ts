/**
 * Health Check Endpoint
 *
 * Used by deployment platforms to verify the application is running.
 * This endpoint is excluded from JWT authentication.
 */

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ampeco-custom-widget-template",
    },
    { status: 200 }
  );
}

