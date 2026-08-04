/**
 * Weather Service - Production BFF Integration Layer
 * Handles all API calls to OpenWeatherMap backend
 */
import type { Theme } from "@/components/theme/theme-provider";

// Type definitions for BFF API responses
export interface Location {
  lat: number;
  lon: number;
  timezone: string;
}

export interface CurrentCondition {
  temp: number;
  feels_like: number;
  description: string;
  humidity: number;
  wind_speed: number;
  wind_deg: number;
  pressure: number;
  visibility: number;
  uvi?: number;
}

export interface HourlyForecast {
  dt: number;
  temp: number;
  feels_like?: { day?: number; night?: number };
  description: string;
  icon: string;
  pop?: number;
  uvi?: number;
}

export interface DailyForecast {
  dt: number;
  temp: { min: number; max: number; day: number; night: number };
  description: string;
  icon: string;
  pop?: number;
  sunrise?: number;
  sunset?: number;
}

export interface BFFWeatherResponse {
  location: Location;
  fetchedAt: number;
  current: CurrentCondition;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}

export class WeatherService {
  private baseApiUrl: string;

  constructor() {
    this.baseApiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  }

  /**
   * Fetch weather data for given coordinates
   * @param lat Latitude
   * @param lon Longitude
   * @returns Parsed weather data or error
   */
  async fetchWeather(lat: number, lon: number): Promise<{ data?: BFFWeatherResponse; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseApiUrl}/weather?lat=${lat}&lon=${lon}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Validate required fields
      if (!data.location || !data.current || !data.hourly || !data.daily) {
        throw new Error("Invalid API response structure");
      }

      return { data };
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Geocode city name to get coordinates
   * @param cityName City name to search
   * @returns First match coordinates or error
   */
  async geocodeCity(cityName: string): Promise<{ lat?: number; lon?: number; error?: string }> {
    try {
      const response = await fetch(
        `${this.baseApiUrl}/geocode?q=${encodeURIComponent(cityName)}&limit=1`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const results = await response.json();

      if (!results || results.length === 0) {
        return { error: "City not found" };
      }

      const firstResult = results[0];
      return { lat: firstResult.lat, lon: firstResult.lon };
    } catch (error) {
      console.error("Failed to geocode city:", error);
      return { error: error instanceof Error ? error.message : "Unknown error" };
    }
  }

  /**
   * Convert city name to coordinates and then fetch weather
   * Convenience method for full city → weather flow
   */
  async fetchWeatherByCity(cityName: string): Promise<{ data?: BFFWeatherResponse; error?: string }> {
    // Step 1: Geocode city name
    const geoResult = await this.geocodeCity(cityName);
    
    if (geoResult.error || geoResult.lat === undefined || geoResult.lon === undefined) {
      return { error: geoResult.error || "Unable to find city" };
    }

    // Step 2: Fetch weather with coordinates
    return this.fetchWeather(geoResult.lat, geoResult.lon);
  }
}

// Singleton instance
export const weatherService = new WeatherService();
