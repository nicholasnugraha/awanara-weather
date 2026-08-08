"use client";

import { useState, useEffect, useCallback } from "react";
import { SearchBar } from "@/components/weather/search-bar";
import { GeolocateButton } from "@/components/search/geolocate-button";
import { saveRecentLocation } from "@/services/recent-locations";
import { CurrentWeatherCard } from "@/components/weather/current-weather-card";
import { HourlyForecastStrip } from "@/components/weather/hourly-forecast-strip";
import { DailyForecastCard } from "@/components/forecast/daily-forecast-card";
import { RecentLocationsList } from "@/components/search/recent-locations-list";
import type { RecentLocation } from "@/services/recent-locations";

export function WeatherDashboard() {
  const [city, setCity] = useState<string>("Jakarta");
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [hourlyForecast, setHourlyForecast] = useState<any[]>([]);
  const [dailyForecast, setDailyForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch weather data
  useEffect(() => {
    if (!city) return;

    let cancelled = false;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch current weather
        const currentRes = await fetch(`/api/weather?city=${encodeURIComponent(city)}&country=ID`);
        if (currentRes.ok) {
          const currentData = await currentRes.json();
          if (!cancelled) {
            setCurrentWeather({
              temp: currentData.main?.temp ?? null,
              feels_like: currentData.main?.feels_like ?? null,
              humidity: currentData.humidity ?? null,
              pressure: currentData.main?.pressure ?? null,
              wind_speed: currentData.wind?.speed ?? null,
              description: currentData.weather?.[0]?.description ?? null,
              icon: currentData.weather?.[0]?.icon ?? null,
              city_name: currentData.name || city,
            });
          }
        }

        // Fetch hourly forecast
        const hourlyRes = await fetch(`/api/forecast?city=${encodeURIComponent(city)}&country=ID`);
        if (hourlyRes.ok) {
          const hourlyData = await hourlyRes.json();
          if (!cancelled) {
            setHourlyForecast((hourlyData.list ?? []).slice(0, 24).map((item: any) => ({
              time: item.dt * 1000,
              temp: item.main?.temp ?? null,
              weather: item.weather ?? [],
              pop: item.pop ?? 0,
            })));
          }
        }

        // Fetch daily forecast (uses same endpoint but transforms data)
        const dailyRes = await fetch(`/api/forecast/daily?city=${encodeURIComponent(city)}&country=ID`);
        if (dailyRes.ok) {
          const dailyData = await dailyRes.json();
          if (!cancelled) {
            // Transform to daily format (simplified)
            const dailyList = (hourlyData.list ?? []);
            const dailyMap = new Map();
            dailyList.forEach((item: any) => {
              const dateKey = new Date(item.dt * 1000).toISOString().split("T")[0];
              if (!dailyMap.has(dateKey)) {
                dailyMap.set(dateKey, {
                  date: new Date(item.dt * 1000),
                  tempMax: item.main?.temp_max ?? 30,
                  tempMin: item.main?.temp_min ?? 24,
                  humidity: item.main?.humidity ?? 75,
                  windSpeed: item.wind?.speed ?? 3,
                  description: item.weather?.[0]?.description ?? "",
                  iconCode: item.weather?.[0]?.icon ?? "01d",
                });
              } else {
                const existing = dailyMap.get(dateKey)!;
                existing.tempMax = Math.max(existing.tempMax, item.main?.temp_max ?? 30);
                existing.tempMin = Math.min(existing.tempMin, item.main?.temp_min ?? 24);
              }
            });
            setDailyForecast(Array.from(dailyMap.values()).sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 7));
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch weather data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [city]);

  const handleCitySelect = useCallback((selectedCity: string) => {
    setCity(selectedCity);
  }, []);

  const handleRecentLocationSelect = useCallback((location: RecentLocation) => {
    setCity(`${location.city}, ${location.country}`);
  }, []);

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Awanara</h1>
        <p className="mt-2 text-lg text-text-muted">Cuaca real-time untuk Indonesia</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex justify-center">
        <SearchBar onCitySelect={handleCitySelect} />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Current Weather */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <CurrentWeatherCard
              weather={currentWeather}
              loading={loading}
              error={error}
            />
          </div>

          <div className="mb-6">
            <HourlyForecastStrip
              forecast={hourlyForecast.length > 0 ? hourlyForecast : null}
              loading={loading}
              error={error}
            />
          </div>

          <DailyForecastCard
            forecast={dailyForecast.length > 0 ? dailyForecast : null}
            loading={loading}
            error={error}
          />
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Geolocation Button */}
          <div className="rounded-lg bg-surface-card p-4 shadow-card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
              Lokasi Anda
            </h3>
            <GeolocateButton
              onLocationFound={(lat, lon, cityStr) => {
                if (cityStr) {
                  setCity(cityStr);
                  saveRecentLocation({ city: cityStr.split(",")[0], country: cityStr.split(",")[1] || "ID", lat, lon });
                } else {
                  setCity(`Lokasi Anda (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
                }
              }}
            />
          </div>

          {/* Recent Locations */}
          <div className="rounded-lg bg-surface-card p-4 shadow-card">
            <RecentLocationsList
              onSelect={handleRecentLocationSelect}
              onClear={() => {}}
            />
          </div>

          {/* Quick Tips */}
          <div className="rounded-lg bg-brand-500 p-4 text-white shadow-lg">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wider">Tips</h3>
            <ul className="list-inside list-disc text-sm space-y-1 text-brand-100">
              <li>Data cuaca diperbarui setiap 10 menit</li>
              <li>Prediksi 24 jam tersedia untuk semua kota</li>
              <li>Gunakan search bar untuk mencari lokasi lain</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
