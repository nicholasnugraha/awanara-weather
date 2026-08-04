import { describe, it, expect, vi } from "vitest";
import { weatherService } from "./weather-service";

// Mock fetch globally
(global as any).fetch = vi.fn();

describe("WeatherService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear console error spies
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("fetchWeather", () => {
    it("successfully fetches weather data", async () => {
      const mockData = {
        location: { lat: -6.2088, lon: 106.8456, timezone: "Asia/Jakarta" },
        fetchedAt: Date.now(),
        current: { temp: 30, description: "clear sky", humidity: 70, wind_speed: 10, pressure: 1010, visibility: 10, uvi: 8 },
        hourly: [],
        daily: [],
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await weatherService.fetchWeather(-6.2088, 106.8456);

      expect(result.data).toBeDefined();
      expect(result.data?.location.lat).toBe(-6.2088);
    });

    it("returns error when API fails", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const result = await weatherService.fetchWeather(0, 0);

      expect(result.data).toBeUndefined();
      expect(result.error).toContain("Network");
    });

    it("handles invalid response structure", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ incomplete: true }),
      });

      const result = await weatherService.fetchWeather(0, 0);

      expect(result.error).toBe("Invalid API response structure");
    });
  });

  describe("geocodeCity", () => {
    it("successfully geocodes city name", async () => {
      const mockResult = [{ name: "Jakarta", lat: -6.2088, lon: 106.8456 }];

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResult,
      });

      const result = await weatherService.geocodeCity("Jakarta");

      expect(result.lat).toBe(-6.2088);
      expect(result.lon).toBe(106.8456);
    });

    it("returns error when city not found", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      const result = await weatherService.geocodeCity("NonExistentCity");

      expect(result.lat).toBeUndefined();
      expect(result.lon).toBeUndefined();
      expect(result.error).toBe("City not found");
    });
  });

  describe("fetchWeatherByCity", () => {
    it("fetches weather by city name successfully", async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => [{ lat: -6.2088, lon: 106.8456 }] })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            location: { lat: -6.2088, lon: 106.8456, timezone: "Asia/Jakarta" },
            fetchedAt: Date.now(),
            current: { temp: 30, description: "clear", humidity: 70, wind_speed: 10, pressure: 1010, visibility: 10 },
            hourly: [],
            daily: [],
          }),
        });

      const result = await weatherService.fetchWeatherByCity("Jakarta");

      expect(result.data).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it("returns error when city doesn't exist", async () => {
      (global.fetch as any)
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      const result = await weatherService.fetchWeatherByCity("UnknownPlace");

      expect(result.error).toBe("City not found");
      expect(result.data).toBeUndefined();
    });
  });
});
