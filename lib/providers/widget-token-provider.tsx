"use client";

import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { Loader, Message } from "@ampeco/ampeco-ui";
import {
  getWidgetToken,
  setWidgetToken,
  subscribeToWidgetToken,
} from "@/lib/auth/token-store";

/**
 * Message AMPECO sends to the widget with the JWT token (postMessage delivery)
 */
export const IMPERSONATION_TOKEN_MESSAGE_TYPE =
  "ampeco:embed-card:impersonation-token";

/**
 * Message the widget sends to AMPECO to ask for the JWT token
 */
export const IMPERSONATION_TOKEN_REQUEST_MESSAGE_TYPE =
  "ampeco:embed-card:impersonation-token:request";

/**
 * How long to wait for the token after asking for it
 */
const TOKEN_REQUEST_TIMEOUT_MS = 3000;

interface WidgetTokenProviderProps {
  children: ReactNode;
  /** AMPECO tenant origin, e.g. https://demo.charge.ampeco.tech */
  tenantOrigin: string;
  /** True when the page request carried a token the middleware has validated */
  authenticated: boolean;
}

/**
 * Makes sure the widget has a JWT token before its content is rendered
 *
 * - Query parameter delivery: the token is in the page URL, content renders at once.
 * - postMessage delivery: asks the AMPECO parent frame for the token, and
 *   accepts it only from the tenant origin and the parent window.
 */
export function WidgetTokenProvider({
  children,
  tenantOrigin,
  authenticated,
}: WidgetTokenProviderProps) {
  const token = useSyncExternalStore(
    subscribeToWidgetToken,
    getWidgetToken,
    () => null
  );
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (getWidgetToken()) {
      return;
    }

    const canRequest = Boolean(tenantOrigin) && window.parent !== window;

    const handler = (event: MessageEvent) => {
      if (event.origin !== tenantOrigin || event.source !== window.parent) {
        return;
      }

      const data: unknown = event.data;
      if (typeof data !== "object" || data === null) {
        return;
      }

      const { type, token: receivedToken } = data as {
        type?: unknown;
        token?: unknown;
      };
      if (
        type !== IMPERSONATION_TOKEN_MESSAGE_TYPE ||
        typeof receivedToken !== "string" ||
        !receivedToken
      ) {
        return;
      }

      setWidgetToken(receivedToken);
    };

    if (canRequest) {
      window.addEventListener("message", handler);
      window.parent.postMessage(
        { type: IMPERSONATION_TOKEN_REQUEST_MESSAGE_TYPE },
        tenantOrigin
      );
    }

    // Outside AMPECO there is nobody to ask, so show the message right away
    const timer = window.setTimeout(
      () => setTimedOut(true),
      canRequest ? TOKEN_REQUEST_TIMEOUT_MS : 0
    );

    return () => {
      window.removeEventListener("message", handler);
      window.clearTimeout(timer);
    };
  }, [tenantOrigin]);

  // "authenticated" lets a page opened with ?token= render on the server
  if (token || authenticated) {
    return <>{children}</>;
  }

  if (timedOut) {
    return (
      <div className="p-4">
        <Message text="JWT token is required. Please ensure the widget is loaded from AMPECO backend." />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <Loader size="sm" />
    </div>
  );
}
