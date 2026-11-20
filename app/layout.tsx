import type { Metadata } from "next";
import "./globals.css";
import "@ampeco/ampeco-ui/dist/style.css";
import { QueryProvider } from "@/lib/providers/query-provider";
import { WidgetTokenProvider } from "@/lib/providers/widget-token-provider";
import { getJwtContext } from "@/lib/auth/get-jwt-context";
import { getAmpecoTenantOrigin } from "@/lib/config/ampeco";

export const metadata: Metadata = {
  title: "AMPECO Custom Dashboard Widgets Boilerplate",
  description: "Template for building AMPECO custom widgets",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set by the middleware when the page request carried a valid token (?token=)
  const jwtContext = await getJwtContext();

  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>
          <WidgetTokenProvider
            tenantOrigin={getAmpecoTenantOrigin()}
            authenticated={jwtContext !== null}
          >
            {children}
          </WidgetTokenProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
