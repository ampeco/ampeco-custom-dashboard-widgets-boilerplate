"use client";

/**
 * Edit Charge Point Form Component
 *
 * Form for editing charge point resources using PATCH request
 */

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  Input,
  Select,
  Message,
  Loader,
} from "@ampeco/ampeco-ui";
import type { SelectOption } from "@ampeco/ampeco-ui";
import { useState, useEffect } from "react";
import { useGet, usePatch } from "@/lib/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { ApiResponse } from "@/lib/services/api";

// Zod validation schema for charge point
const chargePointSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
});

type ChargePointFormData = z.infer<typeof chargePointSchema>;

// Status options
const statusOptions: SelectOption<string>[] = [
  { label: "Select a status", value: "" },
  { label: "Active", value: "active" },
  { label: "Disabled", value: "disabled" },
  { label: "Out of order", value: "out of order" },
  { label: "Demo", value: "demo" },
];

export function EditChargePointForm() {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams.get("id");

  // Initialize with URL param if present, otherwise allow manual selection
  const [selectedChargePointId, setSelectedChargePointId] = useState<
    string | null
  >(idFromUrl || null);
  const [submittedData, setSubmittedData] =
    useState<ChargePointFormData | null>(null);
  const queryClient = useQueryClient();

  // When URL param changes, update state (e.g., navigating from listings)
  // Using a key-based approach: when idFromUrl changes, we'll rely on the query to refetch
  // and the form will be repopulated via the useEffect below

  // Fetch charge points list for selection
  const {
    data: chargePointsResponse,
    isLoading: isLoadingChargePoints,
    error: chargePointsError,
  } = useGet("/api/charge-points/v1.0", {
    per_page: 100,
  });

  // Extract charge points array
  const chargePoints =
    (chargePointsResponse as ApiResponse<Record<string, unknown>[]>)?.data ||
    [];

  // Use URL param if available, otherwise use selectedChargePointId from state
  const chargePointIdToFetch = idFromUrl || selectedChargePointId;

  // Fetch selected charge point details
  const {
    data: selectedChargePoint,
    isLoading: isLoadingSelected,
    error: selectedError,
  } = useGet(
    chargePointIdToFetch
      ? `/api/charge-points/v1.0/${chargePointIdToFetch}`
      : "",
    {},
    {
      enabled: !!chargePointIdToFetch,
    }
  );

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    reset,
  } = useForm<ChargePointFormData>({
    resolver: zodResolver(chargePointSchema),
    defaultValues: {
      name: "",
      status: "",
    },
  });

  const watchedValues = useWatch({ control });

  // Update form when charge point data is loaded
  useEffect(() => {
    if (selectedChargePoint && chargePointIdToFetch) {
      // Handle both direct object and wrapped in data property
      let name = "";
      let status = "";

      if (
        selectedChargePoint &&
        typeof selectedChargePoint === "object" &&
        "data" in selectedChargePoint &&
        selectedChargePoint.data &&
        typeof selectedChargePoint.data === "object"
      ) {
        // Response wrapped in data property
        const cpData = selectedChargePoint.data as Record<string, unknown>;
        name = (cpData.name as string) || "";
        status = (cpData.status as string) || "";
      } else {
        // Direct response
        const cp = selectedChargePoint as Record<string, unknown>;
        name = (cp.name as string) || "";
        status = (cp.status as string) || "";
      }

      // Populate form fields with charge point data
      setValue("name", name, { shouldValidate: false });
      setValue("status", status, { shouldValidate: false });
    }
  }, [selectedChargePoint, chargePointIdToFetch, setValue]);

  // PATCH mutation
  const updateMutation = usePatch<
    unknown,
    { id: string; data: ChargePointFormData }
  >("/api/charge-points/v1.0", {
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({
        queryKey: ["ampeco", "api", "/api/charge-points/v1.0"],
      });
      const idToInvalidate = idFromUrl || selectedChargePointId;
      if (idToInvalidate) {
        queryClient.invalidateQueries({
          queryKey: [
            "ampeco",
            "api",
            `/api/charge-points/v1.0/${idToInvalidate}`,
          ],
        });
      }
      setSubmittedData(watchedValues as ChargePointFormData);
    },
  });

  const onSubmit = async (data: ChargePointFormData) => {
    const idToUpdate = idFromUrl || selectedChargePointId;
    if (!idToUpdate) {
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: idToUpdate,
        data,
      });
    } catch (error) {
      console.error("Failed to update charge point:", error);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedChargePointId(null);
    setSubmittedData(null);
  };

  // Charge point selection options
  const chargePointOptions: SelectOption<string>[] = [
    { label: "Select a charge point", value: "" },
    ...chargePoints.map((cp: unknown) => {
      const chargePoint = cp as Record<string, unknown>;
      const id = chargePoint.id?.toString() || "";
      const name = chargePoint.name?.toString() || `Charge Point ${id}`;
      return { label: name, value: id };
    }),
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card showHeader={false} showFooter={false}>
        {chargePointsError && (
          <div className="mb-4">
            <Message
              text={`Failed to load charge points: ${
                chargePointsError instanceof Error
                  ? chargePointsError.message
                  : "Unknown error"
              }`}
            />
          </div>
        )}

        {isLoadingChargePoints ? (
          <div className="flex justify-center py-8">
            <Loader size="sm" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mb-6" noValidate>
            {/* Charge Point Selection */}
            <div className="mb-4">
              <Select
                label="Select Charge Point"
                value={idFromUrl || selectedChargePointId || null}
                onChange={(value) => {
                  const newValue = Array.isArray(value) ? value[0] : value;
                  setSelectedChargePointId(newValue || null);
                  // Reset form to clear previous values - will be repopulated when data loads
                  reset({ name: "", status: "" });
                  setSubmittedData(null); // Clear submitted data
                }}
                options={chargePointOptions}
                className="w-full! mb-4"
              />
            </div>

            {/* Form Fields - Only show when charge point is selected */}
            {(idFromUrl || selectedChargePointId) && (
              <>
                {isLoadingSelected ? (
                  <div className="flex justify-center py-8">
                    <Loader size="m" />
                  </div>
                ) : selectedError ? (
                  <div className="mb-4">
                    <Message
                      text={`Failed to load charge point: ${
                        selectedError instanceof Error
                          ? selectedError.message
                          : "Unknown error"
                      }`}
                    />
                  </div>
                ) : (
                  <>
                    <Input
                      label="Name"
                      inputType="text"
                      placeholder="Enter charge point name"
                      value={watchedValues.name || ""}
                      onChange={(value) => setValue("name", value)}
                      error={!!errors.name}
                      errorMsg={errors.name?.message}
                      required
                      className="mb-4"
                    />

                    <Select
                      label="Status"
                      value={watchedValues.status || null}
                      onChange={(value) => {
                        const newValue = Array.isArray(value)
                          ? value[0]
                          : value;
                        setValue("status", newValue || "");
                      }}
                      options={statusOptions}
                      error={!!errors.status}
                      errorMsg={errors.status?.message}
                      required
                      className="w-full! mb-4"
                    />

                    {updateMutation.isError && (
                      <div className="mb-4">
                        <Message
                          text={`Failed to update: ${
                            updateMutation.error instanceof Error
                              ? updateMutation.error.message
                              : "Unknown error"
                          }`}
                        />
                      </div>
                    )}

                    {submittedData && (
                      <p className="text-green-600 my-4">
                        Charge point updated successfully! Check the console for
                        details.
                      </p>
                    )}

                    {/* Form Actions */}
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="filled"
                        loading={isSubmitting || updateMutation.isPending}
                      >
                        Update Charge Point
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleReset}
                      >
                        Reset
                      </Button>
                    </div>
                  </>
                )}
              </>
            )}
          </form>
        )}
      </Card>

      {/* Display Submitted Data */}
      {submittedData && (
        <Card
          header="Updated Data"
          showHeader
          showFooter={false}
          showDivider={false}
        >
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </Card>
      )}
    </div>
  );
}
