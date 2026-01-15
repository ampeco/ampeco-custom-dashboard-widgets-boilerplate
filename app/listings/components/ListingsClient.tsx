"use client";

/**
 * Listings Client Component
 *
 * Client-side component for displaying paginated charge points and sessions tables
 */

import { useState } from "react";
import { useGet } from "@/lib/hooks";
import { SmartTableWrapper } from "./SmartTableWrapper";
import { SessionsTableWrapper } from "./SessionsTableWrapper";
import { Pagination, Loader, Message } from "@ampeco/ampeco-ui";
import { ApiResponse } from "@/lib/services/api";

export function ListingsClient() {
  const [chargePointsPage, setChargePointsPage] = useState(1);
  const [sessionsPage, setSessionsPage] = useState(1);
  const perPage = 10;

  // Fetch charge points
  const {
    data: chargePointsResponse,
    isLoading: isLoadingChargePoints,
    error: chargePointsError,
  } = useGet("/api/charge-points/v1.0", {
    page: chargePointsPage,
    per_page: perPage,
  });

  // Fetch sessions
  const {
    data: sessionsResponse,
    isLoading: isLoadingSessions,
    error: sessionsError,
  } = useGet("/api/sessions/v1.0", {
    page: sessionsPage,
    per_page: perPage,
  });

  // Extract data arrays from response
  const chargePoints =
    (chargePointsResponse as ApiResponse<Record<string, unknown>[]>)?.data ||
    [];

  const sessions =
    (sessionsResponse as ApiResponse<Record<string, unknown>[]>)?.data || [];

  // Get pagination metadata
  const chargePointsTotal =
    (chargePointsResponse as ApiResponse<Record<string, unknown>[]>)?.meta
      ?.total || 0;

  const sessionsTotal =
    (sessionsResponse as ApiResponse<Record<string, unknown>[]>)?.meta?.total ||
    0;

  return (
    <>
      {/* Charge Points Section */}
      <div className="mb-12">
        <h2>Charge Points</h2>

        {isLoadingChargePoints ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="sm" />
          </div>
        ) : chargePointsError ? (
          <div className="flex items-center justify-center py-12">
            <Message
              text={
                "Error loading charge points: " +
                (chargePointsError instanceof Error
                  ? chargePointsError.message
                  : "Unknown error")
              }
            />
          </div>
        ) : (
          <>
            <p>
              Showing {chargePoints.length} charge point(s) of{" "}
              {chargePointsTotal}
            </p>

            {chargePoints.length === 0 ? (
              <div className="py-8 text-center text-lg">
                No charge points found
              </div>
            ) : (
              <SmartTableWrapper data={chargePoints} />
            )}

            {/* Pagination */}
            {chargePointsTotal > perPage && (
              <div className="p-4 flex items-center justify-center">
                <Pagination
                  page={chargePointsPage}
                  totalItems={chargePointsTotal}
                  pageSize={perPage}
                  onChange={(page) => setChargePointsPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sessions Section */}
      <div className="mb-12">
        <h2>Sessions</h2>

        {isLoadingSessions ? (
          <div className="flex items-center justify-center py-12">
            <Loader size="sm" />
          </div>
        ) : sessionsError ? (
          <div className="flex items-center justify-center py-12">
            <Message
              text={
                "Error loading sessions: " +
                (sessionsError instanceof Error
                  ? sessionsError.message
                  : "Unknown error")
              }
            />
          </div>
        ) : (
          <>
            <p>
              Showing {sessions.length} session(s) of {sessionsTotal}
            </p>

            {sessions.length === 0 ? (
              <div className="py-8 text-center text-lg">No sessions found</div>
            ) : (
              <SessionsTableWrapper data={sessions} />
            )}

            {/* Pagination */}
            {sessionsTotal > perPage && (
              <div className="p-4 flex items-center justify-center">
                <Pagination
                  page={sessionsPage}
                  totalItems={sessionsTotal}
                  pageSize={perPage}
                  onChange={(page) => setSessionsPage(page)}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
