import { useRecentLocations } from "@/hooks/use-recent-locations";
import { RecentLocationItem } from "./recent-location-item";
import type { RecentLocation as RecentLocationType } from "@/services/recent-locations";

interface RecentLocationsListProps {
  onSelect: (location: RecentLocationType) => void;
  onClear: () => void;
}

export function RecentLocationsList({ onSelect, onClear }: RecentLocationsListProps) {
  const { locations, loading, error, refresh } = useRecentLocations();

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded bg-surface-container" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-warning">
        Gagal memuat lokasi terakhir: {error}
      </p>
    );
  }

  if (!locations.length) {
    return (
      <div className="rounded-lg bg-surface-card p-4 text-center shadow-card">
        <p className="text-text-muted">Belum ada lokasi yang dicari</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between border-b border-line pb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
          Lokasi Terakhir
        </h3>
        <button
          onClick={onClear}
          className="text-xs text-danger hover:text-danger/80 transition-colors"
        >
          Clear All
        </button>
      </div>

      <ul className="space-y-1">
        {locations.map((location, index) => (
          <li key={location.id}>
            <RecentLocationItem
              location={location}
              onSelect={() => onSelect(location)}
              rank={index + 1}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
