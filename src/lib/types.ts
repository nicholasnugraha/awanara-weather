export type CurrentWeather = {
  temp: number | null;
  feels_like: number | null;
  humidity: number | null;
  pressure: number | null;
  wind_speed: number | null;
  description: string | null;
  icon: string | null;
  city_name: string;
};

export type HourlyForecast = {
  time: number;
  temp: number | null;
  weather: Array<{ id: number; main: string; description: string; icon: string }>;
  pop?: number;
}[];

export function formatTemp(celsius: number | null): string {
  if (celsius === null) return "—°";
  return `${Math.round(celsius)}°`;
}

export function describeWeather(code: number, description: string | null): string {
  if (description) return description.charAt(0).toUpperCase() + description.slice(1);

  // Default descriptions based on OWM weather codes
  const codeMap: Record<number, string> = {
    200: "Thunderstorm",
    300: "Light drizzle",
    500: "Rain",
    600: "Snow",
    700: "Atmospheric conditions",
    800: "Clear sky",
    801: "Few clouds",
    802: "Scattered clouds",
    803: "Broken clouds",
    804: "Overcast clouds",
  };

  return codeMap[code] ?? "Unknown";
}
