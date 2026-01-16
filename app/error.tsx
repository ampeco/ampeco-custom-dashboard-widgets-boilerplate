"use client";

/**
 * Global Error Boundary
 *
 * Catches errors in the application and displays
 * a user-friendly error message.
 */

import { useEffect } from "react";
import { Button } from "@ampeco/ampeco-ui";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Application error:", error);
    }
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center my-10">
      <h1>Something went wrong</h1>
      <p>
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
