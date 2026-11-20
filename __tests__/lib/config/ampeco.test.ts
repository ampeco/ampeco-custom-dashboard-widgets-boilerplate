/**
 * Tests for AMPECO configuration helper
 */

import {
  getAmpecoConfig,
  getAmpecoBaseDomain,
  getAmpecoApiToken,
  getAmpecoTenantOrigin,
  getWidgetOrigin,
  getTenantUrlScheme,
} from "@/lib/config/ampeco";

describe("Ampeco Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    // Keep the tests independent of the developer's own .env
    delete process.env.WIDGET_ORIGIN;
    delete process.env.TENANT_URL_SCHEME;
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
        "https://demo.charge.ampeco.tech/.well-known/jwks.json"
      );
      expect(config.urls.apiBase).toBe(
        "https://demo.charge.ampeco.tech/public-api/resources"
      );
      expect(config.urls.tenant).toBe("https://demo.charge.ampeco.tech");
      expect(config.jwt.algorithm).toBe("ES256");
      expect(config.jwt.clockTolerance).toBe(30);
    });

    it("should build http URLs when TENANT_URL_SCHEME is http", () => {
      process.env.AMPECO_BASE_DOMAIN = "demo.charge.local.test";
      process.env.AMPECO_API_TOKEN = "sk_test_token";
      process.env.TENANT_URL_SCHEME = "http";

      const config = getAmpecoConfig();

      expect(config.urls.publicKey).toBe(
        "http://demo.charge.local.test/.well-known/jwks.json"
      );
      expect(config.urls.apiBase).toBe(
        "http://demo.charge.local.test/public-api/resources"
      );
      expect(config.urls.tenant).toBe("http://demo.charge.local.test");
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

  describe("getWidgetOrigin", () => {
    it("should return null if WIDGET_ORIGIN is not set", () => {
      delete process.env.WIDGET_ORIGIN;
      expect(getWidgetOrigin()).toBeNull();
    });

    it("should return the origin as configured", () => {
      process.env.WIDGET_ORIGIN = "https://widgets.example.com";
      expect(getWidgetOrigin()).toBe("https://widgets.example.com");
    });

    it("should reduce a URL with a path to its origin", () => {
      process.env.WIDGET_ORIGIN = "http://localhost:3000/dashboard/";
      expect(getWidgetOrigin()).toBe("http://localhost:3000");
    });

    it("should throw if WIDGET_ORIGIN is not a valid URL", () => {
      process.env.WIDGET_ORIGIN = "widgets.example.com";
      expect(() => getWidgetOrigin()).toThrow("Invalid WIDGET_ORIGIN");
    });
  });

  describe("getTenantUrlScheme", () => {
    it("should default to https", () => {
      expect(getTenantUrlScheme()).toBe("https");
    });

    it("should accept http", () => {
      process.env.TENANT_URL_SCHEME = "HTTP";
      expect(getTenantUrlScheme()).toBe("http");
    });

    it("should throw on any other value", () => {
      process.env.TENANT_URL_SCHEME = "ftp";
      expect(() => getTenantUrlScheme()).toThrow("Invalid TENANT_URL_SCHEME");
    });
  });

  describe("getAmpecoTenantOrigin", () => {
    it("should return the tenant origin", () => {
      process.env.AMPECO_BASE_DOMAIN = "https://demo.charge.ampeco.tech";
      expect(getAmpecoTenantOrigin()).toBe("https://demo.charge.ampeco.tech");
    });

    it("should use http when TENANT_URL_SCHEME is http", () => {
      process.env.AMPECO_BASE_DOMAIN = "demo.charge.local.test";
      process.env.TENANT_URL_SCHEME = "http";
      expect(getAmpecoTenantOrigin()).toBe("http://demo.charge.local.test");
    });

    it("should return empty string if the domain is not set", () => {
      delete process.env.AMPECO_BASE_DOMAIN;
      expect(getAmpecoTenantOrigin()).toBe("");
    });
  });
});
