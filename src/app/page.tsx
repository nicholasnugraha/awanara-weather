export default function HomePage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand-700">
        Awanara
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-text md:text-5xl">
        Cuaca, dalam genggaman.
      </h1>
      <p className="max-w-md text-text-muted">
        Dashboard cuaca sedang dalam pengembangan — current weather, prakiraan
        per jam dan harian akan segera hadir di sini.
      </p>
    </main>
  );
}
