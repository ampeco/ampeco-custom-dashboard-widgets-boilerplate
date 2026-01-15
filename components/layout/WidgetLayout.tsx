/**
 * Widget Layout Component
 *
 * Minimal layout for single widget card (1/3 or 2/3 width)
 */

import { ReactNode } from "react";

interface WidgetLayoutProps {
  children: ReactNode;
  className?: string;
}

export function WidgetLayout({ children, className = "" }: WidgetLayoutProps) {
  return (
    <div className={`p-4 ${className}`}>
      {children}
    </div>
  );
}

