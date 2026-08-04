"use client";

import { useEffect, useState } from "react";
import { CurrentWeatherHero } from "@/components/weather/current-weather-hero";
import { HourlyForecastStrip } from "@/components/weather/hourly-forecast-strip";
import { DailyForecastCard } from "@/components/weather/daily-forecast-card";
import { WeatherDetailsGrid } from "@/components/weather/weather-details-grid";
import { SearchBar } from "@/components/weather/search-bar";
import { ThemeToggle } from "@/components/weather/theme-toggle";
import type { Theme } from "@/components/theme/theme-provider";

interface BFFData {
  location: {
    lat: number;
    lon: number;
    timezone: string;
  };
  fetchedAt: number;
  current: {
    temp: number;
    description: string;
    humidity: number;
    wind_speed: number;
    pressure: number;
    visibility: number;
    uvi?: number;
  };
  hourly: Array<{
    dt: number;
    temp: number;
    description: string;
    icon?: string;
  }>;
  daily: Array<{
    dt: number;
    temp: {
      min: number;
      max: number;
    };
    description: string;
    icon?: string;
  }>;
}

export const DashboardContainer = ({ theme }: { theme: Theme }) => {
  const [data, setData] = useState<BFFData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState("Jakarta, ID");

  // Fetch weather data from BFF
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // Mock data for initial load (replace with actual BFF call later)
        const mockData: BFFData = {
          location: { lat: 0.7893, lon: 106.65, timezone: "Asia/Jakarta" },
          fetchedAt: Date.now(),
          current: {
            temp: 32,
            description: "Cerah Berawan",
            humidity: 75,
            wind_speed: 12,
            pressure: 1010,
            visibility: 10,
            uvi: 8.5,
          },
          hourly: [
            { dt: Date.now() + 3600, temp: 33, description: "Cerah", icon: "01d" },
            { dt: Date.now() + 7200, temp: 34, description: "Cerah", icon: "01d" },
            { dt: Date.now() + 10800, temp: 33, description: "Berawan", icon: "02d" },
            { dt: Date.now() + 14400, temp: 31, description: "Berawan", icon: "03d" },
            { dt: Date.now() + 18000, temp: 30, description: "Hujan Ringan", icon: "10d" },
          ],
          daily: [
            { dt: Date.now(), temp: { min: 24, max: 33 }, description: "Cerah Berawan", icon: "02d" },
            { dt: Date.now() + 86400, temp: { min: 23, max: 32 }, description: "Cerah", icon: "01d" },
            { dt: Date.now() + 172800, temp: { min: 24, max: 34 }, description: "Cerah", icon: "01d" },
            { dt: Date.now() + 259200, temp: { min: 25, max: 33 }, description: "Berawan", icon: "03d" },
          ],
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setData(mockData);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        setError("Gagal memuat data cuaca. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const handleCitySelect = (selectedCity: string) => {
    setCity(selectedCity);
    // In production: trigger refetch with new city coordinates
  };

  const formatTime = (dt: number): string => {
    const date = new Date(dt);
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const formatDate = (dt: number): string => {
    const date = new Date(dt);
    const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return days[date.getDay()];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto" />
          <p className="mt-4 text-text-muted">Memuat data cuaca...</p>
        </div>
      </div>
    );
  }

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

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar onCitySelect={handleCitySelect} />
          
          <ThemeToggle currentTheme={theme} onToggle={() => {}} />
        </div>
        
        {/* Current Location & Timestamp */}
        <div className="mt-4 flex items-center justify-between text-sm text-text-muted">
          <span>{city}</span>
          <span>Diperbarui: {new Date(data.fetchedAt).toLocaleTimeString()}</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mb-6">
        <CurrentWeatherHero 
          temperature={data.current.temp}
          condition={data.current.description}
          city={city}
        />
      </section>

      {/* Details Grid */}
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

      {/* Hourly Forecast */}
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

      {/* Daily Forecast */}
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
              icon={day.icon || "01d"}
            />
          ))}
        </div>
      </section>
    </main>
  );
};
