import { describe, expect, test, vi } from "vitest";
import { geocodeCity } from "./geocoder";

// Mock fetch globally for tests
global.fetch = vi.fn();

describe("geocodeCity", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("returns coordinates for Jakarta", async () => {
    const mockResponse = [
      {
        lat: "-6.2087634",
        lon: "106.8455992",
        display_name: "Jakarta, Indonesia",
        address: {
          city: "Jakarta",
          country: "Indonesia",
        },
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await geocodeCity({ city: "Jakarta", country: "ID" });

    expect(result.city).toBe("Jakarta");
    expect(result.country).toBe("Indonesia");
    expect(result.lat).toBeCloseTo(-6.2087634, 2);
    expect(result.lon).toBeCloseTo(106.8455992, 2);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("nominatim.openstreetmap.org"),
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": "Awanara-Weather/1.0 (contact@awanara.local)",
        }),
      })
    );
  });

  test("throws error when API fails", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("Network error"));

    await expect(geocodeCity({ city: "NonExistentCity123" })).rejects.toThrow(
      /Cannot resolve coordinates/
    );
  });

  test("caches successful results internally", async () => {
    const mockResponse = [
      {
        lat: "-6.2087634",
        lon: "106.8455992",
        display_name: "Test City, Test Country",
        address: {
          city: "Test City",
          country: "Test Country",
        },
      },
    ];

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    // First call - should hit API
    const result1 = await geocodeCity({ city: "Test City", country: "TC" });
    
    // Second call with same params - should use cache (no second fetch)
    const result2 = await geocodeCity({ city: "Test City", country: "TC" });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result1).toEqual(result2);
    expect(result1.city).toBe("Test City");
  });
});
