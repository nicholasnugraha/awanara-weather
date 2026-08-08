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

  test("uses cache on repeated calls", async () => {
    const cachedResult = {
      lat: -6.2,
      lon: 106.8,
      city: "Test City",
      country: "Test Country",
    };

    const mockCache = {
      get: vi.fn().mockResolvedValue(cachedResult),
      set: vi.fn(),
      clearAll: vi.fn(),
    };

    // Override the cache getter temporarily
    const originalGetCache = await import("../lib/cache");
    const originalImpl = originalGetCache.getCache;
    
    (originalGetCache as any).getCache = () => mockCache;

    try {
      const result = await geocodeCity({ city: "Test City", country: "TC" });
      expect(mockCache.get).toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
      expect(result).toBe(cachedResult);
    } finally {
      (originalGetCache as any).getCache = originalImpl;
    }
  });
});
