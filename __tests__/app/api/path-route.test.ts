/**
 * Tests for the status the /api proxy answers with
 *
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { GET, POST, PATCH, PUT, DELETE } from "@/app/api/[...path]/route";
import { getApiService } from "@/lib/services/api";
import { ApiRequestError, ApiUnreachableError } from "@/lib/utils/api-error";

jest.mock("@/lib/services/api", () => ({
  getApiService: jest.fn(),
}));

const mockedGetApiService = getApiService as jest.Mock;
const request = jest.fn();

function params() {
  return Promise.resolve({ path: ["charge-points", "v2.0"] });
}

function postRequest() {
  return new NextRequest("https://widgets.example.com/api/charge-points/v2.0", {
    method: "POST",
    body: JSON.stringify({ name: "" }),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api proxy error statuses", () => {
  beforeEach(() => {
    request.mockReset();
    mockedGetApiService.mockReturnValue({ request });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should answer with the status AMPECO answered, not 500", async () => {
    request.mockRejectedValue(
      new ApiRequestError("This action is unauthorized.", 403)
    );

    const response = await GET(
      new NextRequest("https://widgets.example.com/api/charge-points/v2.0"),
      { params: params() }
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({
      error: "This action is unauthorized.",
    });
  });

  it.each([
    ["401, an expired widget token", 401],
    ["404, a record that is not there", 404],
    ["429, too many calls", 429],
    ["503, AMPECO is down", 503],
  ])("should pass through %s", async (_label, status) => {
    request.mockRejectedValue(new ApiRequestError("Upstream said so.", status));

    const response = await GET(
      new NextRequest("https://widgets.example.com/api/charge-points/v2.0"),
      { params: params() }
    );

    expect(response.status).toBe(status);
  });

  it("should carry field validation errors so a form can show them", async () => {
    request.mockRejectedValue(
      new ApiRequestError("The given data was invalid.", 422, {
        name: ["The name field is required."],
      })
    );

    const response = await POST(postRequest(), { params: params() });

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      error: "The given data was invalid.",
      errors: { name: ["The name field is required."] },
    });
  });

  it("should answer 502 when AMPECO could not be reached", async () => {
    request.mockRejectedValue(
      new ApiUnreachableError("AMPECO could not be reached. Please try again.")
    );

    const response = await GET(
      new NextRequest("https://widgets.example.com/api/charge-points/v2.0"),
      { params: params() }
    );

    expect(response.status).toBe(502);
  });

  it("should keep 500 for an error in the widget server", async () => {
    request.mockRejectedValue(new Error("Something broke in here."));

    const response = await GET(
      new NextRequest("https://widgets.example.com/api/charge-points/v2.0"),
      { params: params() }
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "Something broke in here.",
    });
  });

  it("should use the real status in all five handlers", async () => {
    const handlers = [
      ["POST", POST],
      ["PATCH", PATCH],
      ["PUT", PUT],
      ["DELETE", DELETE],
    ] as const;

    for (const [name, handler] of handlers) {
      request.mockRejectedValue(new ApiRequestError(`${name} refused.`, 403));

      const response = await handler(postRequest(), { params: params() });

      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toEqual({
        error: `${name} refused.`,
      });
    }
  });

  it("should still answer a successful call normally", async () => {
    request.mockResolvedValue({ data: [{ id: 1 }] });

    const response = await GET(
      new NextRequest("https://widgets.example.com/api/charge-points/v2.0"),
      { params: params() }
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ data: [{ id: 1 }] });
  });
});
