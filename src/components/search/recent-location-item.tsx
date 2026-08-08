import { RecentLocation } from "@/services/recent-locations";

interface RecentLocationItemProps {
  location: RecentLocation;
  onSelect: () => void;
  rank: number;
}

export function RecentLocationItem({ location, onSelect, rank }: RecentLocationItemProps) {
  const iconUrl = `https://cdn-icons-png.flaticon.com/32/684/684704.png`; // Generic city icon

  return (
    <li className="group relative">
      <button
        onClick={onSelect}
        className="flex w-full items-center gap-3 rounded-lg bg-surface-card p-3 text-left transition-all hover:bg-surface-container hover:shadow-sm"
      >
        {/* Rank Badge */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/10 text-sm font-bold text-brand-600">
          {rank}
        </div>

        {/* Location Info */}
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-text">{location.city}</p>
          <p className="text-xs text-text-muted">{location.country}</p>
        </div>

        {/* Delete Icon (visible on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="h-5 w-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
      </button>
    </li>
  );
}
