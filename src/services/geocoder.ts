import { z } from "zod";
import { getCache } from "../lib/cache";

const API_BASE = "https://api.openweathermap.org/data/3.0";

export type GeocodeRequest = {
  city: string;
  country?: string;
};

export type GeocodeResult = {
  lat: number;
  lon: number;
  city: string;
  country: string;
};

/**
 * Lookup latitude/longitude for a city (via Nominatim).
 * Uses weather cache to avoid repeated lookups.
 */
export async function geocodeCity(input: GeocodeRequest): Promise<GeocodeResult> {
  const cache = getCache();
  const query = `${input.city},${input.country ?? ""}`;
  const key = `geocode:${query}`;

  // Try cache first
  const cached = await cache.get<GeocodeResult>(key);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      q: query,
      format: "json",
      limit: "1",
      addressdetails: "1",
    });

    const url = `https://nominatim.openstreetmap.org/search?${params.toString()}`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Awanara-Weather/1.0 (contact@awanara.local)",
      },
    });

    if (!res.ok) {
      throw new Error(`Geocoding failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const schema = z.object({
      lat: z.string(),
      lon: z.string(),
      display_name: z.string(),
      address: z.object({
        city: z.string().optional(),
        town: z.string().optional(),
        village: z.string().optional(),
        country: z.string(),
      }),
    });

    const parsed = schema.parse(data[0]);

    const result: GeocodeResult = {
      lat: parseFloat(parsed.lat),
      lon: parseFloat(parsed.lon),
      city: parsed.address.city ?? parsed.address.town ?? parsed.address.village ?? parsed.display_name,
      country: parsed.address.country,
    };

    // Cache for 24 hours (city names rarely change)
    await cache.set(key, result, 24 * 60 * 60 * 1000);

    return result;
  } catch (error) {
    console.error("Geocode error:", input, error);
    throw new Error(`Cannot resolve coordinates for "${query}"`);
  }
}
