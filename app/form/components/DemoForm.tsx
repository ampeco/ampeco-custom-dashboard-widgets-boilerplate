"use client";

/**
 * Demo Form Component
 *
 * Comprehensive form demonstrating various @ampeco/ampeco-ui components
 * with react-hook-form and zod validation
 */

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Card,
  Input,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Toggle,
  DatePicker,
  Message,
  Textarea,
} from "@ampeco/ampeco-ui";
import type { SelectOption } from "@ampeco/ampeco-ui";
import { useState } from "react";

// Zod validation schema
const formSchema = z.object({
  // Text inputs
  name: z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z.string("Email is required").email("Invalid email address"),
  phone: z
    .string("Phone is required")
    .regex(/^\+?[\d\s-()]+$/, "Invalid phone number"),
  password: z
    .string("Password is required")
    .min(8, "Password must be at least 8 characters"),
  description: z
    .string("Description is required")
    .max(500, "Description must be less than 500 characters")
    .optional(),

  // Select
  status: z.string("Status is required").min(1, "Please select a status"),
  country: z.string("Country is required").min(1, "Please select a country"),

  // Checkbox
  terms: z
    .boolean("Terms and conditions are required")
    .refine((val) => val === true, "You must accept the terms"),
  newsletter: z.boolean().optional(),

  // Radio
  plan: z.enum(["basic", "pro", "enterprise"], {
    error: "Please select a plan",
  }),

  // Toggle
  notifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),

  // DatePicker - accepts Date or null
  startDate: z.date("Start date is required").nullable(),
  endDate: z.date("End date is required").nullable(),
});

type FormData = z.infer<typeof formSchema>;

const statusOptions: SelectOption<string>[] = [
  { label: "Select a status", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
  { label: "Suspended", value: "suspended" },
];

const countryOptions: SelectOption<string>[] = [
  { label: "Select a country", value: "" },
  { label: "United States", value: "us" },
  { label: "United Kingdom", value: "uk" },
  { label: "Canada", value: "ca" },
  { label: "Germany", value: "de" },
  { label: "France", value: "fr" },
  { label: "Spain", value: "es" },
];

export function DemoForm() {
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      terms: false,
      newsletter: false,
      notifications: false,
      publicProfile: false,
    },
  });

  // Watch values for controlled components - useWatch is React Compiler friendly
  const watchedValues = useWatch({ control });

  const onSubmit = async (data: FormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmittedData(data);
    console.log("Form submitted:", data);
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card showHeader={false} showFooter={false}>
        <p className="mb-6 text-gray-600">
          This form demonstrates various form components from @ampeco/ampeco-ui
          with react-hook-form and zod validation.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mb-6" noValidate>
          {/* Text Inputs Section */}
          <h3 className="text-lg font-semibold">Text Inputs</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-start gap-4">
            <Input
              label="Name"
              inputType="text"
              placeholder="Enter your name"
              value={watchedValues.name || ""}
              onChange={(value) => setValue("name", value)}
              error={!!errors.name}
              errorMsg={errors.name?.message}
              required
              className="mb-4"
            />

            <Input
              label="Email"
              inputType="email"
              placeholder="Enter your email"
              value={watchedValues.email || ""}
              onChange={(value) => setValue("email", value)}
              error={!!errors.email}
              errorMsg={errors.email?.message}
              required
              className="mb-4"
            />

            <Input
              label="Phone"
              inputType="tel"
              placeholder="+1 (555) 123-4567"
              value={watchedValues.phone || ""}
              onChange={(value) => setValue("phone", value)}
              error={!!errors.phone}
              errorMsg={errors.phone?.message}
              required
              className="mb-4"
            />

            <Input
              label="Password"
              inputType="password"
              placeholder="Enter password"
              value={watchedValues.password || ""}
              onChange={(value) => setValue("password", value)}
              error={!!errors.password}
              errorMsg={errors.password?.message}
              required
              className="mb-4"
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Enter a description (max 500 characters)"
            value={watchedValues.description || ""}
            onChange={(value) => setValue("description", value)}
            error={!!errors.description}
            errorMsg={errors.description?.message}
            rows={4}
            className="mb-4"
          />

          {/* Select Section */}
          <h3 className="text-lg font-semibold">Select Dropdowns</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={watchedValues.status || null}
              onChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setValue("status", newValue || "");
              }}
              options={statusOptions}
              error={!!errors.status}
              errorMsg={errors.status?.message}
              required
              className="mb-4"
            />

            <Select
              label="Country"
              value={watchedValues.country || null}
              onChange={(value) => {
                const newValue = Array.isArray(value) ? value[0] : value;
                setValue("country", newValue || "");
              }}
              options={countryOptions}
              error={!!errors.country}
              errorMsg={errors.country?.message}
              required
              className="mb-4"
            />
          </div>

          {/* Checkbox Section */}
          <h3 className="text-lg font-semibold">Checkboxes</h3>

          <div className="mb-4">
            <Checkbox
              value={watchedValues.terms || false}
              onChangeEvent={(e) => setValue("terms", e.target.checked)}
              error={!!errors.terms}
              errorMsg={errors.terms?.message}
              required
            >
              I accept the terms and conditions
            </Checkbox>

            <Checkbox
              value={watchedValues.newsletter || false}
              onChangeEvent={(e) => setValue("newsletter", e.target.checked)}
            >
              Subscribe to newsletter
            </Checkbox>
          </div>

          {/* Radio Section */}
          <h3 className="text-lg font-semibold">Radio Buttons</h3>

          <RadioGroup
            value={watchedValues.plan || null}
            onChange={(value) =>
              setValue("plan", value as "basic" | "pro" | "enterprise")
            }
            role="radiogroup"
            className="mb-4"
            error={!!errors.plan}
            errorMsg={errors.plan?.message}
          >
            <Radio value="basic">Basic Plan - $9/month</Radio>
            <Radio value="pro">Pro Plan - $29/month</Radio>
            <Radio value="enterprise">Enterprise Plan - $99/month</Radio>
          </RadioGroup>

          {/* Toggle Section */}
          <h3 className="text-lg font-semibold">Toggle Switches</h3>

          <div className="flex flex-col gap-2 mb-4">
            <Toggle
              value={watchedValues.notifications || false}
              onChangeEvent={(e) => setValue("notifications", e.target.checked)}
            >
              Enable email notifications
            </Toggle>

            <Toggle
              value={watchedValues.publicProfile || false}
              onChangeEvent={(e) => setValue("publicProfile", e.target.checked)}
            >
              Make profile public
            </Toggle>
          </div>

          {/* DatePicker Section */}
          <h3 className="text-lg font-semibold">Date Pickers</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Start Date (Optional)"
              value={watchedValues.startDate || null}
              onChange={(date) => {
                setValue("startDate", date || null);
              }}
              error={!!errors.startDate}
              errorMsg={errors.startDate?.message}
              className="mb-4"
            />

            <DatePicker
              label="End Date (Optional)"
              value={watchedValues.endDate || null}
              onChange={(date) => {
                setValue("endDate", date || null);
              }}
              error={!!errors.endDate}
              errorMsg={errors.endDate?.message}
              className="mb-4"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-2">
            <Button type="submit" variant="filled" loading={isSubmitting}>
              Submit Form
            </Button>
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>

          {submittedData && (
            <p className="text-green-600 my-4">
              Form submitted successfully! Check the console for submitted data.
            </p>
          )}
        </form>
      </Card>

      {/* Display Submitted Data */}
      {submittedData && (
        <Card
          header="Submitted Data"
          showHeader
          showFooter={false}
          showDivider={false}
        >
          <pre className="bg-gray-50 p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
