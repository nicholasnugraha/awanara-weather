export function CurrentWeatherHero({ temperature, condition, city }: { temperature: number; condition: string; city: string }) {
  return (
    <div className="rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white shadow-lg">
      <h2 className="text-3xl font-bold">{city}</h2>
      <p className="mt-2 text-brand-100">{condition}</p>
      <p className="mt-4 text-6xl font-bold">{temperature}°</p>
    </div>
  );
}
