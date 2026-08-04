/**
 * Skeleton Loading Components
 * Provides visual feedback during data loading states
 */

// Hero section skeleton loader
export const HeroSkeleton = () => {
  return (
    <div className="animate-pulse rounded-lg bg-gradient-to-br from-surface-card to-surface-container p-6 shadow-float">
      <div className="h-6 w-3/4 rounded bg-surface-container" />
      <div className="mt-4 flex items-end gap-3">
        <div className="h-20 w-24 rounded bg-surface-container md:h-28 md:w-32" />
        <div className="h-6 w-1/3 rounded bg-surface-container" />
      </div>
    </div>
  );
};

// Metric card skeleton loader
export const MetricCardSkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-surface-card p-4 shadow-card animate-pulse">
      <div className="h-4 w-20 rounded bg-surface-container" />
      <div className="mt-2 h-8 w-16 rounded bg-surface-container" />
    </div>
  );
};

// Hourly forecast strip skeleton loader
export const HourlyForecastStripSkeleton = () => {
  return (
    <div className="flex gap-3 pb-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex w-24 flex-col items-center rounded-lg bg-surface-card p-3 shadow-card animate-pulse">
          <div className="h-4 w-12 rounded bg-surface-container" />
          <div className="my-2 h-8 w-10 rounded bg-surface-container" />
          <div className="h-3 w-16 rounded bg-surface-container" />
        </div>
      ))}
    </div>
  );
};

// Daily forecast card skeleton loader
export const DailyForecastCardSkeleton = () => {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-card p-4 shadow-card animate-pulse">
      <div className="w-16">
        <div className="h-5 w-full rounded bg-surface-container" />
      </div>
      <div className="mx-4 flex-1">
        <div className="h-8 rounded bg-surface-container" />
      </div>
      <div className="text-right">
        <div className="flex items-center gap-2">
          <div className="h-6 w-10 rounded bg-surface-container" />
          <div className="h-6 w-10 rounded bg-surface-container" />
        </div>
        <div className="mt-1 h-3 w-16 rounded bg-surface-container" />
      </div>
    </div>
  );
};
