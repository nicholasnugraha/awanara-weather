"use client";

import { useEffect, useState } from "react";
import { CurrentWeatherHero } from "@/components/weather/current-weather-hero";
import { HourlyForecastStrip } from "@/components/weather/hourly-forecast-strip";
import { DailyForecastCard } from "@/components/weather/daily-forecast-card";
import { WeatherDetailsGrid } from "@/components/weather/weather-details-grid";
import { SearchBar } from "@/components/weather/search-bar";
import { ThemeToggle } from "@/components/weather/theme-toggle";
import { HeroSkeleton, MetricCardSkeleton, HourlyForecastStripSkeleton, DailyForecastCardSkeleton } from "@/components/ui/skeleton";
import type { Theme } from "@/components/theme/theme-provider";
import type { WeatherData } from "@/types/weather-data";
import { weatherService } from "@/services/weather-service";

export const DashboardContainer = ({ theme }: { theme: Theme }) => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("Jakarta, ID");
  const [coords, setCoords] = useState({ lat: 0.7893, lon: 106.65 });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await weatherService.fetchWeather(coords.lat, coords.lon);

        if (result.error) {
          throw new Error(result.error);
        }

        if (!result.data) {
          throw new Error("No data received from API");
        }

        const transformedData: WeatherData = {
          location: result.data.location,
          fetchedAt: Date.now(),
          current: {
            temp: result.data.current.temp,
            description: result.data.current.description.charAt(0).toUpperCase() + result.data.current.description.slice(1),
            humidity: result.data.current.humidity,
            wind_speed: result.data.current.wind_speed,
            pressure: result.data.current.pressure,
            visibility: result.data.current.visibility,
            uvi: result.data.current.uvi,
          },
          hourly: result.data.hourly.map((hour) => ({
            dt: hour.dt * 1000,
            temp: hour.temp,
            description: hour.description.charAt(0).toUpperCase() + hour.description.slice(1),
          })),
          daily: result.data.daily.map((day: any) => ({
            dt: day.dt * 1000,
            temp: { min: day.temp.min, max: day.temp.max },
            description: day.description.charAt(0).toUpperCase() + day.description.slice(1),
          })),
        };

        setData(transformedData);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError(err instanceof Error ? err.message : "Failed to load weather data");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coords]);

  const handleCitySelect = async (selectedCity: string) => {
    setCity(selectedCity);
    
    const geoResult = await weatherService.geocodeCity(selectedCity);
    
    if (geoResult.lat && geoResult.lon) {
      setCoords({ lat: geoResult.lat, lon: geoResult.lon });
    } else {
      setError("Kota tidak ditemukan. Silakan coba lagi.");
    }
  };

  const formatTime = (dt: number): string => {
    const date = new Date(dt);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDate = (dt: number): string => {
    const date = new Date(dt);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()]!;
  };

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-danger mb-4">{error || "Error loading weather data"}</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-brand-500 px-6 py-3 text-white hover:bg-brand-600 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-surface p-4 md:p-6">
        <header className="mb-6 space-y-4">
          <SearchBar onCitySelect={handleCitySelect} />
          <div className="h-8 w-64 animate-pulse rounded bg-surface-container" />
        </header>

        <section className="mb-6">
          <HeroSkeleton />
        </section>

        <section className="mb-6">
          <h2 className="mb-3 h-6 w-40 rounded bg-surface-container" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="mb-3 h-6 w-52 rounded bg-surface-container" />
          <HourlyForecastStripSkeleton />
        </section>

        <section>
          <h2 className="mb-3 h-6 w-64 rounded bg-surface-container" />
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <DailyForecastCardSkeleton key={i} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar onCitySelect={handleCitySelect} />
          
          <ThemeToggle currentTheme={theme} onToggle={() => {}} />
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
          <span>{city}</span>
          <span>Diperbarui: {new Date(data.fetchedAt).toLocaleTimeString()}</span>
        </div>
      </header>

      <section className="mb-6">
        <CurrentWeatherHero 
          temperature={data.current.temp}
          condition={data.current.description}
          city={city}
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-text">Detail Cuaca</h2>
        <WeatherDetailsGrid
          humidity={data.current.humidity}
          windSpeed={data.current.wind_speed}
          pressure={data.current.pressure}
          visibility={data.current.visibility}
          uvIndex={data.current.uvi}
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-text">Jaman Berikutnya</h2>
        <HourlyForecastStrip 
          hourlyForecasts={data.hourly.map(hour => ({
            time: formatTime(hour.dt),
            temperature: hour.temp,
            condition: hour.description,
          }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-text">Prakiraan 4 Hari</h2>
        <div className="space-y-2">
          {data.daily.map((day, index) => (
            <DailyForecastCard
              key={index}
              date={formatDate(day.dt)}
              minTemp={day.temp.min}
              maxTemp={day.temp.max}
              condition={day.description}
              icon="01d"
            />
          ))}
        </div>
      </section>
    </main>
  );
};
