import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          100: "var(--color-brand-100)",
          300: "var(--color-brand-300)",
          500: "var(--color-brand-500)",
          600: "var(--color-brand-600)",
          700: "var(--color-brand-700)",
        },
        surface: "var(--color-surface)",
        "surface-card": "var(--color-surface-card)",
        "surface-container": "var(--color-surface-container)",
        text: "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        line: "var(--color-border)",
        "nav-active": "var(--color-nav-active)",
        "on-nav-active": "var(--color-on-nav-active)",
        sunny: "var(--color-sunny)",
        storm: "var(--color-storm)",
        precip: "var(--color-precip)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      maxWidth: {
        content: "var(--content-max)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
