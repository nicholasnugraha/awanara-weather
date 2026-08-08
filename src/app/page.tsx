import Link from "next/link";

/**
 * Home Page - Placeholder for Phase 3 dashboard implementation.
 * Dashboard will be implemented after PR #18 is merged.
 */
export default function HomePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">
        WeatherWise Indonesia
      </p>
      
      <h1 className="text-2xl font-bold text-text">
        Cuaca, dalam genggaman
      </h1>
      
      <p className="max-w-md text-base text-text-muted">
        Aplikasi cuaca sederhana untuk Indonesia.
        Dalam pengembangan...
      </p>
      
      <Link
        href="/forecast"
        className="rounded-lg bg-brand-500 px-6 py-3 font-semibold text-white shadow-card transition-colors hover:bg-brand-600"
      >
        Lihat prakiraan
      </Link>
    </main>
  );
}
