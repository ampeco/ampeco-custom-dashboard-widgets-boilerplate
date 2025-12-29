/**
 * Tests for AMPECO configuration helper
 */

import { getAmpecoConfig, getAmpecoBaseDomain, getAmpecoApiToken } from "@/lib/config/ampeco";

describe("Ampeco Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("getAmpecoConfig", () => {
    it("should return configuration with correct URLs", () => {
      process.env.AMPECO_BASE_DOMAIN = "demo.charge.ampeco.tech";
      process.env.AMPECO_API_TOKEN = "sk_test_token";

      const config = getAmpecoConfig();

      expect(config.baseDomain).toBe("demo.charge.ampeco.tech");
      expect(config.apiToken).toBe("sk_test_token");
      expect(config.urls.publicKey).toBe(
        "https://demo.charge.ampeco.tech/api/v1/marketplace/public-key"
      );
      expect(config.urls.apiBase).toBe(
        "https://demo.charge.ampeco.tech/public-api/resources"
      );
      expect(config.urls.tenant).toBe("https://demo.charge.ampeco.tech");
      expect(config.jwt.algorithm).toBe("ES256");
      expect(config.jwt.clockTolerance).toBe(30);
    });

    it("should throw error if AMPECO_BASE_DOMAIN is missing", () => {
      delete process.env.AMPECO_BASE_DOMAIN;
      process.env.AMPECO_API_TOKEN = "sk_test_token";

      expect(() => getAmpecoConfig()).toThrow("Missing required environment variables");
    });

    it("should throw error if AMPECO_API_TOKEN is missing", () => {
      process.env.AMPECO_BASE_DOMAIN = "demo.charge.ampeco.tech";
      delete process.env.AMPECO_API_TOKEN;

      expect(() => getAmpecoConfig()).toThrow("Missing required environment variables");
    });
  });

  describe("getAmpecoBaseDomain", () => {
    it("should return base domain from environment", () => {
      process.env.AMPECO_BASE_DOMAIN = "demo.charge.ampeco.tech";
      expect(getAmpecoBaseDomain()).toBe("demo.charge.ampeco.tech");
    });

    it("should return empty string if not set", () => {
      delete process.env.AMPECO_BASE_DOMAIN;
      expect(getAmpecoBaseDomain()).toBe("");
    });
  });

  describe("getAmpecoApiToken", () => {
    it("should return API token from environment", () => {
      process.env.AMPECO_API_TOKEN = "sk_test_token";
      expect(getAmpecoApiToken()).toBe("sk_test_token");
    });

    it("should return empty string if not set", () => {
      delete process.env.AMPECO_API_TOKEN;
      expect(getAmpecoApiToken()).toBe("");
    });
  });
});

