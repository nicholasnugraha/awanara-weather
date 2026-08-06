/**
 * WeatherDetailsGrid Component
 * Displays detailed weather metrics in a grid layout
 */
import { FC } from "react";
import { MetricCard } from "./metric-card";

interface WeatherDetailsGridProps {
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  uvIndex?: number;
}

export const WeatherDetailsGrid: FC<WeatherDetailsGridProps> = ({
  humidity,
  windSpeed,
  pressure,
  visibility,
  uvIndex
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <MetricCard label="Kelembaban" value={humidity} unit="%" />
      <MetricCard label="Angin" value={windSpeed} unit="km/h" />
      <MetricCard label="Tekanan" value={pressure} unit="hPa" />
      <MetricCard label="Jarak Pandang" value={visibility} unit="km" />
      {uvIndex !== undefined && (
        <MetricCard 
          label="Indeks UV" 
          value={uvIndex.toFixed(1)} 
          unit=""
        />
      )}
    </div>
  );
};
