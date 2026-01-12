"use client";

/**
 * Filters Component
 *
 * Client component for filtering charge points
 */

import { useState } from "react";
import { Select, Input, Button } from "@ampeco/ampeco-ui";

interface FiltersProps {
  onFilterChange: (filters: { status?: string; search?: string }) => void;
}

export function Filters({ onFilterChange }: FiltersProps) {
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const handleApply = () => {
    onFilterChange({
      status: status || undefined,
      search: search || undefined,
    });
  };

  const handleReset = () => {
    setStatus("");
    setSearch("");
    onFilterChange({});
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          label="Search"
          inputType="text"
          placeholder="Search by name..."
          value={search}
          onChange={(value) => setSearch(value)}
        />
        <Select
          label="Status"
          value={status || null}
          onChange={(value) => {
            const newValue = Array.isArray(value) ? value[0] : value;
            setStatus(newValue || "");
          }}
          options={[
            { label: "All Statuses", value: "" },
            { label: "Online", value: "online" },
            { label: "Offline", value: "offline" },
            { label: "Charging", value: "charging" },
            { label: "Available", value: "available" },
            { label: "Faulted", value: "faulted" },
          ]}
        />
        <div className="flex items-end gap-2">
          <Button onClick={handleApply} variant="filled">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
}
