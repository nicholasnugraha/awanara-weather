import type { WeatherData } from "@/types/weather-data";

export function WeatherDetailsGrid({ 
  humidity, 
  windSpeed, 
  pressure, 
  visibility,
  uvIndex 
}: Pick<WeatherData["current"], "humidity" | "wind_speed" | "pressure" | "visibility" | "uvi">) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
      <div className="rounded-lg bg-surface-card p-4 text-center shadow-sm">
        <p className="text-2xl font-bold text-text">{humidity}%</p>
        <p className="text-xs text-text-muted">Kelembaban</p>
      </div>
      
      <div className="rounded-lg bg-surface-card p-4 text-center shadow-sm">
        <p className="text-2xl font-bold text-text">{windSpeed} m/s</p>
        <p className="text-xs text-text-muted">Angin</p>
      </div>
      
      <div className="rounded-lg bg-surface-card p-4 text-center shadow-sm">
        <p className="text-2xl font-bold text-text">{pressure} hPa</p>
        <p className="text-xs text-text-muted">Tekanan</p>
      </div>
      
      <div className="hidden rounded-lg bg-surface-card p-4 text-center shadow-sm md:block">
        <p className="text-2xl font-bold text-text">{visibility} km</p>
        <p className="text-xs text-text-muted">Jarak Pandang</p>
      </div>
      
      <div className="hidden rounded-lg bg-surface-card p-4 text-center shadow-sm md:block">
        <p className="text-2xl font-bold text-text">{uvIndex}</p>
        <p className="text-xs text-text-muted">UV Index</p>
      </div>
    </div>
  );
}
