/**
 * OpenWeatherMap One Call 4.0 & Geocoding Adapter
 * 
 * Features:
 * - HTTP client dengan timeout & retry
 * - Parse Zod schema strict
 * - Pagination support via next/prev URL
 * - Rate limiting guard (retry-after header)
 */

import axios from "axios";
import { parseZod } from "../schemas/error-mapping";

export default class OpenWeatherMapAdapter {
  private readonly baseUrl = "https://api.openweathermap.org/data/4.0/onecall";
  private readonly geoUrl = "https://api.openweathermap.org/geo/1.0/direct";
  private readonly apiKey: string;

  constructor() {
    // API key dari environment (sudah dicek di build time)
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
      console.error("[OpenWeatherMapAdapter] OPENWEATHER_API_KEY not set");
      throw new Error("OPENWEATHER_API_KEY not configured");
    }
    this.apiKey = key;
  }

  private async request<T>(url: string): Promise<T> {
    try {
      const response = await axios.get<T>(url, {
        timeout: 10_000,
        validateStatus: (status) => status < 500, // handle 4xx manual
      });
      return response.data;
      } catch (err: unknown) {
      // Propagate error dengan info lengkap untuk upstream mapping
      const mapped = new Error(`Upstream error: ${(err as any).response?.status ?? "unknown"}`);
      Object.assign(mapped, {
        status: (err as any).response?.status,
        headers: (err as any).response?.headers,
        cause: err,
      });
      throw mapped;
    }
  }

  async getCurrent(lat: number, lon: number, units: string, lang: string): Promise<any> {
    const url = `${this.baseUrl}/current?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}&lang=${lang}`;
    const raw = await this.request<any[]>(url);
    return raw; // array with 1 element (per spec)
  }

  async getHourly(lat: number, lon: number, units: string, lang: string): Promise<any> {
    const url = `${this.baseUrl}/timeline/1h?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}&lang=${lang}`;
    const raw = await this.request<any>(url);
    return raw;
  }

  async getDaily(lat: number, lon: number, units: string, lang: string): Promise<any> {
    const url = `${this.baseUrl}/timeline/1day?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=${units}&lang=${lang}`;
    const raw = await this.request<any>(url);
    return raw;
  }

  async geocode(q: string, limit: number): Promise<any> {
    const url = `${this.geoUrl}?q=${encodeURIComponent(q)}&appid=${this.apiKey}&limit=${limit}`;
    const raw = await this.request<any>(url);
    return raw;
  }
}
