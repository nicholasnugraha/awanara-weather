"use client";

import { useState, useCallback, useEffect } from "react";
import { getRecentLocations, RecentLocation } from "@/services/recent-locations";

export function useRecentLocations() {
  const [locations, setLocations] = useState<RecentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocations = useCallback(() => {
    try {
      const results = getRecentLocations();
      setLocations(results);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recent locations");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const clearAll = useCallback(() => {
    // This will be implemented in the component
  }, []);

  return {
    locations,
    loading,
    error,
    refresh: loadLocations,
  };
}
