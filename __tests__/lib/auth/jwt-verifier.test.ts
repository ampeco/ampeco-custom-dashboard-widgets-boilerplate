/**
 * Tests for JWT verification
 *
 * @jest-environment node
 */

import { jwtVerify, createRemoteJWKSet } from "jose";
import { verifyJwt, extractJwtToken } from "@/lib/auth/jwt-verifier";

jest.mock("jose", () => ({
  jwtVerify: jest.fn(),
  createRemoteJWKSet: jest.fn(() => jest.fn()),
}));

const mockedJwtVerify = jwtVerify as jest.Mock;
const mockedCreateRemoteJWKSet = createRemoteJWKSet as jest.Mock;

const TENANT = "https://demo.charge.ampeco.tech";
const WIDGET = "https://widgets.example.com";
const OTHER_WIDGET = "https://other-widget.example.com";

function payloadWithAudience(aud: string | string[]) {
  return {
    payload: {
      iss: TENANT,
      aud,
      admin_id: 1,
      app_id: 2,
      widget_id: 3,
      widget_name: "Test",
      impersonate: true,
      resource: "dashboard",
    },
  };
}

describe("JWT Verifier", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.WIDGET_ORIGIN;
    mockedJwtVerify.mockReset();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("verifyJwt with WIDGET_ORIGIN set", () => {
    beforeEach(() => {
      process.env.WIDGET_ORIGIN = `${WIDGET}/dashboard`;
    });

    it("should pass the configured origin to jose as the audience", async () => {
      mockedJwtVerify.mockResolvedValue(payloadWithAudience([WIDGET]));

      await verifyJwt("token");

      expect(mockedJwtVerify).toHaveBeenCalledWith(
        "token",
        expect.anything(),
        expect.objectContaining({ audience: WIDGET, issuer: TENANT })
      );
    });

    it("should ignore the audience taken from the request", async () => {
      mockedJwtVerify.mockResolvedValue(payloadWithAudience([WIDGET]));

      // A caller sends Origin: https://other-widget.example.com
      await verifyJwt("token", OTHER_WIDGET);

      expect(mockedJwtVerify.mock.calls[0][2].audience).toBe(WIDGET);
    });

    it("should reject a token jose rejects for its audience", async () => {
      mockedJwtVerify.mockRejectedValue(
        new Error('unexpected "aud" claim value')
      );

      await expect(verifyJwt("token", "http://localhost:3000")).rejects.toThrow(
        "JWT verification failed"
      );
    });

    it("should reject an invalid WIDGET_ORIGIN", async () => {
      process.env.WIDGET_ORIGIN = "not a url";

      await expect(verifyJwt("token")).rejects.toThrow("Invalid WIDGET_ORIGIN");
      expect(mockedJwtVerify).not.toHaveBeenCalled();
    });
  });

  describe("verifyJwt without WIDGET_ORIGIN (legacy check)", () => {
    it("should not pass an audience to jose", async () => {
      mockedJwtVerify.mockResolvedValue(payloadWithAudience([WIDGET]));

      await verifyJwt("token", WIDGET);

      expect(mockedJwtVerify.mock.calls[0][2]).not.toHaveProperty("audience");
    });

    it("should accept a token whose audience matches the request origin", async () => {
      mockedJwtVerify.mockResolvedValue(payloadWithAudience([WIDGET]));

      await expect(verifyJwt("token", WIDGET)).resolves.toMatchObject({
        widget_id: 3,
      });
    });

    it("should reject a token whose audience does not match the request origin", async () => {
      mockedJwtVerify.mockResolvedValue(payloadWithAudience([OTHER_WIDGET]));

      await expect(verifyJwt("token", WIDGET)).rejects.toThrow(
        "Invalid audience"
      );
    });

    it("should keep the localhost exemption", async () => {
      mockedJwtVerify.mockResolvedValue(payloadWithAudience([OTHER_WIDGET]));

      await expect(
        verifyJwt("token", "http://localhost:3000")
      ).resolves.toBeDefined();
    });
  });

  describe("signing keys", () => {
    it("should reuse the key set across requests", async () => {
      mockedJwtVerify.mockResolvedValue(payloadWithAudience([WIDGET]));
      mockedCreateRemoteJWKSet.mockClear();

      await verifyJwt("token", WIDGET);
      await verifyJwt("token", WIDGET);

      expect(mockedCreateRemoteJWKSet.mock.calls.length).toBeLessThanOrEqual(1);
      expect(mockedJwtVerify.mock.calls[0][1]).toBe(
        mockedJwtVerify.mock.calls[1][1]
      );
    });
  });

  describe("extractJwtToken", () => {
    it("should read the token from the Authorization header", () => {
      const request = new Request("https://widgets.example.com/api/x", {
        headers: { Authorization: "Bearer header-token" },
      });

      expect(extractJwtToken(request)).toBe("header-token");
    });

    it("should read the token from the query parameter", () => {
      const request = new Request(
        "https://widgets.example.com/dashboard?token=query-token"
      );

      expect(extractJwtToken(request)).toBe("query-token");
    });

    it("should prefer the Authorization header", () => {
      const request = new Request(
        "https://widgets.example.com/api/x?token=query-token",
        { headers: { Authorization: "Bearer header-token" } }
      );

      expect(extractJwtToken(request)).toBe("header-token");
    });

    it("should return null when there is no token", () => {
      const request = new Request("https://widgets.example.com/dashboard");

      expect(extractJwtToken(request)).toBeNull();
    });
  });
});
