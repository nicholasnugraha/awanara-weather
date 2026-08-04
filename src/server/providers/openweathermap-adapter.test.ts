import OpenWeatherMapAdapter from "./openweathermap-adapter";
import { parseZod } from "../schemas/error-mapping";
import { HourlyForecastSchema } from "../schemas/weather-schemas";

describe("OpenWeatherMapAdapter", () => {
  const mockHourly = {
    lat: 0.1,
    lon: -98.5,
    timezone: "Asia/Jakarta",
    timezone_offset: 25200,
    data: [
      {
        dt: 1722796800,
        temp: 30.5,
        feels_like: { day: 35.0 },
        pressure: 1010,
        humidity: 70,
        dew_point: 24.2,
        wind_speed: 5.5,
        wind_deg: 120,
        weather: [{ id: 800, main: "Clear", description: "sky is clear", icon: "01d" }],
        pop: 0.1,
        uvi: 12.3,
        rain: 0,
      },
    ],
  };

  it("parse hourly dengan Zod valid", () => {
    // Mock axios globally
    vi.mock("axios");
    
    // Note: actual test would require full mocking; here we verify parse logic directly
    const parsed = parseZod(mockHourly, HourlyForecastSchema);
    
    expect(parsed.data.length).toBe(1);
    expect(parsed.timezone).toBe("Asia/Jakarta");
    expect(parsed.data[0].pop).toBe(0.1);
  });

  it("reject schema invalid (missing required field)", () => {
    const badData: any = { ...mockHourly };
    delete badData.data; // missing required data array
    
    expect(() => parseZod(badData, HourlyForecastSchema)).toThrow(/PARSE_ERROR/i);
  });
});
