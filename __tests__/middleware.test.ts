/**
 * Tests for the JWT middleware
 *
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { verifyJwt } from "@/lib/auth/jwt-verifier";

jest.mock("@/lib/auth/jwt-verifier", () => ({
  ...jest.requireActual("@/lib/auth/jwt-verifier"),
  verifyJwt: jest.fn(),
}));

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(),
}));

const mockedVerifyJwt = verifyJwt as jest.Mock;

const payload = {
  iss: "https://demo.charge.ampeco.tech",
  admin_id: 1,
  app_id: 2,
  widget_id: 3,
  impersonate: true,
};

describe("middleware", () => {
  beforeEach(() => {
    mockedVerifyJwt.mockReset();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should serve a page without a token and without JWT context", async () => {
    const request = new NextRequest("https://widgets.example.com/dashboard", {
      headers: { "x-ampeco-jwt-token": "forged", "x-ampeco-admin-id": "1" },
    });

    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(mockedVerifyJwt).not.toHaveBeenCalled();
    // Forged context headers are removed from the request passed on
    expect(
      response.headers.get("x-middleware-request-x-ampeco-jwt-token")
    ).toBeNull();
    expect(response.headers.get("x-middleware-override-headers")).not.toContain(
      "x-ampeco-jwt-token"
    );
  });

  it("should reject an API request without a token", async () => {
    const request = new NextRequest(
      "https://widgets.example.com/api/sessions/v1.0"
    );

    const response = await middleware(request);

    expect(response.status).toBe(401);
  });

  it("should reject an API request without a token even with a static file extension", async () => {
    const request = new NextRequest(
      "https://widgets.example.com/api/sessions/v1.0/1.js"
    );

    const response = await middleware(request);

    expect(response.status).toBe(401);
  });

  it("should validate a page request with a token in the URL", async () => {
    mockedVerifyJwt.mockResolvedValue(payload);
    const request = new NextRequest(
      "https://widgets.example.com/dashboard?token=abc"
    );

    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(mockedVerifyJwt).toHaveBeenCalledWith(
      "abc",
      "https://widgets.example.com"
    );
    expect(
      response.headers.get("x-middleware-request-x-ampeco-jwt-token")
    ).toBe("abc");
  });

  it("should reject a page request with an invalid token in the URL", async () => {
    mockedVerifyJwt.mockRejectedValue(new Error("JWT verification failed"));
    const request = new NextRequest(
      "https://widgets.example.com/dashboard?token=bad"
    );

    const response = await middleware(request);

    expect(response.status).toBe(401);
  });

  it("should validate an API request with a token in the Authorization header", async () => {
    mockedVerifyJwt.mockResolvedValue(payload);
    const request = new NextRequest(
      "https://widgets.example.com/api/sessions/v1.0",
      { headers: { Authorization: "Bearer abc" } }
    );

    const response = await middleware(request);

    expect(response.status).toBe(200);
    expect(mockedVerifyJwt).toHaveBeenCalledWith("abc", expect.any(String));
  });
});
