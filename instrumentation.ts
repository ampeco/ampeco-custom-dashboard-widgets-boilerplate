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
}
