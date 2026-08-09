export type GeocodeResult = {
  lat: number;
  lon: number;
  city: string;
  country: string;
  displayName: string;
};

export type RecentLocation = {
  id: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  timestamp: number;
};

const RECENT_LOCATIONS_KEY = "awanara_recent_locations";
const MAX_RECENT_LOCATIONS = 5;

export const saveRecentLocation = (location: Omit<RecentLocation, "id" | "timestamp">): void => {
  try {
    const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
    let recentLocations: RecentLocation[] = stored ? JSON.parse(stored) : [];

    // Remove duplicate if exists
    recentLocations = recentLocations.filter(
      (loc) => !(loc.city === location.city && loc.country === location.country)
    );

    // Add new location at the top
    const newLocation: RecentLocation = {
      id: `${location.city}-${location.lat}-${location.lon}`,
      ...location,
      timestamp: Date.now(),
    };

    recentLocations.unshift(newLocation);

    // Keep only MAX_RECENT_LOCATIONS
    recentLocations = recentLocations.slice(0, MAX_RECENT_LOCATIONS);

    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(recentLocations));
  } catch (error) {
    console.warn("Failed to save recent location:", error);
  }
};

export const getRecentLocations = (): RecentLocation[] => {
  try {
    const stored = localStorage.getItem(RECENT_LOCATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn("Failed to get recent locations:", error);
    return [];
  }
};

export const clearRecentLocations = (): void => {
  try {
    localStorage.removeItem(RECENT_LOCATIONS_KEY);
  } catch (error) {
    console.warn("Failed to clear recent locations:", error);
  }
};
