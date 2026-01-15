"use server";

/**
 * Server Actions for Form Operations
 *
 * Handles create and update operations for charge points
 */

import { getApiService } from "@/lib/services/api";
import { getJwtToken } from "@/lib/auth/get-jwt-context";
import { revalidatePath } from "next/cache";

export interface FormState {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Creates a new charge point
 */
export async function createChargePoint(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const jwtToken = await getJwtToken();
    if (!jwtToken) {
      return {
        error:
          "Authentication required. Please ensure the widget is loaded from AMPECO backend.",
      };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const status = formData.get("status") as string;

    // Validate
    const errors: Record<string, string> = {};
    if (!name || name.trim().length === 0) {
      errors.name = "Name is required";
    }
    if (!status) {
      errors.status = "Status is required";
    }

    if (Object.keys(errors).length > 0) {
      return { fieldErrors: errors };
    }

    // Create charge point
    const apiService = getApiService();
    await apiService.request("charge-points/v1.0", {
      method: "POST",
      body: {
        name: name.trim(),
        status: status,
      },
    });

    revalidatePath("/form");
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to create charge point. Please try again.",
    };
  }
}

/**
 * Updates an existing charge point
 */
export async function updateChargePoint(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    const jwtToken = await getJwtToken();
    if (!jwtToken) {
      return {
        error:
          "Authentication required. Please ensure the widget is loaded from AMPECO backend.",
      };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const status = formData.get("status") as string;

    // Validate
    const errors: Record<string, string> = {};
    if (!name || name.trim().length === 0) {
      errors.name = "Name is required";
    }
    if (!status) {
      errors.status = "Status is required";
    }

    if (Object.keys(errors).length > 0) {
      return { fieldErrors: errors };
    }

    // Update charge point
    const apiService = getApiService();
    await apiService.request(`charge-points/v1.0/${id}`, {
      method: "PATCH",
      body: {
        name: name.trim(),
        status: status,
      },
    });

    revalidatePath("/form");
    return { success: true };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to update charge point. Please try again.",
    };
  }
}
