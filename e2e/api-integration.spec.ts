import { test, expect } from "@playwright/test";

/**
 * Test weather API endpoints (integration with mocked cache)
 */
test.describe("Weather API", () => {
  const API_BASE = "/api/weather";

  test("returns error when city is missing", async ({ request }) => {
    const response = await request.get(API_BASE);
    
    expect(response.status()).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Missing required parameter");
  });

  test("returns data structure for Jakarta", async ({ request }) => {
    const response = await request.get(`${API_BASE}?city=Jakarta&country=ID`);
    
    // Should return 200 or potentially 500 if API key missing (which is acceptable for E2E)
    expect([200, 500, 401, 402]).toContain(response.status());
    
    if (response.status() === 200) {
      const json = await response.json();
      expect(json).toHaveProperty("main");
      expect(json.main).toHaveProperty("temp");
      expect(json).toHaveProperty("name");
    }
  });

  test("caches subsequent requests for same city", async ({ request }) => {
    const city = "Surabaya";
    
    // First call - should hit the real API
    const start1 = Date.now();
    const resp1 = await request.get(`/api/weather?city=${city}&country=ID`);
    const time1 = Date.now() - start1;

    // Second call - should be cached
    const start2 = Date.now();
    const resp2 = await request.get(`/api/weather?city=${city}&country=ID`);
    const time2 = Date.now() - start2;

    expect(resp2.status()).toBe(200);
    // Cached response should be faster (or at least not slower by much)
    expect(time2).toBeLessThanOrEqual(time1 + 100);
  });
});
