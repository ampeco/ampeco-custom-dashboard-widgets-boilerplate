import { NextRequest, NextResponse } from "next/server";
import { getAmpecoApiService } from "@/lib/services/ampeco-api";

/**
 * GET /api/charge-points/[id]
 * Fetches a single charge point by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiService = getAmpecoApiService();
    const chargePoint = await apiService.getChargePoint(id);

    return NextResponse.json(chargePoint);
  } catch (error) {
    console.error("Error fetching charge point:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch charge point",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/charge-points/[id]
 * Updates a charge point
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const apiService = getAmpecoApiService();
    const chargePoint = await apiService.updateChargePoint(id, body);

    return NextResponse.json(chargePoint);
  } catch (error) {
    console.error("Error updating charge point:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update charge point",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/charge-points/[id]
 * Deletes a charge point
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const apiService = getAmpecoApiService();
    await apiService.deleteChargePoint(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting charge point:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete charge point",
      },
      { status: 500 }
    );
  }
}
