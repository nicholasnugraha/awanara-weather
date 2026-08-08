import { formatTemp, describeWeather, type CurrentWeather } from "@/lib/types";
import Image from "next/image";

interface CurrentWeatherCardProps {
  weather: CurrentWeather | null;
  loading: boolean;
  error: string | null;
}

export function CurrentWeatherCard({ weather, loading, error }: CurrentWeatherCardProps) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3 rounded-lg bg-surface-card p-6 shadow-card">
        <div className="h-8 w-3/4 rounded bg-surface-container" />
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-surface-container" />
          <div className="space-y-2">
            <div className="h-6 w-1/3 rounded bg-surface-container" />
            <div className="h-4 w-1/2 rounded bg-surface-container" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-surface-card p-6 text-center shadow-card">
        <p className="text-lg font-semibold text-danger">{error}</p>
        <p className="mt-2 text-sm text-text-muted">Silakan coba lagi nanti</p>
      </div>
    );
  }

  if (!weather || !weather.temp) {
    return (
      <div className="rounded-lg bg-surface-card p-6 text-center shadow-card">
        <p className="text-text-muted">Tidak ada data cuaca tersedia</p>
      </div>
    );
  }

  const iconUrl = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;

  return (
    <div className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-lg">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start md:justify-between">
        <div className="text-left">
          <h2 className="text-xl font-bold">{weather.city_name}</h2>
          <p className="mt-1 text-brand-100">{describeWeather(800, weather.description)}</p>

          <div className="mt-4 flex gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold">{formatTemp(weather.temp)}</p>
              <p className="mt-1 text-sm text-brand-100">Suhu</p>
            </div>

            <div className="hidden border-l border-brand-400 pl-6 md:block">
              <p className="text-lg">Rasa: {formatTemp(weather.feels_like)}</p>
              <p className="mt-1 text-xs text-brand-100">Terasa seperti</p>
            </div>
          </div>
        </div>

        <Image
          src={iconUrl}
          alt={weather.description ?? "Weather icon"}
          width={128}
          height={128}
          className="drop-shadow-2xl"
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-brand-900/30 p-4 text-center">
        <div>
          <p className="text-2xl font-bold">{weather.humidity}%</p>
          <p className="text-sm text-brand-100">Kelembaban</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{weather.pressure} hPa</p>
          <p className="text-sm text-brand-100">Tekanan</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{weather.wind_speed} m/s</p>
          <p className="text-sm text-brand-100">Angin</p>
        </div>
      </div>
    </div>
  );
}
