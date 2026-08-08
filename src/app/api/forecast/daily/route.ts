import { NextRequest, NextResponse } from "next/server";
import { getCache } from "@/lib/cache";
import { handleError } from "@/lib/api-error";
import { geocodeCity } from "@/services/geocoder";

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

/**
 * Fetch daily forecast (7-day extended weather)
 */
export async function GET(
  req: NextRequest,
): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const city = searchParams.get("city");
    const country = searchParams.get("country");

    if (!city) {
      return NextResponse.json(
        { error: "Missing required parameter: city" },
        { status: 400 }
      );
    }

    // Geocode the city to get coordinates
    const location = await geocodeCity({
      city: city as string,
      country: (country ?? "ID") as string,
    });

    const cache = getCache();
    const cacheKey = `daily:${location.lat}:${location.lon}`;

    // Try cached data first
    const cachedForecast = await cache.get<any>(cacheKey);
    if (cachedForecast) {
      return NextResponse.json(cachedForecast);
    }

    if (!OPENWEATHER_API_KEY) {
      throw new Error("OpenWeather API key not configured");
    }

    const params = new URLSearchParams({
      lat: location.lat.toString(),
      lon: location.lon.toString(),
      appid: OPENWEATHER_API_KEY,
      units: "metric",
    });

    const response = await fetch(
      `${process.env.WEATHER_BASE_URL || "https://api.openweathermap.org/data/3.0"}/forecast?${params}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      throw new Error(`Daily forecast API returned ${response.status}`);
    }

    const forecastData = await response.json();

    // Cache for 1 hour (daily forecasts change less frequently)
    await cache.set(cacheKey, forecastData, 60 * 60 * 1000);

    return NextResponse.json(forecastData);
  } catch (error) {
    const { status, body } = handleError(error, 500);
    return NextResponse.json(body, { status });
  }
}
