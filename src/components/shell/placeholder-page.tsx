import Link from "next/link";

/**
 * Halaman placeholder sementara — akan digantikan implementasi per fase.
 * Dipakai oleh route /forecast, /radar, /settings (3x penggunaan).
 */
export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight text-text md:text-4xl">
        {title}
      </h1>
      <p className="max-w-md text-text-muted">{description}</p>
      <Link
        href="/"
        className="mt-2 rounded-md bg-brand-500 px-5 py-3 font-medium text-white transition-colors hover:bg-brand-600"
      >
        Kembali ke Dashboard
      </Link>
    </main>
  );
}
