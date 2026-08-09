import { describe, expect, test } from "vitest";
import { saveRecentLocation, getRecentLocations, clearRecentLocations } from "./recent-locations";

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("Recent Locations", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  test("saves single location correctly", () => {
    const location = {
      city: "Jakarta",
      country: "ID",
      lat: -6.2,
      lon: 106.8,
    };

    saveRecentLocation(location);

    const result = getRecentLocations();
    expect(result.length).toBe(1);
    expect(result[0]?.city).toBe("Jakarta");
    expect(result[0]?.lat).toBe(-6.2);
  });

  test("maintains max limit of locations", () => {
    // Save 5 locations (max limit)
    for (let i = 0; i < 5; i++) {
      saveRecentLocation({
        city: `City${i}`,
        country: "ID",
        lat: -6 + i * 0.1,
        lon: 106 + i * 0.1,
      });
    }

    // Save one more - should push first out
    saveRecentLocation({
      city: "New City",
      country: "ID",
      lat: -6,
      lon: 106,
    });

    const result = getRecentLocations();
    expect(result.length).toBe(5);
    if (result[0]) {
      expect(result[0].city).toBe("New City");
    }
    if (result[4]) {
      expect(result[4].city).not.toBe("City0");
    }
  });

  test("removes duplicates", () => {
    saveRecentLocation({
      city: "Jakarta",
      country: "ID",
      lat: -6.2,
      lon: 106.8,
    });

    // Try to save same city again with different coords
    saveRecentLocation({
      city: "Jakarta",
      country: "ID",
      lat: -6.3,
      lon: 107.0,
    });

    const result = getRecentLocations();
    expect(result.length).toBe(1);
    if (result[0]) {
      expect(result[0].city).toBe("Jakarta");
    }
  });

  test("clears all locations", () => {
    saveRecentLocation({ city: "Test", country: "US", lat: 40.7, lon: -74.0 });
    saveRecentLocation({ city: "Another", country: "UK", lat: 51.5, lon: -0.1 });

    clearRecentLocations();

    const result = getRecentLocations();
    expect(result.length).toBe(0);
  });
});
