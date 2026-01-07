import type { Metadata } from "next";
import "./globals.css";
import "@ampeco/ampeco-ui/dist/style.css";
import { QueryProvider } from "@/lib/providers/query-provider";

export const metadata: Metadata = {
  title: "AMPECO Custom Dashboard Widgets Boilerplate",
  description: "Template for building AMPECO custom widgets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
