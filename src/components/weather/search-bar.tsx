/**
 * SearchBar Component - Updated dengan real geocoding + GPS button integration
 */
"use client";

import { useState, useEffect } from "react";

interface SearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface SearchBarProps {
  onCitySelect: (city: string, lat?: number, lon?: number) => void;
}

export const SearchBar = ({ onCitySelect }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Debounced fetch via useEffect timeout (simpler than importing debounce module)

  const fetchGeocoding = async (q: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}&limit=5`);
      
      if (!res.ok) throw new Error("Geocoding failed");
      
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
      } else {
        setResults([]);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchGeocoding(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, fetchGeocoding]);

  const handleSelect = (result: SearchResult) => {
    const cityStr = result.state 
      ? `${result.name}, ${result.state}, ${result.country}`
      : `${result.name}, ${result.country}`;
    
    onCitySelect(cityStr, result.lat, result.lon);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  const handleGeoClick = () => {
    if (!navigator.geolocation) {
      alert("Browser tidak mendukung Geolocation");
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Simple reverse geocoding via OpenStreetMap
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address.city || data.address.town || "Lokasi Anda";
          
          onCitySelect(`${city}, ID`, latitude, longitude);
        } catch {
          onCitySelect("Lokasi Anda", latitude, longitude);
        }
      },
      () => alert("Gagal mendapatkan lokasi")
    );
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="mb-2 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowResults(e.target.value.length >= 2);
          }}
          onFocus={() => setShowResults(true)}
          placeholder="Cari kota..."
          disabled={loading}
          className="flex-1 rounded-lg border border-line bg-surface-card px-4 py-3 pr-10 text-text placeholder:text-text-muted shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
        />
        
        {!loading && (
          <button
            onClick={handleGeoClick}
            title="Gunakan lokasi saya"
            className="rounded-lg bg-surface-card p-3 text-text shadow-card hover:bg-surface-container transition-colors"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-line bg-surface-card shadow-lg animate-fade-in">
          {results.map((result, index) => (
            <button
              key={`${result.lat}-${result.lon}-${index}`}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors text-left"
            >
              <div>
                <span className="font-medium text-text">{result.name}</span>
                {result.state && (
                  <span className="ml-2 text-xs text-text-muted">({result.state})</span>
                )}
              </div>
              <span className="text-xs font-semibold text-text-muted">{result.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
