/**
 * Tests for the widget token provider (postMessage delivery)
 */

import "@testing-library/jest-dom";
import { act, render, screen } from "@testing-library/react";
import {
  WidgetTokenProvider,
  IMPERSONATION_TOKEN_MESSAGE_TYPE,
  IMPERSONATION_TOKEN_REQUEST_MESSAGE_TYPE,
} from "@/lib/providers/widget-token-provider";
import { getWidgetToken, resetWidgetToken } from "@/lib/auth/token-store";
import { getAuthHeaders } from "@/lib/hooks/utils";

jest.mock("@ampeco/ampeco-ui", () => ({
  Loader: () => <div>loading</div>,
  Message: ({ text }: { text: string }) => <div>{text}</div>,
}));

const TENANT = "https://demo.charge.ampeco.tech";
const realParent = window.parent;
const fakeParent = { postMessage: jest.fn() };

function setParent(parent: unknown) {
  Object.defineProperty(window, "parent", {
    value: parent,
    configurable: true,
  });
}

function sendMessage(data: unknown, origin: string, source: unknown) {
  const event = new MessageEvent("message", { data, origin });
  Object.defineProperty(event, "source", { value: source });
  act(() => {
    window.dispatchEvent(event);
  });
}

function renderProvider(authenticated = false) {
  return render(
    <WidgetTokenProvider tenantOrigin={TENANT} authenticated={authenticated}>
      <div>content</div>
    </WidgetTokenProvider>
  );
}

describe("WidgetTokenProvider", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetWidgetToken();
    fakeParent.postMessage.mockClear();
    setParent(fakeParent);
    window.history.replaceState({}, "", "/dashboard");
  });

  afterEach(() => {
    jest.useRealTimers();
    setParent(realParent);
  });

  it("should ask the parent frame for the token at the tenant origin", () => {
    renderProvider();

    expect(fakeParent.postMessage).toHaveBeenCalledWith(
      { type: IMPERSONATION_TOKEN_REQUEST_MESSAGE_TYPE },
      TENANT
    );
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("should render content once the token arrives from the tenant", () => {
    renderProvider();

    sendMessage(
      { type: IMPERSONATION_TOKEN_MESSAGE_TYPE, token: "jwt" },
      TENANT,
      fakeParent
    );

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(getAuthHeaders()).toEqual({ Authorization: "Bearer jwt" });
    expect(window.location.search).toBe("");
  });

  it("should ignore a token from another origin", () => {
    renderProvider();

    sendMessage(
      { type: IMPERSONATION_TOKEN_MESSAGE_TYPE, token: "jwt" },
      "https://evil.example.com",
      fakeParent
    );

    expect(getWidgetToken()).toBeNull();
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });

  it("should ignore a token that does not come from the parent window", () => {
    renderProvider();

    sendMessage(
      { type: IMPERSONATION_TOKEN_MESSAGE_TYPE, token: "jwt" },
      TENANT,
      {}
    );

    expect(getWidgetToken()).toBeNull();
  });

  it("should ignore other messages from the tenant", () => {
    renderProvider();

    sendMessage({ type: "resize", token: "jwt" }, TENANT, fakeParent);
    sendMessage("text", TENANT, fakeParent);

    expect(getWidgetToken()).toBeNull();
  });

  it("should show the message when no token arrives in 3 seconds", () => {
    renderProvider();

    act(() => {
      jest.advanceTimersByTime(2999);
    });
    expect(screen.queryByText(/JWT token is required/)).not.toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(
      screen.getByText(
        "JWT token is required. Please ensure the widget is loaded from AMPECO backend."
      )
    ).toBeInTheDocument();
  });

  it("should use the token from the URL without asking the parent", () => {
    window.history.replaceState({}, "", "/dashboard?token=url-jwt");

    renderProvider(true);

    expect(screen.getByText("content")).toBeInTheDocument();
    expect(fakeParent.postMessage).not.toHaveBeenCalled();
    expect(getAuthHeaders()).toEqual({ Authorization: "Bearer url-jwt" });
  });

  it("should show the message at once when the page is not embedded", () => {
    setParent(window);

    renderProvider();
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(screen.getByText(/JWT token is required/)).toBeInTheDocument();
  });
});
