import { z } from "zod";

export const WeatherLocationSchema = z.object({
  city: z.string().min(1).describe("Nama kota"),
  country: z.string().length(2).describe("Kode negara ISO-3166 alpha-2"),
});

export const GeocodeResponseSchema = z.object({
  results: z.array(
    z.object({
      lat: z.number(),
      lon: z.number(),
      city: z.string(),
      country: z.string(),
    })
  ),
});

export type GeocodeResponse = z.infer<typeof GeocodeResponseSchema>;

export const CurrentWeatherSchema = z.object({
  temp: z.number(),
  feels_like: z.number(),
  humidity: z.number(),
  pressure: z.number(),
  wind_speed: z.number(),
  wind_deg: z.number(),
  weather: z.array(
    z.object({
      id: z.number(),
      main: z.string(),
      description: z.string(),
      icon: z.string(),
    })
  ),
  dt: z.number(),
});

export const HourlyForecastSchema = z.array(
  z.object({
    time: z.number(),
    temp: z.number(),
    weather: z.array(
      z.object({
        id: z.number(),
        main: z.string(),
        description: z.string(),
        icon: z.string(),
      })
    ),
    pop: z.number().optional(), // Probability of Precipitation
  })
);

export type HourlyForecast = z.infer<typeof HourlyForecastSchema>;

export const DailyForecastSchema = z.array(
  z.object({
    time: z.number(),
    sunrise: z.number(),
    sunset: z.number(),
    temp: z.object({
      min: z.number(),
      max: z.number(),
      day: z.number(),
      night: z.number(),
    }),
    weather: z.array(
      z.object({
        id: z.number(),
        main: z.string(),
        description: z.string(),
        icon: z.string(),
      })
    ),
    wind_speed: z.number(),
    humidity: z.number(),
  })
);

export type DailyForecast = z.infer<typeof DailyForecastSchema>;
