import { NextRequest, NextResponse } from "next/server";
import OpenWeatherMapAdapter from "@/server/providers/openweathermap-adapter";
import { weatherCache } from "@/server/cache/cache-layer";
import { parseZod, WeatherErrorCode } from "@/server/schemas/error-mapping";
import { CurrentConditionsSchema, HourlyForecastSchema, DailyForecastSchema } from "@/server/schemas/weather-schemas";

// Cache key generator (rounded lat/lon + units + lang)
function cacheKey(lat: number, lon: number, units: string, lang: string): string {
  return `weather_${lat.toFixed(4)}_${lon.toFixed(4)}_${units}_${lang}`;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  // 1. Validate params
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const units = searchParams.get("units") || "metric";
  const lang = searchParams.get("lang") || "id";

  if (!latStr || !lonStr) {
    return NextResponse.json(
      { error: { code: WeatherErrorCode.INVALID_PARAMS, message: "Query parameter 'lat' and 'lon' are required." } },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json(
      { error: { code: WeatherErrorCode.INVALID_PARAMS, message: "'lat' and 'lon' must be valid numbers." } },
      { status: 400 }
    );
  }

  // Sanitize bounds (-90..90 for lat, -180..180 for lon)
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json(
      { error: { code: WeatherErrorCode.INVALID_PARAMS, message: "Invalid coordinates." } },
      { status: 400 }
    );
  }

  const unitsAllowed = ["standard", "metric", "imperial"];
  if (!unitsAllowed.includes(units)) {
    return NextResponse.json(
      { error: { code: WeatherErrorCode.INVALID_PARAMS, message: "'units' must be standard/metric/imperial." } },
      { status: 400 }
    );
  }

  // 2. Try cache (per endpoint contract: current+hourly+daily = satu snapshot unified)
  const key = cacheKey(lat, lon, units, lang);
  const cached = weatherCache.get(key);
  if (cached) {
    return NextResponse.json({
      ...cached,
      fromCache: true,
      cachedAt: Date.now(),
      expiresAt: Math.floor(Date.now() / 1000) + 600, // TTL 10 menit dari sekarang (loose)
    });
  }

  // 3. Call OWM adapter
  try {
    const adapter = new OpenWeatherMapAdapter();
    
    // Fetch three endpoints: current (1h), hourly (20 records), daily (10 records)
    const [current, hourly, daily] = await Promise.all([
      adapter.getCurrent(lat, lon, units, lang),
      adapter.getHourly(lat, lon, units, lang),
      adapter.getDaily(lat, lon, units, lang),
    ]);

    // Parse with Zod (strict validation)
    const parsedCurrent = parseZod(current[0], CurrentConditionsSchema);
    const parsedHourly = parseZod(hourly, HourlyForecastSchema);
    const parsedDaily = parseZod(daily, DailyForecastSchema);

    // Unified snapshot structure (domain model)
    const snapshot = {
      location: {
        lat: parsedCurrent.lat,
        lon: parsedCurrent.lon,
        timezone: parsedCurrent.timezone,
      },
      fetchedAt: Math.floor(Date.now() / 1000),
      current: parsedCurrent.data[0],
      hourly: parsedHourly.data, // up to 20 records (20 hours)
      daily: parsedDaily.data,   // up to 10 records (10 days)
      hourlyPagination: {
        prev: parsedHourly.prev ?? null,
        next: parsedHourly.next ?? null,
      },
      dailyPagination: {
        prev: parsedDaily.prev ?? null,
        next: parsedDaily.next ?? null,
      },
    };

    // Store in cache (10 min TTL)
    weatherCache.set(key, snapshot, 10 * 60 * 1000);

    return NextResponse.json(snapshot);
  } catch (err: unknown) {
    if (err instanceof Error && err.message.startsWith("PARSE_ERROR:")) {
      return NextResponse.json(
        { error: { code: WeatherErrorCode.PARSE_ERROR, message: err.message.replace("PARSE_ERROR: ", "") } },
        { status: 500 }
      );
    }
    
    // Handle rate limit & upstream failure
    const responseHeaders = (err as any)?.headers?.get ?? undefined;
    let errorCode = WeatherErrorCode.UNAVAILABLE;
    let httpStatus = 502;

    // Detect rate limit via header or known status
    if ((err as any)?.status === 429 || (err as any)?.cause?.status === 429) {
      errorCode = WeatherErrorCode.RATE_LIMITED;
      httpStatus = 429;
    } else {
      errorCode = WeatherErrorCode.UNAVAILABLE;
      httpStatus = 502;
    }

    console.warn(`[BFF /api/weather] upstream error: ${errorCode}`, err);
    return NextResponse.json(
      { error: { code: errorCode, message: errorCode === WeatherErrorCode.RATE_LIMITED ? "Quota exhausted." : "Upstream unavailable." } },
      { status: httpStatus }
    );
  }
}
