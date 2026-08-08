/**
 * ThemeToggle Component - Aktifkan fungsi toggle theme
 */
"use client";

import { useTheme } from "@/components/theme/theme-provider";

export const ThemeToggle = () => {
  const { toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title="Switch to next theme"
      className="rounded-lg bg-surface-card p-3 text-text shadow-card transition-all hover:bg-surface-container active:scale-95"
    >
      {/* Icon akan berubah sesuai tema via CSS/content switch */}
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    </button>
  );
};
