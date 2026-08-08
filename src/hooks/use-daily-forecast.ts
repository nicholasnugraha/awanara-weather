import { useState, useEffect } from "react";

export type WeatherCondition = "clear" | "clouds" | "rain" | "snow" | "thunderstorm" | "drizzle" | "mist" | "fog";

export type DailyForecastData = {
  date: Date;
  tempMax: number;
  tempMin: number;
  condition: WeatherCondition;
  humidity: number;
  windSpeed: number;
  description: string;
  iconCode: string;
};

export function useDailyForecast(city: string) {
  const [data, setData] = useState<DailyForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!city) return;

    let cancelled = false;

    const fetchForecast = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ city, country: "ID" });
        const res = await fetch(`/api/forecast?${params}`);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const json = await res.json();
        
        // Transform forecast data to daily format (group by day)
        const dailyData: Map<string, DailyForecastData> = new Map();

        (json.list ?? []).forEach((item: any) => {
          const date = new Date(item.dt * 1000);
          const dateKey = date.toISOString().split('T')[0];
          
          if (!dailyData.has(dateKey)) {
            const weather = item.weather?.[0];
            const weatherMain = weather?.main ?? "Clear";
            const weatherDesc = weather?.description ?? "";
            const iconCode = weather?.icon ?? "01d";
            
            // Explicit string type guards
            const safeWeatherMain = typeof weatherMain === "string" ? weatherMain : "Clear";
            const safeIconCode = typeof iconCode === "string" && iconCode.length > 0 ? iconCode : "01d";
            
            dailyData.set(dateKey, {
              date: date,
              tempMax: item.main?.temp_max ?? 30,
              tempMin: item.main?.temp_min ?? 24,
              condition: getWeatherCondition(safeWeatherMain),
              humidity: item.main?.humidity ?? 75,
              windSpeed: item.wind?.speed ?? 3,
              description: (weatherDesc || "Clear") as string,
              iconCode: safeIconCode as string,
            });
          } else {
            // Update max/min temps for the day
            const existing = dailyData.get(dateKey);
            if (existing) {
              const currentMax = item.main?.temp_max ?? 30;
              const currentMin = item.main?.temp_min ?? 24;
              existing.tempMax = Math.max(existing.tempMax, currentMax);
              existing.tempMin = Math.min(existing.tempMin, currentMin);
            }
          }
        });

        if (!cancelled) {
          const sortedData = Array.from(dailyData.values()).sort(
            (a, b) => a.date.getTime() - b.date.getTime()
          );
          setData(sortedData.slice(0, 7)); // Last 7 days
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch forecast");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchForecast();

    return () => {
      cancelled = true;
    };
  }, [city]);

  return { data, loading, error };
}

function getWeatherCondition(main: string): WeatherCondition {
  switch (main) {
    case "Clear":
      return "clear";
    case "Clouds":
      return "clouds";
    case "Rain":
      return "rain";
    case "Snow":
      return "snow";
    case "Thunderstorm":
      return "thunderstorm";
    case "Drizzle":
      return "drizzle";
    case "Mist":
    case "Haze":
      return "mist";
    case "Fog":
      return "fog";
    default:
      return "clouds";
  }
}
