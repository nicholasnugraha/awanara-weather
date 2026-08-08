"use client";

import { useState, useEffect } from "react";
import { CurrentWeatherHero } from "@/components/weather/current-weather-hero";
import { HourlyForecastStrip } from "@/components/weather/hourly-forecast-strip";
import { DailyForecastCard } from "@/components/weather/daily-forecast-card";
import { WeatherDetailsGrid } from "@/components/weather/weather-details-grid";
import { SearchBar } from "@/components/weather/search-bar";
import { ThemeToggle } from "@/components/weather/theme-toggle";
import { HeroSkeleton, MetricCardSkeleton, HourlyForecastStripSkeleton, DailyForecastCardSkeleton } from "@/components/ui/skeleton";
import type { Theme } from "@/components/theme/theme-provider";
import { useWeatherData } from "@/hooks/use-weather";
import type { WeatherData } from "@/types/weather-data";

export const DashboardContainer = ({ theme }: { theme: Theme }) => {
  const [city, setCity] = useState("Jakarta, ID");
  const [coords, setCoords] = useState({ lat: 0.7893, lon: 106.65 });
  
  // Use SWR for caching & revalidation
  const { weather, loading: apiLoading, error: apiError, reload } = useWeatherData(coords.lat, coords.lon);
  
  const [localData, setLocalData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCitySelect = async (selectedCity: string, lat?: number, lon?: number) => {
    setCity(selectedCity);
    
    if (lat && lon) {
      setCoords({ lat, lon });
      return;
    }
    
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(selectedCity)}&limit=1`);
    if (!response.ok) return;
    
    const results = await response.json();
    if (results && results.length > 0) {
      setCoords({ lat: results[0].lat, lon: results[0].lon });
    } else {
      alert("Kota tidak ditemukan");
    }
  };

  useEffect(() => {
    if (weather) {
      try {
        const transformed: WeatherData = {
          location: weather.location,
          fetchedAt: Date.now(),
          current: {
            temp: Math.round(weather.current.temp),
            description: weather.current.description.charAt(0).toUpperCase() + weather.current.description.slice(1),
            humidity: weather.current.humidity,
            wind_speed: Math.round(weather.current.wind_speed),
            pressure: weather.current.pressure,
            visibility: Math.round(weather.current.visibility / 1000),
            uvi: weather.current.uvi,
          },
          hourly: weather.hourly.map((hour) => ({
            dt: hour.dt * 1000,
            temp: Math.round(hour.temp),
            description: hour.description.charAt(0).toUpperCase() + hour.description.slice(1),
          })),
          daily: weather.daily.map((day) => ({
            dt: day.dt * 1000,
            temp: { min: Math.round(day.temp.min), max: Math.round(day.temp.max) },
            description: day.description.charAt(0).toUpperCase() + day.description.slice(1),
          })),
        };
        
        setLocalData(transformed);
        setError(null);
      } catch {
        setError("Failed to process weather data");
      }
    } else if (apiError) {
      setError(apiError);
    }
  }, [weather, apiError]);

  const formatTime = (dt: number): string => {
    const date = new Date(dt);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDate = (dt: number): string => {
    const date = new Date(dt);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()]!;
  };

  if (error || !localData) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold text-text">Cuaca, dalam genggaman</h1>
          <p className="mb-4 text-danger">{error || "Gagal memuat data cuaca."}</p>
          <button onClick={reload} className="rounded-lg bg-nav-active px-6 py-3 font-medium text-on-nav-active transition-colors hover:bg-brand-700">
            Coba Lagi
          </button>
        </div>
      </main>
    );
  }

  if (apiLoading) {
    return (
      <main className="min-h-screen bg-surface p-4 md:p-6">
        <header className="mb-6 space-y-4">
          <h1 className="text-2xl font-bold text-text">Cuaca, dalam genggaman</h1>
          <SearchBar onCitySelect={handleCitySelect} />
          <div className="h-8 w-64 animate-pulse rounded bg-surface-container" />
        </header>
        <section className="mb-6"><HeroSkeleton /></section>
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
            {[...Array(4)].map((_: unknown, index: number) => (
              <DailyForecastCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <header className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-text">Cuaca, dalam genggaman</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar onCitySelect={handleCitySelect} />
          <ThemeToggle />
        </div>
        
        <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
          <span>{city}</span>
          <span>Diperbarui: {new Date(localData.fetchedAt).toLocaleTimeString()}</span>
        </div>
      </header>

      <section className="mb-6">
        <CurrentWeatherHero 
          temperature={localData.current.temp}
          condition={localData.current.description}
          city={city}
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-text">Detail Cuaca</h2>
        <WeatherDetailsGrid
          humidity={localData.current.humidity}
          windSpeed={localData.current.wind_speed}
          pressure={localData.current.pressure}
          visibility={localData.current.visibility}
          uvIndex={localData.current.uvi}
        />
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-text">Jaman Berikutnya</h2>
        <HourlyForecastStrip 
          hourlyForecasts={localData.hourly.map(hour => ({
            time: formatTime(hour.dt),
            temperature: hour.temp,
            condition: hour.description,
          }))}
        />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-text">Prakiraan 4 Hari</h2>
        <div className="space-y-2">
          {localData.daily.map((day, index) => (
            <DailyForecastCard
              key={index}
              date={formatDate(day.dt)}
              minTemp={day.temp.min}
              maxTemp={day.temp.max}
              condition={day.description}
            />
          ))}
        </div>
      </section>
    </main>
  );
};
