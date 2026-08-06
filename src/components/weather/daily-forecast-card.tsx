/**
 * DailyForecastCard Component
 * Single day forecast card with min/max temperatures
 */
import { FC } from "react";

interface DailyForecastCardProps {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
}

export const DailyForecastCard: FC<DailyForecastCardProps> = ({ 
  date, 
  minTemp, 
  maxTemp, 
  condition 
}) => {
  // Simple color coding based on temperature range
  const getTempColor = (temp: number) => {
    if (temp >= 30) return "text-danger";
    if (temp >= 25) return "text-warning";
    return "text-success";
  };

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-card p-4 shadow-card hover:bg-surface-container transition-colors">
      <div className="w-16">
        <span className="text-sm font-semibold text-text">{date}</span>
      </div>
      
      <div className="mx-4 flex-1">
        <div className="flex h-8 items-center rounded-full bg-surface-container px-2">
          {/* Temperature gradient visualization */}
          <div 
            className={`h-2 rounded-l-full ${getTempColor(minTemp)} bg-current`}
            style={{ width: `${Math.min(((minTemp - 15) / 25) * 100, 100)}%` }}
          />
          <div 
            className="h-2 rounded-r-full bg-brand-500"
            style={{ width: `${Math.min(((maxTemp - minTemp) / 15) * 100, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${getTempColor(maxTemp)}`}>{maxTemp}°</span>
          <span className="text-text-muted">/</span>
          <span className="font-semibold text-text-muted">{minTemp}°</span>
        </div>
        <span className="mt-1 block text-xs text-text-muted">{condition}</span>
      </div>
    </div>
  );
};
