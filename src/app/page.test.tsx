// Skip unit tests - test via e2e instead
import { describe, it, expect } from "vitest";

describe("Skip", () => {
  it.skip("HomePage renders without crashing", () => {
    // Will be tested via e2e
    expect(true).toBe(true);
  });
});
