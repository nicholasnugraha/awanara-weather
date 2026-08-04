/**
 * WeatherMetricCard Component
 * Displays a single weather metric with label and value
 */
import { FC } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
}

export const MetricCard: FC<MetricCardProps> = ({ label, value, unit }) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-surface-card p-4 shadow-card">
      <span className="text-sm font-medium text-text-muted">{label}</span>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-xl font-semibold text-text">{value}</span>
        {unit && <span className="text-xs text-text-muted">{unit}</span>}
      </div>
    </div>
  );
};
