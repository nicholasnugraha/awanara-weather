import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          700: "var(--color-brand-700)",
          500: "var(--color-brand-500)",
        },
        surface: "var(--color-surface)",
        "surface-card": "var(--color-surface-card)",
        ink: "var(--color-text)",
        line: "var(--color-border)",
        sunny: "var(--color-sunny)",
        storm: "var(--color-storm)",
        precip: "var(--color-precip)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
      },
      maxWidth: {
        content: "var(--content-max)",
      },
    },
  },
  plugins: [],
};

export default config;
