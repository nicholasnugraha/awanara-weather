# Decisions and Open Questions

## Fixed decisions

- Product working name: Awanara.
- Suggested repository: `awanara-weather`.
- New public repository under personal GitHub account.
- `dev` for testing/staging, `main` for stable/production.
- Owner approval required before every merge.
- GitHub Issues and Project used for roadmap tracking.
- OpenWeatherMap One Call API 4.0.
- 1.000 request/day limit.
- One API key shared by dev and production.
- No weather-provider fallback for MVP.
- Web-native stack; WeatherWise is UI reference only.
- Indonesian MVP; Jakarta fallback; metric units.
- GPS only after user action.
- No analytics/account/payment in MVP.

## Best-practice defaults

- Next.js App Router, React, TypeScript strict.
- Tailwind + CSS variables; accessible Radix/shadcn-style primitives.
- TanStack Query, Zod, React Hook Form.
- MapLibre preferred after spike; Leaflet if simple raster is enough.
- Vitest, Testing Library, MSW, Playwright, Storybook, axe, Lighthouse CI.
- GitHub Actions + Vercel preview/staging/production.
- Structured redacted logs and `/api/health`; Sentry only if needed and safe.
- Latest two stable Chrome/Edge/Firefox/Safari; Android Chrome dan iOS Safari.

## Open discovery items

1. Availability/basic name conflict for Awanara.
2. Current official OpenWeatherMap One Call API 4.0 contract and terms.
3. Free radar provider allowed for personal web use.
4. MapLibre vs Leaflet.
5. Production tile provider and attribution.
6. Vercel plan/region/current terms.
7. Whether PWA ships at launch or after stable online release.

Agent must present discoveries to owner before locking these decisions.
