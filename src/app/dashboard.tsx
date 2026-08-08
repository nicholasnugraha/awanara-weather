"use client";

import { useState, useCallback } from "react";
import { SearchBar } from "@/components/weather/search-bar";
import { ThemeToggle } from "@/components/weather/theme-toggle";
import { GeolocateButton } from "@/components/search/geolocate-button";
import { saveRecentLocation } from "@/services/recent-locations";
import { CurrentWeatherHero } from "@/components/weather/current-weather-hero";
import { HourlyForecastStrip } from "@/components/weather/hourly-forecast-strip";
import { DailyForecastCard } from "@/components/forecast/daily-forecast-card";
import { WeatherDetailsGrid } from "@/components/weather/weather-details-grid";
import type { Theme } from "@/components/theme/theme-provider";

export const DashboardContainer = ({ theme }: { theme: Theme }) => {
  const [city, setCity] = useState("Jakarta, ID");
  const [coords, setCoords] = useState({ lat: -6.2088, lon: 106.8456 });

  // Transform OpenWeatherMap data format to our UI format
  const describe = (node: any): string => {
    const raw = node?.weather?.[0]?.description;
    if (typeof raw !== "string" || raw.length === 0) return "Tidak diketahui";
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const handleCitySelect = async (selectedCity: string) => {
    setCity(selectedCity);
    
    // Geocode city to get coordinates
    const response = await fetch(`/api/geocode?q=${encodeURIComponent(selectedCity)}&limit=1`);
    if (!response.ok) return;
    
    const results = await response.json();
    if (results && results.length > 0) {
      setCoords({ lat: results[0].lat, lon: results[0].lon });
      
      // Save to recent locations
      const locationStr = `${results[0].city}, ${results[0].country}`;
      saveRecentLocation({ 
        city: results[0].city, 
        country: results[0].country, 
        lat: results[0].lat, 
        lon: results[0].lon 
      });
    } else {
      alert("Kota tidak ditemukan");
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

  return (
    <main className="min-h-screen bg-surface p-4 md:p-6">
      <header className="mb-6">
        <h1 className="mb-4 text-2xl font-bold text-text">Cuaca, dalam genggaman</h1>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar onCitySelect={handleCitySelect} />
          
          <div className="flex items-center gap-3">
            <ThemeToggle currentTheme={theme ?? "light" as any} onToggle={() => {}} />
            <GeolocateButton
              onLocationFound={(lat, lon, cityStr) => {
                if (cityStr) {
                  setCity(cityStr);
                  setCoords({ lat, lon });
                  const parts = cityStr.split(", ");
                  const cityName = parts[0] || "Lokasi Anda";
                  const country = parts[1] || "ID";
                  saveRecentLocation({ city: cityName, country, lat, lon });
                } else {
                  setCity(`Lokasi Anda (${lat.toFixed(2)}, ${lon.toFixed(2)})`);
                }
              }}
            />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-text-muted">
          Lokasi: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
        </div>
      </header>

      {/* Main weather display will be populated here */}
      <p className="text-center text-lg text-text-muted">
        Dashboard WeatherWise Indonesia - Siap untuk integrasi data real-time
      </p>
    </main>
  );
};
