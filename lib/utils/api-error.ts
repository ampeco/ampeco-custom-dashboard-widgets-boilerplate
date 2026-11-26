/**
 * Errors that carry what actually went wrong on an API call
 *
 * This module deliberately imports nothing. It is used by the API client on the
 * server, by the `/api` proxy routes and by the data hooks in the browser, so
 * it must not pull server-only configuration into a client bundle.
 */

/**
 * AMPECO, or the widget's own `/api` proxy, answered with an error status
 *
 * `status` is the status that was answered, so a caller can tell an expired
 * token (401) from a missing permission (403), a missing record (404), a
 * validation error (422) or a crash. `errors` holds field validation errors as
 * AMPECO returned them, so a form can show them next to its fields.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly errors?: Record<string, string[]>;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    if (errors) {
      this.errors = errors;
    }
  }
}

/**
 * AMPECO could not be reached, or did not answer
 *
 * The request never produced a status, so this is not a failure of the widget
 * server and not something AMPECO rejected. The proxy answers 502 for it.
 */
export class ApiUnreachableError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ApiUnreachableError";
  }
}

/**
 * Reads AMPECO's field validation errors out of a response body
 *
 * AMPECO returns them as `{ "field": ["message", ...] }`. Anything that does
 * not have that shape is dropped rather than passed on half-formed.
 */
export function toFieldErrors(
  value: unknown
): Record<string, string[]> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }

  const fieldErrors: Record<string, string[]> = {};
  for (const [field, messages] of Object.entries(value)) {
    if (
      Array.isArray(messages) &&
      messages.every((message) => typeof message === "string")
    ) {
      fieldErrors[field] = messages;
    }
  }

  return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
}
