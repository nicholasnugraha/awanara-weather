import { z } from "zod";

/**
 * Schema OpenWeatherMap One Call 4.0 /data/4.0/onecall/current
 * 
 * Note: field opsional = missing dari response (bukan null), bukan undefined.
 * Parsing strict: unknown fields akan ditolak.
 */
export const CurrentConditionsSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  timezone: z.string().trim(), // IANA timezone, e.g. "Asia/Jakarta"
  timezone_offset: z.number(), // detik dari UTC
  data: z.array(
    z.object({
      dt: z.number(),
      sunrise: z.number().optional(),
      sunset: z.number().optional(),
      temp: z.number(),
      feels_like: z.number(),
      pressure: z.number(),
      humidity: z.number(),
      dew_point: z.number().optional(),
      uvi: z.number().optional(),
      clouds: z.number().optional(),
      visibility: z.number().optional(),
      wind_speed: z.number(),
      wind_deg: z.number().optional(),
      wind_gust: z.number().optional(),
      weather: z.array(
        z.object({
          id: z.number(),
          main: z.string(),
          description: z.string(),
          icon: z.string(),
        })
      ),
      alerts: z.array(z.string()).optional(), // array alert IDs
    })
  ),
});

/**
 * Schema One Call 4.0 /data/4.0/onecall/timeline/1h
 * 
 * Max record: 20 (1 jam per record). Pagination via next/prev URL.
 */
export const HourlyForecastSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  timezone: z.string().trim(),
  timezone_offset: z.number(),
  data: z.array(
    z.object({
      dt: z.number(),
      sunrise: z.number().optional(),
      sunset: z.number().optional(),
      moonrise: z.number().optional(),
      moonset: z.number().optional(),
      moon_phase: z.number().optional(),
      temp: z.number(),
      feels_like: z
        .object({
          day: z.number().optional(),
          night: z.number().optional(),
          eve: z.number().optional(),
          morn: z.number().optional(),
        })
        .partial()
        .optional(),
      pressure: z.number(),
      humidity: z.number(),
      dew_point: z.number().optional(),
      wind_speed: z.number(),
      wind_deg: z.number().optional(),
      wind_gust: z.number().optional(),
      weather: z.array(
        z.object({
          id: z.number(),
          main: z.string(),
          description: z.string(),
          icon: z.string(),
        })
      ),
      pop: z.number().min(0).max(1).optional(), // probability of precipitation
      clouds: z.number().optional(),
      visibility: z.number().optional(),
      rain: z.number().optional(),
      snow: z.number().optional(),
      uvi: z.number().optional(),
    })
  ),
  prev: z.string().url().optional(),
  next: z.string().url().optional(),
});

/**
 * Schema One Call 4.0 /data/4.0/onecall/timeline/1day
 * 
 * Max record: 10 (1 hari per record). Temp object punya field day/min/max/night/eve/morn.
 */
export const DailyForecastSchema = z.object({
  lat: z.number(),
  lon: z.number(),
  timezone: z.string().trim(),
  timezone_offset: z.number(),
  data: z.array(
    z.object({
      dt: z.number(),
      sunrise: z.number().optional(),
      sunset: z.number().optional(),
      moonrise: z.number().optional(),
      moonset: z.number().optional(),
      moon_phase: z.number().optional(),
      temp: z.object({
        day: z.number(),
        min: z.number(),
        max: z.number(),
        night: z.number().optional(),
        eve: z.number().optional(),
        morn: z.number().optional(),
      }),
      feels_like: z
        .object({
          day: z.number().optional(),
          night: z.number().optional(),
          eve: z.number().optional(),
          morn: z.number().optional(),
        })
        .partial()
        .optional(),
      pressure: z.number(),
      humidity: z.number(),
      dew_point: z.number().optional(),
      wind_speed: z.number(),
      wind_deg: z.number().optional(),
      wind_gust: z.number().optional(),
      weather: z.array(
        z.object({
          id: z.number(),
          main: z.string(),
          description: z.string(),
          icon: z.string(),
        })
      ),
      clouds: z.number().optional(),
      pop: z.number().min(0).max(1).optional(),
      rain: z.number().optional(),
      snow: z.number().optional(),
      uvi: z.number().optional(),
    })
  ),
  prev: z.string().url().optional(),
  next: z.string().url().optional(),
});

/**
 * Geocoding direct API (/geo/1.0/direct) response
 */
export const GeocodingResponseSchema = z.array(
  z.object({
    name: z.string(),
    local_names: z.record(z.string()).optional().or(z.undefined()), // optional language names
    country: z.string().optional(),
    state: z.string().optional(),
    lat: z.number(),
    lon: z.number(),
    utf8: z.boolean().optional(),
  })
);

/**
 * Geocoding reverse API (/geo/1.0/reverse) response
 */
export const ReverseGeocodingSchema = GeocodingResponseSchema;

// Export parsed type helpers
export type CurrentConditions = z.infer<typeof CurrentConditionsSchema>;
export type HourlyForecast = z.infer<typeof HourlyForecastSchema>;
export type DailyForecast = z.infer<typeof DailyForecastSchema>;
export type GeocodingResponse = z.infer<typeof GeocodingResponseSchema>;
export type ReverseGeocoding = z.infer<typeof ReverseGeocodingSchema>;
