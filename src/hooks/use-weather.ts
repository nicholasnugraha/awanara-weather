/**
 * SWR-based data fetching with caching, revalidation & background refresh
 */
import useSWR from "swr";
import type { BFFWeatherResponse } from "@/services/weather-service";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Network response was not ok");
  return response.json();
};

export const useWeatherData = (lat?: number, lon?: number) => {
  const shouldFetch = lat !== undefined && lon !== undefined;
  
  const swrKey = shouldFetch ? `/api/weather?lat=${lat}&lon=${lon}` : null;
  
  const { data, error, isLoading, mutate } = useSWR<BFFWeatherResponse>(
    swrKey,
    fetcher,
    {
      // Revalidate on focus
      revalidateOnFocus: true,
      // Revalidate when network reconnects
      revalidateOnReconnect: true,
      // Don't auto-revalidate to save quota
      revalidateIfStale: false,
    }
  );

  return {
    weather: data,
    loading: isLoading,
    error: error?.message || null,
    reload: () => mutate(),
  };
};
