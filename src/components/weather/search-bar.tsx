/**
 * SearchBar Component
 * Search input with autocomplete dropdown for city selection
 */
import { FC, useEffect, useState } from "react";

interface SearchResult {
  name: string;
  country: string;
  state?: string;
}

interface SearchBarProps {
  onCitySelect: (city: string) => void;
}

export const SearchBar: FC<SearchBarProps> = ({ onCitySelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Filter suggestions based on query (mock data for now)
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Mock suggestions - replace with actual geocoding API later
    const mockResults: SearchResult[] = [
      { name: "Jakarta", country: "ID" },
      { name: "Bandung", country: "ID" },
      { name: "Surabaya", country: "ID" },
      { name: "Medan", country: "ID" },
      { name: "Semarang", country: "ID" },
    ].filter(city => 
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase())
    );

    setSuggestions(mockResults.slice(0, 5));
  }, [query]);

  const handleSelect = (city: SearchResult) => {
    onCitySelect(`${city.name}, ${city.country}`);
    setQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Cari kota..."
          className="w-full rounded-lg border border-line bg-surface-card px-4 py-3 pr-10 text-text placeholder:text-text-muted shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <svg className="absolute right-3 top-3.5 h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg border border-line bg-surface-card shadow-lg">
          {suggestions.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result)}
              className="flex w-full items-center justify-between px-4 py-3 hover:bg-surface-container transition-colors"
            >
              <span className="font-medium text-text">{result.name}</span>
              <span className="text-xs font-semibold text-text-muted">{result.country}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
