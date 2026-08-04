"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Navigation } from "./navigation";

/**
 * Responsive app shell:
 * - Desktop (lg+):   sidebar kiri 240px + konten
 * - Tablet (md+):    navigation rail 72px (ikon saja)
 * - Mobile (<md):    bottom navigation + konten
 *
 * Semua variant merender <Navigation> yang sama; CSS breakpoint
 * Tailwind (md=768px, lg=1024px) yang menentukan tampilannya.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh">
      <a href="#konten" className="skip-link">
        Langsung ke konten
      </a>

      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--sidebar-width)] border-r border-line bg-surface-card lg:block">
        <div className="flex h-full flex-col gap-6 px-4 py-6">
          <p className="px-4 text-lg font-bold tracking-tight text-text">
            Awanara
          </p>
          <Navigation pathname={pathname} variant="sidebar" />
        </div>
      </aside>

      {/* Rail tablet */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[var(--rail-width)] border-r border-line bg-surface-card md:block lg:hidden">
        <div className="flex h-full flex-col items-center gap-6 py-6">
          <p aria-hidden="true" className="text-lg font-bold text-text">
            A
          </p>
          <Navigation pathname={pathname} variant="rail" />
        </div>
      </aside>

      {/* Konten utama */}
      <div
        id="konten"
        className="mx-auto max-w-[var(--content-max)] px-4 pb-24 pt-6 md:px-6 md:pb-12 lg:pl-[calc(var(--sidebar-width)+2rem)] lg:pr-8"
      >
        {children}
      </div>

      {/* Bottom navigation mobile */}
      <nav
        aria-label="Navigasi utama"
        className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface-card md:hidden"
      >
        <Navigation pathname={pathname} variant="bottom" />
      </nav>
    </div>
  );
}
