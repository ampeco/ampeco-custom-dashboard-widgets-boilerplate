/**
 * Tests for what the data hooks report when a call fails
 */

import { throwIfNotOk } from "@/lib/hooks/utils";
import { ApiRequestError } from "@/lib/utils/api-error";
import { ERROR_MESSAGES } from "@/lib/utils/error-handler";

function answer(body: unknown, status: number, statusText = "") {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => {
      if (body === undefined) {
        throw new SyntaxError("Unexpected end of JSON input");
      }
      return body;
    },
  } as unknown as Response;
}

describe("throwIfNotOk", () => {
  it("should do nothing when the call succeeded", async () => {
    await expect(
      throwIfNotOk(answer({ data: [] }, 200), "Failed to fetch the data.")
    ).resolves.toBeUndefined();
  });

  it("should show the message the proxy sent, not the status text", async () => {
    await expect(
      throwIfNotOk(
        answer({ error: "Charge point not found." }, 404),
        "Failed to fetch the data."
      )
    ).rejects.toMatchObject({
      status: 404,
      message: "Charge point not found.",
    });
  });

  it("should tell an admin what to do when the token has expired", async () => {
    const error = await throwIfNotOk(
      answer({ error: "Unauthorized" }, 401),
      "Failed to fetch the data."
    ).catch((thrown: unknown) => thrown);

    expect((error as ApiRequestError).message).toBe(
      ERROR_MESSAGES.API_UNAUTHORIZED
    );
    expect((error as ApiRequestError).status).toBe(401);
  });

  it("should keep field validation errors for a form", async () => {
    await expect(
      throwIfNotOk(
        answer(
          {
            error: "The given data was invalid.",
            errors: { name: ["The name field is required."] },
          },
          422
        ),
        "Failed to update the resource."
      )
    ).rejects.toMatchObject({
      status: 422,
      errors: { name: ["The name field is required."] },
    });
  });

  it("should not leave a sentence that stops short when there is no status text", async () => {
    // Over HTTP/2 statusText is empty, which used to produce "Failed to fetch:".
    const error = await throwIfNotOk(
      answer(undefined, 500),
      "Failed to fetch the data."
    ).catch((thrown: unknown) => thrown);

    expect((error as Error).message).toBe("Failed to fetch the data.");
    expect((error as Error).message).not.toMatch(/:\s*$/);
  });

  it("should fall back when the body carries no message", async () => {
    await expect(
      throwIfNotOk(answer({}, 500), "Failed to delete the resource.")
    ).rejects.toMatchObject({
      status: 500,
      message: "Failed to delete the resource.",
    });
  });

  it("should throw a real Error so a page can read its message", async () => {
    const error = await throwIfNotOk(
      answer({ error: "Nope." }, 403),
      "Failed to fetch the data."
    ).catch((thrown: unknown) => thrown);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiRequestError);
  });
});
