import { z } from "zod";

/**
 * Error mapping untuk semua endpoint BFF.
 * Kode tetap konsisten dan dapat di-test dengan fixture.
 */
export enum WeatherErrorCode {
  LOCATION_NOT_FOUND = "LOCATION_NOT_FOUND",
  GEOCODING_ERROR = "GEOCODING_ERROR",
  INVALID_PARAMS = "INVALID_PARAMS",
  RATE_LIMITED = "RATE_LIMITED",
  UNAVAILABLE = "UPSTREAM_UNAVAILABLE",
  PARSE_ERROR = "PARSE_ERROR",
  CACHE_MISS = "CACHE_MISS",
}

interface ApiError {
  code: string;
  message: string;
  status?: number;
}

export function toApiError(code: WeatherErrorCode, msg: string, status?: number): ApiError {
  return { code, message: msg, status };
}

/**
 * Parse response JSON dan validasi Zod schema.
 * Return parsed value atau throw dengan detail yang jelas.
 */
export function parseZod<T>(data: unknown, schema: z.ZodType<T>): T {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  
  const firstError = result.error.errors?.[0];
  const firstPath = firstError ? firstError.path.join(".") : "unknown";
  const errorMsg = firstError?.message ?? "Invalid payload structure";
  
  console.warn(`[BFF] Zod parse error at ${firstPath}: ${errorMsg}`);
  throw new Error(`PARSE_ERROR: ${errorMsg}`);
}
