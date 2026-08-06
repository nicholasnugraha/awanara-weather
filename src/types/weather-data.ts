/**
 * Type definitions for Dashboard Weather Data
 */

export interface Location {
  lat: number;
  lon: number;
  timezone: string;
}

export interface CurrentCondition {
  temp: number;
  description: string;
  humidity: number;
  wind_speed: number;
  pressure: number;
  visibility: number;
  uvi?: number;
}

export interface HourlyForecastItem {
  dt: number;
  temp: number;
  description: string;
}

export interface DailyForecastItem {
  dt: number;
  temp: { min: number; max: number };
  description: string;
}

export interface WeatherData {
  location: Location;
  fetchedAt: number;
  current: CurrentCondition;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
}
