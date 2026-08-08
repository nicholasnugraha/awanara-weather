import type { DailyForecastData } from "@/hooks/use-daily-forecast";
import Image from "next/image";

interface DailyForecastCardProps {
  forecast: DailyForecastData[];
  loading: boolean;
  error: string | null;
}

export function DailyForecastCard({ forecast, loading, error }: DailyForecastCardProps) {
  if (loading || !forecast?.length) {
    return (
      <div className="rounded-lg bg-surface-card p-6 shadow-card">
        <h3 className="mb-4 text-lg font-bold">Prakiraan 7 Hari</h3>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-surface-container p-4">
              <div className="h-6 w-20 rounded" />
              <div className="h-12 w-12 rounded-full" />
              <div className="h-4 w-24 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-surface-card p-6 text-center shadow-card">
        <p className="text-danger">Gagal memuat prakiraan cuaca</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-surface-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-bold">Prakiraan 7 Hari</h3>

      <div className="space-y-3">
        {forecast.map((day, index) => (
          <div
            key={index}
            className="group relative flex items-center justify-between rounded-lg bg-surface-container px-4 py-3 transition-all hover:bg-surface-card/80"
          >
            {/* Day of week */}
            <div className="flex items-center gap-3 min-w-[120px]">
              <div className="text-sm font-medium text-text">
                {formatDayOfWeek(day.date)}
              </div>
              <div className="hidden sm:block text-xs text-text-muted">
                {day.date.getDate()} {getMonthName(day.date.getMonth())}
              </div>
            </div>

            {/* Weather icon & description */}
            <div className="flex flex-1 items-center gap-4">
              <div className="relative h-12 w-12 flex-shrink-0">
                <Image
                  src={`https://openweathermap.org/img/wn/${day.iconCode}@2x.png`}
                  alt={day.description}
                  fill
                  sizes="48px"
                  priority
                />
              </div>
              
              <div className="hidden md:block">
                <p className="font-medium text-text">{day.description || "Clear"}</p>
                <div className="mt-1 flex gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    💧 {day.humidity}%
                  </span>
                  <span className="flex items-center gap-1">
                    🌬️ {day.windSpeed} m/s
                  </span>
                </div>
              </div>
            </div>

            {/* Temperature range */}
            <div className="min-w-[100px] text-right">
              <p className="text-xl font-bold text-text">
                {Math.round(day.tempMax)}°
                <span className="text-sm font-normal text-text-muted ml-1">
                  {Math.round(day.tempMin)}°
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatDayOfWeek(date: Date): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[date.getDay()];
}

function getMonthName(monthIndex: number): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  return months[monthIndex];
}
