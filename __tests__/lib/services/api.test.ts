/**
 * Tests for the API client's error reporting
 *
 * @jest-environment node
 */

import { ApiService } from "@/lib/services/api";
import { ApiRequestError, ApiUnreachableError } from "@/lib/utils/api-error";

jest.mock("@/lib/config/ampeco", () => ({
  getAmpecoConfig: () => ({
    apiToken: "api-token",
    urls: {
      apiBase: "https://demo.charge.ampeco.tech/public-api/resources",
      tenant: "https://demo.charge.ampeco.tech",
    },
  }),
}));

jest.mock("@/lib/auth/get-jwt-context", () => ({
  getJwtToken: jest.fn(async () => "widget-jwt"),
}));

function jsonResponse(body: unknown, status: number) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    headers: { get: () => "application/json" },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

describe("ApiService.request", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it("should keep the status AMPECO answered instead of losing it", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ message: "This action is unauthorized." }, 403)
    ) as unknown as typeof fetch;

    await expect(
      new ApiService().request("charge-points/v2.0")
    ).rejects.toMatchObject({
      status: 403,
      message: "This action is unauthorized.",
    });
  });

  it("should throw an error the catch cannot flatten to Unknown error", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ message: "Unauthenticated." }, 401)
    ) as unknown as typeof fetch;

    const error = await new ApiService()
      .request("charge-points/v2.0")
      .catch((thrown: unknown) => thrown);

    // The old client threw a plain object, so its own catch rethrew
    // "API request failed: Unknown error" and the status was gone.
    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).not.toContain("Unknown error");
  });

  it("should keep AMPECO's field validation errors for a form to show", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse(
        {
          message: "The given data was invalid.",
          errors: { name: ["The name field is required."] },
        },
        422
      )
    ) as unknown as typeof fetch;

    await expect(
      new ApiService().request("charge-points/v2.0", { method: "POST" })
    ).rejects.toMatchObject({
      status: 422,
      errors: { name: ["The name field is required."] },
    });
  });

  it("should drop field errors that do not have AMPECO's shape", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ message: "Invalid.", errors: "not-a-map" }, 422)
    ) as unknown as typeof fetch;

    const error = (await new ApiService()
      .request("charge-points/v2.0")
      .catch((thrown: unknown) => thrown)) as ApiRequestError;

    expect(error.status).toBe(422);
    expect(error.errors).toBeUndefined();
  });

  it("should report a call that never reached AMPECO separately", async () => {
    global.fetch = jest.fn(async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch;

    const error = await new ApiService()
      .request("charge-points/v2.0")
      .catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(ApiUnreachableError);
    expect(error).not.toBeInstanceOf(ApiRequestError);
  });

  it("should carry the status of a non-JSON error answer", async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 502,
      statusText: "",
      headers: { get: () => "text/html" },
      text: async () => "<html>gateway</html>",
    })) as unknown as typeof fetch;

    const error = (await new ApiService()
      .request("charge-points/v2.0")
      .catch((thrown: unknown) => thrown)) as ApiRequestError;

    expect(error).toBeInstanceOf(ApiRequestError);
    expect(error.status).toBe(502);
    // Over HTTP/2 there is no status text, so the message must not trail off.
    expect(error.message).toBe("API request failed: 502");
  });

  it("should still return the body of a successful call", async () => {
    global.fetch = jest.fn(async () =>
      jsonResponse({ data: [{ id: 1 }] }, 200)
    ) as unknown as typeof fetch;

    await expect(new ApiService().request("charge-points/v2.0")).resolves.toEqual(
      { data: [{ id: 1 }] }
    );
  });
});
