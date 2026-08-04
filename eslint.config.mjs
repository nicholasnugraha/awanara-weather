import nextPlugin from "@next/eslint-plugin-next";
import eslintConfigNext from "eslint-config-next";

const config = [
  ...[eslintConfigNext, nextPlugin].map((c) => c.default || c),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "playwright-report/**",
      "test-results/**",
      "coverage/**",
      "storybook-static/**",
    ],
    rules: {
      // Disable no-explicit-any for adapter layer (axios error properties not typed)
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default config;
