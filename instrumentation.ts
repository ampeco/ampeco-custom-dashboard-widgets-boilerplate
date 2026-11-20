/**
 * Next.js instrumentation
 *
 * Runs once when the server starts.
 */

export function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  if (!process.env.WIDGET_ORIGIN?.trim()) {
    console.warn(
      "WIDGET_ORIGIN is not set: the JWT audience check is not strict. " +
        "Set WIDGET_ORIGIN to the widget's public origin (the origin of the URL to embed), " +
        "e.g. https://widgets.example.com"
    );
  }

  if (process.env.TENANT_URL_SCHEME?.trim().toLowerCase() === "http") {
    console.warn(
      "TENANT_URL_SCHEME is http: the tenant's signing keys and the API token travel unencrypted. " +
        "Use it only with a tenant on a local development stack"
    );
  }
}
