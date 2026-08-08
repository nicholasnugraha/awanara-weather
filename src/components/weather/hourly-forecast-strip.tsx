import { formatTemp, describeWeather, type HourlyForecast } from "@/lib/types";

interface HourlyForecastStripProps {
  forecast: HourlyForecast | null;
  loading: boolean;
  error: string | null;
}

export function HourlyForecastStrip({ forecast, loading, error }: HourlyForecastStripProps) {
  if (loading || !forecast?.length) {
    return (
      <div className="rounded-lg bg-surface-card p-6 shadow-card">
        <h3 className="mb-4 text-lg font-bold">24 Jam Kedepan</h3>
        
        {/* Loading Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="min-w-[80px] rounded-lg bg-surface-container p-3 text-center">
              <div className="mx-auto mb-2 h-4 w-12 rounded" />
              <div className="mx-auto mb-2 h-12 w-12 rounded-full" />
              <div className="mx-auto h-6 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-surface-card p-6 text-center shadow-card">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  const hoursToShow = forecast.slice(0, 24);

  return (
    <div className="rounded-lg bg-surface-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-bold">24 Jam Kedepan</h3>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {hoursToShow.map((hour, index) => {
          const time = new Date(hour.time);
          const iconUrl = `https://openweathermap.org/img/wn/${hour.weather[0]?.icon || "50d"}@2x.png`;

          return (
            <div
              key={index}
              className="min-w-[80px] flex-shrink-0 rounded-lg bg-surface-container p-3 text-center transition-transform hover:scale-105"
            >
              <p className="text-sm font-medium text-text-muted">
                {time.getHours()}:00
              </p>

              <img
                src={iconUrl}
                alt={describeWeather(hour.weather[0]?.id ?? 800, hour.weather[0]?.description ?? "weather")}
                width={48}
                height={48}
                className="mx-auto my-3"
              />

              <p className="text-xl font-bold text-text">
                {formatTemp(hour.temp)}
              </p>

              {hour.pop !== undefined && (
                <p className="mt-1 text-xs text-warning">
                  {Math.round(hour.pop * 100)}% hujan
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
