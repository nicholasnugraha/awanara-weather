/**
 * HourlyForecastStrip Component
 * Horizontal scrollable strip showing next hours forecast
 */
import { FC } from "react";

interface HourlyForecastItemProps {
  time: string;
  temperature: number;
  condition: string;
}

interface HourlyForecastStripProps {
  hourlyForecasts: HourlyForecastItemProps[];
}

export const HourlyForecastStrip: FC<HourlyForecastStripProps> = ({ 
  hourlyForecasts 
}) => {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {hourlyForecasts.map((hourly, index) => (
          <div key={index} className="flex w-24 flex-col items-center rounded-lg bg-surface-card p-3 shadow-card">
            <span className="text-xs font-medium text-text-muted">{hourly.time}</span>
            <span className="my-2 text-xl font-semibold text-text">{hourly.temperature}°</span>
            <span className="text-xs text-text-muted">{hourly.condition}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
