import { NextRequest, NextResponse } from "next/server";
import OpenWeatherMapAdapter from "@/server/providers/openweathermap-adapter";
import { parseZod, WeatherErrorCode } from "@/server/schemas/error-mapping";
import { GeocodingResponseSchema } from "@/server/schemas/weather-schemas";

// Cache geocoding results for 24 hours (search queries rarely change)
const GEOCACHE_TTL_MS = 24 * 60 * 60 * 1000;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  
  // Validate params
  const q = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") ?? "5", 10);

  if (!q || q.trim().length < 2) {
    return NextResponse.json(
      { error: { code: WeatherErrorCode.INVALID_PARAMS, message: "Query parameter 'q' is required with minimum 2 characters." } },
      { status: 400 }
    );
  }

  if (isNaN(limit) || limit < 1 || limit > 20) {
    return NextResponse.json(
      { error: { code: WeatherErrorCode.INVALID_PARAMS, message: "'limit' must be between 1 and 20." } },
      { status: 400 }
    );
  }

  try {
    const adapter = new OpenWeatherMapAdapter();
    const result = await adapter.geocode(q, Math.min(limit, 20));

    // Parse & validate Zod schema
    const parsed = parseZod(result, GeocodingResponseSchema);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.warn(`[BFF /api/geocode] upstream error:`, err);
    
    let errorCode = WeatherErrorCode.GEOCODING_ERROR;
    let httpStatus = 502;

    if ((err as any)?.status === 401) {
      errorCode = WeatherErrorCode.GEOCODING_ERROR;
      httpStatus = 401;
    } else if ((err as any)?.status === 404) {
      errorCode = WeatherErrorCode.LOCATION_NOT_FOUND;
      httpStatus = 404;
    } else if ((err as any)?.status === 429) {
      errorCode = WeatherErrorCode.RATE_LIMITED;
      httpStatus = 429;
    }

    return NextResponse.json(
      { error: { code: errorCode, message: errorCode === WeatherErrorCode.RATE_LIMITED ? "Quota exhausted." : "Geocoding failed." } },
      { status: httpStatus }
    );
  }
}
