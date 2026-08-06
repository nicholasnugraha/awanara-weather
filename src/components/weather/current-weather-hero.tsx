/**
 * CurrentWeatherHero Component
 * Large display of current temperature and main conditions
 */
import { FC } from "react";

interface CurrentWeatherHeroProps {
  temperature: number;
  condition: string;
  city: string;
}

export const CurrentWeatherHero: FC<CurrentWeatherHeroProps> = ({ 
  temperature, 
  condition, 
  city 
}) => {
  return (
    <div className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-float">
      <h2 className="text-lg font-medium opacity-90">{city}</h2>
      <div className="mt-4 flex items-end gap-3">
        <span className="text-6xl font-bold md:text-7xl">{temperature}°</span>
        <span className="mb-2 text-lg opacity-90">{condition}</span>
      </div>
    </div>
  );
};
