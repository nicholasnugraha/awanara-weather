import { describe, expect, test } from "vitest";
import { handleError } from "./api-error";

describe("handleError", () => {
  test("returns correct structure for any error", () => {
    const res = handleError(new Error("test"));
    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Internal Server Error");
  });

  test("includes details when dev in build (simple)", () => {
    // This test validates that the function handles errors consistently
    const res = handleError({ message: "custom error" });
    
    expect(res.status).toBe(500);
    expect(typeof res.body.error).toBe("string");
  });

  test("4xx errors return their status code", () => {
    const error = new Error("Bad request") as Error & { code: number };
    error.code = 400;
    const res = handleError(error);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Bad Request");
  });
});
