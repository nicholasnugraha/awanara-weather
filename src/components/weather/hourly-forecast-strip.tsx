import Image from "next/image";

export function HourlyForecastStrip({ hourlyForecasts }: { hourlyForecasts: Array<{ time: string; temperature: number; condition: string }> }) {
  return (
    <div className="rounded-lg bg-surface-card p-6 shadow-card">
      <h3 className="mb-4 text-lg font-bold">24 Jam Kedepan</h3>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {hourlyForecasts.map((hour, index) => (
          <div key={index} className="min-w-[80px] rounded-lg bg-surface-container p-3 text-center">
            <p className="text-sm font-medium text-text-muted">{hour.time}</p>
            <img 
              src="https://openweathermap.org/img/wn/01d@2x.png" 
              alt={hour.condition}
              width={48}
              height={48}
              className="mx-auto my-3"
            />
            <p className="text-xl font-bold text-text">{hour.temperature}°</p>
          </div>
        ))}
      </div>
    </div>
  );
}
