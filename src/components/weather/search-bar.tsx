/**
 * SearchBar Component - Updated with real geocoding
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { debounce } from "@/utils/debounce";

interface SearchResult {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

interface SearchBarProps {
  onCitySelect: (city: string) => void;
}

export const SearchBar = ({ onCitySelect }: SearchBarProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchGeocoding = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      return;
    }

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
  }, []);

  // Debounced input handler (implement debouncing utility later)
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
    
    onCitySelect(cityStr);
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
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
          className="w-full rounded-lg border border-line bg-surface-card px-4 py-3 pr-10 text-text placeholder:text-text-muted shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
        />
        
        {loading && (
          <svg className="absolute right-3 top-3.5 h-5 w-5 animate-spin text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m0 0H15" />
          </svg>
        )}
        
        {!loading && (
          <svg className="absolute right-3 top-3.5 h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
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

      {showResults && results.length === 0 && !loading && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-line bg-surface-card p-4 text-center text-text-muted animate-fade-in">
          Kota tidak ditemukan
        </div>
      )}
    </div>
  );
};
