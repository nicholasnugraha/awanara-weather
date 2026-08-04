# Awanara Weather Web App Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

> [!IMPORTANT]
> **Binding owner decisions supersede any conflicting exploratory text later in this document:** project name is Awanara (`awanara-weather`); create a new public repository under the owner's personal GitHub account; `dev` is staging/testing and `main` is stable/production; direct pushes are prohibited and every merge requires explicit owner approval; OpenWeatherMap One Call API 4.0 is the canonical provider with a 1,000 requests/day operational limit and one server-only key for dev/production; Indonesian, Jakarta fallback, metric units, explicit GPS action, and no weather-provider fallback are MVP defaults. Radar is deferred until a free-for-personal-use source and its terms are verified. See `03-PROJECT-GOVERNANCE.md`, `04-ENVIRONMENT-SETUP.md`, and `05-DECISIONS-AND-OPEN-QUESTIONS.md` for binding details.

**Goal:** Build a fast, accessible, responsive, and secure web-first weather application inspired by WeatherWise’s information hierarchy and visual language, using a native web stack rather than Flutter.

**Architecture:** Use a TypeScript web application with a Backend-for-Frontend (BFF) boundary. Browser code calls only same-origin application endpoints; server routes protect provider keys, normalize external weather/radar responses into internal contracts, apply caching and rate limits, and prevent vendor-specific models from leaking into UI components. Presentation follows feature-oriented modules with server state separated from local UI state.

**Tech Stack:** Next.js App Router + TypeScript, React, Tailwind CSS, Radix/shadcn-style accessible primitives, TanStack Query, Zod, MapLibre GL JS, Vitest + Testing Library + MSW, Playwright, Storybook, pnpm, GitHub Actions, Vercel, OpenTelemetry/Sentry-compatible monitoring.

---

## 1. Executive Summary

WeatherWise’s PRD has strong product intent, explicit KISS rules, responsive layout notes, design tokens, and clear acknowledgement of Flutter Web trade-offs. Its main weakness is that it mixes product requirements, implementation notes, historical decisions, deployment troubleshooting, and future ideas in one evolving document. Several requirements also contradict the current implementation or each other.

The proposed replacement should be **web-first**, not a mobile codebase compiled to web. It should preserve WeatherWise’s strongest UI ideas:

- persistent desktop navigation;
- prominent current-weather hero;
- hourly strip and metric cards;
- seven-day forecast sidebar on wide screens;
- dedicated radar workspace;
- cool off-white/blue visual language, large temperature typography, 24px cards, and compact weather accents;
- adaptive desktop/tablet/mobile composition.

It should improve the product through:

- a server-side BFF from day one;
- explicit data freshness/provenance;
- accessibility and keyboard support as acceptance criteria;
- deterministic fallback behavior across providers;
- URL semantics and shareability defined before implementation;
- measurable performance budgets;
- observability, rate limiting, and graceful degradation;
- an AI-agent execution contract that prevents scope creep and fabricated validation.

---

## 2. Audit of the Existing WeatherWise PRD

### 2.1 Strengths worth retaining

1. **A clear personal-use target.** The PRD avoids accounts, payments, analytics, and other unnecessary commercial features.
2. **Explicit performance trade-offs.** It acknowledges that Flutter Web has a slower first load but prioritizes reuse.
3. **Responsive layout is described concretely.** Desktop, tablet, and mobile compositions are specified.
4. **Design tokens exist.** Colors, typography, radius, spacing, touch targets, and component notes are documented.
5. **KISS rules are unusually useful.** The rules against speculative abstractions and unused dependencies are appropriate for AI-driven implementation.
6. **Risk register exists.** CORS, geolocation, cache migration, tile loading, API-key leakage, and service workers are recognized.
7. **Weather-specific data sources are identified.** OpenWeatherMap, RainViewer, OpenStreetMap, Open-Meteo, and BMKG concepts provide a useful domain baseline.

### 2.2 Gaps and contradictions

| Area | Gap / contradiction | Improvement |
|---|---|---|
| Product positioning | It says one codebase/single source of truth, while deployment notes preserve separate `flutter` and `web-app` branches. | Make the new product explicitly web-first. If a mobile app appears later, share API schemas/design tokens—not necessarily UI code. |
| Requirements vs implementation | Planned routes include `/city/:cityName` and map query coordinates, but actual router centers on dashboard/forecast/radar/settings. | Freeze a route contract before coding and test every route through direct navigation, refresh, and browser back/forward. |
| Language | Earlier PRD says Indonesian only; current app supports Indonesian and English. | Decide MVP locale explicitly. Proposed: Indonesian default, English supported in Phase 3 only if all strings and weather terms are translated. |
| API security | API key proxy is postponed despite being marked mandatory before public deployment. | BFF/proxy is Phase 0—not Phase 2. No provider key may enter client JS, HTML, source maps, or public assets. |
| Caching | “15-minute cache” is stated, but stale behavior, revalidation, per-endpoint TTL, cache invalidation, and offline semantics are incomplete. | Define freshness per resource and distinguish fresh, stale, offline, and unavailable UI states. |
| Offline/PWA | “Offline-first” is promised without defining which routes/data work offline or how stale data is labeled. | MVP supports last successful snapshot only; radar and search remain network-dependent. Label timestamp and stale status visibly. |
| Provider strategy | Multiple weather/radar providers appear without an ownership/fallback policy or reconciliation rules. | Define a provider matrix, canonical units, field provenance, and no silent mixing of semantically different values. |
| Weather semantics | Timezones, daylight boundaries, precipitation period, wind units, UV source, and “today” calculations are underspecified. | Normalize all timestamps to UTC internally, retain IANA timezone, render location-local time, and document every metric’s period/unit. |
| Error UX | Risks mention API/CORS failures but do not define user-visible states or retry policy. | Define typed errors: invalid query, permission denied, unavailable location, quota exceeded, provider outage, offline, partial radar failure. |
| Accessibility | Touch target is noted, but keyboard operation, focus, screen readers, reduced motion, color blindness, and map alternatives are absent. | Target WCAG 2.2 AA; include semantic data tables/lists for charts and radar controls. |
| Performance | Targets exist but no test environment, route-level budgets, map budget, image/font policy, or CI enforcement. | Add Lighthouse CI and bundle budgets; measure cold dashboard and radar separately on mobile throttling. |
| Privacy | No account/analytics helps, but geolocation handling and retention are not specified. | Process coordinates transiently, round cache keys, never log precise location, expose “Use default city” and clear-data controls. |
| Testing | Rules are philosophical but lack a test pyramid and critical cases. | Specify unit, contract, integration, visual, accessibility, and E2E suites with required scenarios. |
| Observability | There is no health, provider latency, cache hit rate, or error monitoring plan. | Add structured server logs, correlation IDs, provider timing, safe error reporting, and synthetic smoke checks. |
| Deployment | Local manual deploy is called “100% reliable,” which is not reproducible or auditable. | Use GitHub Actions with pinned runtime, preview deployments, immutable artifacts, and rollback. |
| PRD governance | Status/checklists are stale relative to actual implementation. | Split PRD, architecture decisions (ADRs), roadmap, and runbooks; require updates in the same PR as behavior changes. |
| UI reference | Screens are treated as final without explicit states for loading, errors, empty results, stale data, long city names, or extreme values. | Build a state matrix and Storybook stories before page assembly. |

### 2.3 Important domain risks missing from the PRD

- DST and timezone transitions can shift hourly cards and “today” boundaries.
- Provider weather icons/descriptions are not a stable design system.
- City-name ambiguity requires country/region and coordinates in search results.
- Geolocation may require HTTPS and can be denied permanently.
- Radar tiles/GIFs may have attribution, CORS, availability, or licensing constraints.
- Weather providers may report precipitation probability and precipitation amount for different periods; these must not be merged without labels.
- Wind speed can be m/s, km/h, knots, or mph; unit conversion must be centralized and tested.
- Search/autocomplete can create quota spikes and needs debounce, cancellation, minimum length, and rate limiting.
- Service workers can preserve broken/stale deployments unless update behavior is tested.
- A weather app can appear authoritative; timestamps, source labels, and “not emergency guidance” language should be available where appropriate.

---

## 3. Proposed Product Scope

### 3.1 Product statement

A responsive weather web application for quickly checking current conditions, hourly/daily forecasts, and precipitation radar for a selected city or current location. It is optimized for modern browsers, can be installed as a PWA, and remains useful with the last successful weather snapshot when temporarily offline.

### 3.2 MVP users and jobs

- Check current weather at the current location.
- Search an unambiguous city and save the selection locally.
- Inspect the next 24 hours and next 7–8 days.
- Understand key metrics with units and short explanations.
- Inspect radar/precipitation movement with time controls.
- Share a URL that restores the selected place and screen without exposing precise private coordinates by default.

### 3.3 Explicit non-goals for MVP

- Accounts or cloud synchronization.
- Push notifications or severe-weather alerting.
- Historical climate analytics.
- Social sharing workflows.
- AI-generated forecasts or recommendations.
- Native mobile applications.
- Multiple weather-provider blending in the same metric.
- Arbitrary custom themes.

### 3.4 MVP acceptance criteria

1. Dashboard, forecast, radar, settings, and location-based flows work at 360px, 768px, 1024px, and 1440px widths.
2. Direct navigation and refresh work for every public route.
3. Browser bundle contains no upstream secret.
4. Every weather view displays location, unit, data timestamp, timezone-aware local time, and source attribution.
5. GPS denied/unavailable, city not found, offline, quota exceeded, and upstream failure have distinct UI states.
6. Keyboard users can reach and operate navigation, search, forecast controls, dialogs, and radar timeline.
7. Automated axe checks have no serious/critical violations on primary routes.
8. A cached dashboard snapshot renders offline and is visibly labeled stale with its timestamp.
9. API contracts are validated at runtime; malformed upstream responses do not crash the page.
10. Core Web Vitals and route budgets meet Section 10.

---

## 4. Recommended Tech Stack

### 4.1 Frontend

- **Next.js App Router + React + TypeScript (strict):** routing, metadata, server/client boundaries, and BFF route handlers in one deployable project.
- **Tailwind CSS:** encode WeatherWise-inspired tokens using CSS variables; avoid one-off magic colors.
- **Radix UI primitives or shadcn-style local components:** accessible dialogs, popovers, tooltips, tabs, and command/search UI without surrendering ownership of component code.
- **TanStack Query:** client-side server-state caching, cancellation, retries, deduplication, and explicit stale times.
- **React Hook Form + Zod:** settings/search forms and shared runtime validation.
- **MapLibre GL JS:** performant interactive map and raster/weather overlays. Use Leaflet only if provider overlays are simple raster layers and WebGL is unnecessary; decide via a Phase 0 spike.
- **date-fns + date-fns-tz or Temporal-compatible utility:** location-local rendering with explicit IANA timezone.
- **Lucide or Material Symbols:** one icon family only.
- **Self-hosted Inter variable font:** avoid external font runtime dependency and layout shift.

### 4.2 Server/BFF

- **Next.js Route Handlers** for `/api/weather`, `/api/geocode`, `/api/radar`, and `/api/health`.
- **Zod schemas** for upstream parsing and internal response contracts.
- **Provider adapters** behind narrow interfaces; initial provider chosen only after pricing/license/quota validation.
- **Server cache:** platform cache for public weather responses keyed by rounded coordinates + units + locale; optional Upstash Redis only when multi-region rate limiting or cache analytics becomes necessary.
- **Rate limiting:** per-IP coarse limits for geocoding and weather endpoints; never persist precise coordinates in logs.
- **Security headers and CSP:** configured from the start and compatible with map workers/assets.

### 4.3 Quality and delivery

- **pnpm** with committed lockfile and pinned Node version.
- **ESLint + Prettier + TypeScript strict mode.**
- **Vitest + Testing Library + MSW** for units, hooks, adapters, and page integration.
- **Playwright** for route, responsive, keyboard, offline, and browser E2E.
- **Storybook** for isolated UI states and visual reference comparison.
- **axe-core/playwright** for accessibility gates.
- **Lighthouse CI** for performance budgets.
- **GitHub Actions + Vercel preview/production deployments.**
- **Sentry-compatible error tracking and OpenTelemetry-compatible server traces**, with location redaction.

### 4.4 Why this stack differs appropriately from WeatherWise

- It produces semantic HTML instead of a canvas-heavy Flutter rendering surface.
- It improves first-load performance, accessibility, SEO/share previews, and browser-native routing.
- It gives a secure server boundary in the same repository.
- It keeps domain contracts independent from upstream providers.
- It is still small enough for one AI agent or a small team; no separate backend service is required initially.

### 4.5 Dependencies to avoid initially

- Redux/Zustand for server state; TanStack Query already owns that concern.
- A separate NestJS backend.
- GraphQL.
- A database or authentication system.
- Microservices.
- A charting package for simple hourly strips.
- Multiple component libraries.
- Provider SDKs when ordinary HTTP adapters suffice.

---

## 5. Target Architecture and File Layout

```text
src/
├── app/
│   ├── (weather)/
│   │   ├── page.tsx                 # dashboard
│   │   ├── forecast/page.tsx
│   │   ├── radar/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── weather/route.ts
│   │   ├── geocode/route.ts
│   │   ├── radar/route.ts
│   │   └── health/route.ts
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── error.tsx
│   └── not-found.tsx
├── components/
│   ├── ui/                           # accessible primitives
│   ├── weather/                      # reusable domain UI
│   └── shell/                        # nav and responsive shell
├── features/
│   ├── location/
│   ├── search/
│   ├── current-weather/
│   ├── forecast/
│   ├── radar/
│   └── settings/
├── server/
│   ├── providers/
│   │   ├── weather-provider.ts       # interface
│   │   ├── openweather-adapter.ts    # or selected provider
│   │   └── radar-adapter.ts
│   ├── schemas/
│   ├── cache/
│   ├── rate-limit/
│   └── observability/
├── lib/
│   ├── weather/units.ts
│   ├── weather/time.ts
│   ├── weather/icons.ts
│   ├── env.ts
│   └── result.ts
├── styles/
│   └── tokens.css
└── test/
    ├── fixtures/
    ├── factories/
    └── msw/

e2e/
stories/
docs/
├── PRD.md
├── DESIGN-SYSTEM.md
├── API-CONTRACTS.md
├── TEST-PLAN.md
├── RUNBOOK.md
└── adr/
```

### Architectural rules

1. UI imports internal domain DTOs, never raw provider response types.
2. Secrets and provider calls remain server-only.
3. Date/time and unit conversion happen in centralized pure functions.
4. Query cache owns remote server state; React component state owns only ephemeral UI state.
5. Search and radar requests are cancellable.
6. No component fetches directly with an upstream URL.
7. Every provider adapter has fixture-based contract tests.
8. No precise location in analytics, logs, error breadcrumbs, or share URLs without explicit user action.

---

## 6. UI Reference Translation

### 6.1 Visual direction retained from WeatherWise

- Light surface: cool off-white; dark surface: deep navy-black.
- Blue brand palette with orange/sunny, violet/storm, and cyan/precipitation accents.
- Inter typography with an oversized hero temperature.
- 4px spacing base; 16px mobile and 24px desktop gutters.
- 24px card radius; subtle border; minimal shadow.
- Desktop three-zone layout: navigation, main dashboard, daily sidebar.
- Tablet rail + stacked forecast.
- Mobile single column + bottom navigation.

### 6.2 Improvements to the reference UI

- Do not communicate weather intensity by color alone; pair color with labels/patterns.
- Replace glass blur where it harms contrast or GPU performance.
- Hero temperature must not push condition/location out of view for large font settings.
- Hourly forecast should be a semantic list/table with scroll controls and keyboard support.
- Metric cards need plain-language definitions and consistent periods/units.
- Radar timeline needs play/pause, step controls, speed, current-frame label, keyboard shortcuts, and reduced-motion behavior.
- Search results must show city, state/region, country, and optionally coordinates.
- Add explicit skeleton, empty, stale, partial, error, and offline variants for every major card.
- Reserve layout space for icons and values to avoid cumulative layout shift.

### 6.3 Design tokens to codify

```css
:root {
  --color-brand-700: #00629d;
  --color-brand-500: #00a3ff;
  --color-surface: #f7f9ff;
  --color-surface-card: #ffffff;
  --color-text: #171c22;
  --color-border: #bec7d4;
  --color-sunny: #ffb800;
  --color-storm: #7b61ff;
  --color-precip: #00d1ff;
  --radius-sm: 0.5rem;
  --radius-md: 1rem;
  --radius-lg: 1.5rem;
  --content-max: 75rem;
}
```

Before implementation, run automated contrast checks on final foreground/background pairs. These colors are starting references, not automatically approved combinations.

### 6.4 Required Storybook state matrix

For each relevant component/page:

- loading;
- success/default;
- long localized text;
- extreme temperature/wind/precipitation values;
- missing optional fields;
- stale cache;
- offline;
- recoverable error;
- provider outage/partial radar outage;
- light/dark mode;
- 200% text zoom;
- reduced motion.

---

## 7. Data Contract and Provider Strategy

### 7.1 Canonical internal models

Define provider-neutral models:

- `Location`: id, display name, region, country, latitude, longitude, timezone.
- `CurrentConditions`: observedAt, temperature, feelsLike, humidity, pressure, visibility, cloudCover, wind, UV, condition code.
- `HourlyForecast`: startsAt, temperature, condition, precipitation probability, precipitation amount, wind.
- `DailyForecast`: localDate, min/max, condition, precipitation, sunrise/sunset, UV.
- `RadarFrame`: timestamp, tile URL template or signed internal endpoint, bounds, attribution.
- `WeatherSnapshot`: location, source, fetchedAt, expiresAt, current, hourly, daily, warnings.

Every numeric field must document unit and nullability. Do not use sentinel zero for unavailable UV, rain, or visibility.

### 7.2 Provider decision spike

Compare candidate providers on:

- current/hourly/daily completeness;
- location timezone quality;
- radar availability and CORS;
- free-tier quota and commercial restrictions;
- attribution requirements;
- update frequency;
- data licensing/cache rules;
- Indonesian coverage;
- severe weather availability;
- API stability.

Select one canonical weather provider for MVP. Radar may use a separate provider, but attribution and timestamp must be independent. BMKG/Open-Meteo can be explored after MVP; do not silently blend values.

### 7.3 Cache policy proposal

| Resource | Browser query stale time | Server shared TTL | Offline availability |
|---|---:|---:|---|
| Geocoding result | 24 hours | 24 hours | recent searches only |
| Current + forecast snapshot | 10 minutes | 5–10 minutes | last successful snapshot |
| Radar metadata | 2 minutes | 1–2 minutes | no guarantee |
| Radar tiles | provider-compliant | provider-compliant | no guarantee |
| Settings | local persistent | n/a | yes |

The UI must display `observedAt`/`fetchedAt`, not imply cached data is current.

---

## 8. Route Contract

- `/` — dashboard for last/default location.
- `/forecast` — detailed forecast for active location.
- `/radar` — radar for active location.
- `/settings` — units, theme, language (if enabled), privacy/cache controls.
- `/place/[locationId]` — shareable provider-neutral location route.
- `/api/weather?locationId=...&units=metric`
- `/api/geocode?q=...`
- `/api/radar?locationId=...`
- `/api/health`

Avoid putting raw GPS coordinates in ordinary share URLs. If coordinates must be supported, round them and require explicit “share this location.”

---

## 9. Error, Offline, and Privacy Behavior

### 9.1 Typed errors

- `LOCATION_PERMISSION_DENIED`
- `LOCATION_UNAVAILABLE`
- `PLACE_NOT_FOUND`
- `INVALID_REQUEST`
- `UPSTREAM_RATE_LIMITED`
- `UPSTREAM_UNAVAILABLE`
- `RADAR_UNAVAILABLE`
- `OFFLINE_NO_CACHE`
- `MALFORMED_UPSTREAM_RESPONSE`

Return stable public error codes from the BFF and keep provider internals in redacted server logs.

### 9.2 Retry policy

- No automatic retry for invalid query, permission denied, or 4xx validation failures.
- Maximum 1–2 jittered retries for transient server/network failures.
- Respect provider `Retry-After`.
- Search request cancellation on new input.
- Never create infinite refresh loops.

### 9.3 Privacy requirements

- Ask for GPS only after user intent or clear contextual prompt.
- Default to a configured city when permission is denied.
- Store last location locally only after disclosure; provide “clear local data.”
- Do not log exact latitude/longitude; round or hash cache keys where practical.
- Do not include location in third-party monitoring breadcrumbs.
- Maintain a short privacy page even without accounts or analytics.

---

## 10. Non-Functional Quality Gates

### 10.1 Accessibility

Target **WCAG 2.2 AA**:

- semantic landmarks and headings;
- visible focus and logical focus order;
- skip link;
- all controls keyboard-operable;
- 44×44 CSS-pixel touch targets where feasible;
- contrast validation;
- 200% text zoom without loss of content;
- `prefers-reduced-motion` support;
- non-color labels for precipitation intensity;
- map/radar summary and frame timestamp available outside the visual map;
- polite live regions for search results and refresh status.

### 10.2 Performance budgets

Measured in CI on production builds with mobile throttling:

- Dashboard JS shipped on first load: target ≤ 180 KB gzip, hard cap 250 KB.
- Radar/map libraries loaded only on `/radar`.
- LCP ≤ 2.5 s at p75 target; CI lab budget ≤ 3.0 s.
- CLS ≤ 0.1.
- INP target ≤ 200 ms.
- No third-party font request.
- No provider request waterfall when one normalized snapshot can serve multiple widgets.

### 10.3 Reliability and security

- CSP, HSTS, `nosniff`, strict referrer policy, frame-ancestor denial.
- Dependency and secret scanning in CI.
- No provider key in client chunks/source maps.
- Zod validation of environment and upstream payloads.
- Timeouts and abort signals on every upstream call.
- Cache fallback only if age is shown.
- Preview and production environments use separate secrets/quotas where possible.

---

## 11. Roadmap

### Phase 0 — Product and technical foundation (2–4 days)

**Deliverables**

- Final PRD and non-goals.
- WeatherWise UI reference inventory.
- Provider comparison and licensing/quota decision.
- MapLibre vs Leaflet spike with one radar overlay.
- Canonical data schemas and API contract draft.
- Architecture Decision Records for framework, provider, map engine, cache, and deployment.
- Threat model for API key, geolocation, cache, and rate abuse.

**Exit criteria**

- No unresolved provider/licensing blocker.
- One successful server-side weather request mapped into canonical fixtures.
- One radar frame rendered in the chosen map spike.
- UI scope and routes frozen for MVP.

### Phase 1 — Repository, design system, and CI (3–5 days)

**Deliverables**

- Next.js/TypeScript strict project.
- Tokens, light/dark themes, typography, responsive shell.
- Storybook with foundational components.
- Unit/E2E test harness, MSW, axe, Lighthouse CI.
- GitHub Actions and preview deployment.
- Environment validation and security headers.

**Exit criteria**

- CI gates pass on an empty shell.
- Desktop rail/sidebar and mobile bottom navigation work by keyboard.
- No serious accessibility violations.

### Phase 2 — Secure data vertical slice (4–6 days)

**Deliverables**

- BFF weather/geocode endpoints.
- Provider adapters and Zod schemas.
- Caching, timeout, error mapping, and coarse rate limiting.
- Search with debounce/cancellation and disambiguated results.
- Location consent flow and default-city fallback.

**Exit criteria**

- Browser never calls provider directly.
- Client artifacts contain no API key.
- Contract tests cover valid, missing, malformed, rate-limited, and unavailable responses.
- GPS denial and city-not-found flows pass E2E.

### Phase 3 — Dashboard MVP (5–8 days)

**Deliverables**

- Current-weather hero.
- 24-hour strip.
- Metric grid with explanations and units.
- Daily sidebar on desktop; responsive alternatives on tablet/mobile.
- Loading, stale, partial, offline, and error states.
- Location-local date/time handling.

**Exit criteria**

- Dashboard passes responsive, keyboard, 200% zoom, and offline snapshot tests.
- No duplicate upstream request for widgets sharing one snapshot.
- Performance budgets pass.

### Phase 4 — Detailed forecast (3–5 days)

**Deliverables**

- 7–8-day route.
- Daily cards with consistent metrics.
- Unit/theme settings persisted locally.
- Shareable place routes and browser history behavior.

**Exit criteria**

- Direct links, refresh, back/forward, and invalid location IDs are tested.
- Forecast dates remain correct across timezone/DST fixtures.

### Phase 5 — Radar workspace (5–8 days)

**Deliverables**

- Lazy-loaded map.
- Radar frames, attribution, legend, timeline, play/pause, step, speed.
- Reduced-motion mode and keyboard controls.
- Radar unavailable/partial failure states.
- Mobile control-sheet layout.

**Exit criteria**

- Radar bundle does not affect dashboard initial JS budget.
- Timeline controls work without pointer input.
- Tile/frame timestamp and source attribution are visible.
- Provider terms and caching rules are satisfied.

### Phase 6 — PWA, hardening, and production launch (4–6 days)

**Deliverables**

- Installable manifest and carefully scoped service worker.
- Last-snapshot offline dashboard.
- Monitoring, redacted structured logs, health checks.
- CSP tuning, dependency scan, API abuse testing.
- Deployment runbook, rollback, cache purge/update behavior.
- Cross-browser and real-device QA.

**Exit criteria**

- Production deployment is reproducible from CI.
- Rollback is tested.
- Offline update behavior does not trap users on an old broken build.
- All P0/P1 defects closed.

### Phase 7 — Post-MVP improvements (prioritized by evidence)

Candidate items only after observing real use:

- BMKG radar layer for Indonesia.
- Open-Meteo precipitation grid fallback.
- English locale.
- Favorite places.
- Air quality.
- Severe weather alerts with authoritative-source disclaimers.
- Better PWA background refresh where platform support permits.

Do not schedule these merely because WeatherWise mentions them.

---

## 12. Implementation Work Breakdown

### Task 1: Freeze product contracts

**Objective:** Convert open assumptions into versioned decisions.

**Files:**
- Create: `docs/PRD.md`
- Create: `docs/API-CONTRACTS.md`
- Create: `docs/adr/0001-web-stack.md`
- Create: `docs/adr/0002-weather-provider.md`
- Create: `docs/adr/0003-map-engine.md`

**Steps:**
1. Document users, jobs, non-goals, routes, state matrix, and acceptance criteria.
2. Perform provider/license/quota comparison.
3. Write canonical schemas with field semantics, units, and nullability.
4. Review contradictions and resolve them explicitly.
5. Commit: `docs: freeze MVP product and architecture contracts`.

### Task 2: Scaffold project and quality gates

**Objective:** Create a reproducible strict TypeScript repository.

**Files:**
- Create: `package.json`, `pnpm-lock.yaml`, `.nvmrc`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `vitest.config.ts`, `playwright.config.ts`
- Create: `.github/workflows/ci.yml`

**TDD/verification:**
1. Add a failing smoke test for the root page.
2. Run it and confirm failure.
3. Add the minimal page and layout.
4. Verify typecheck, lint, unit, build, and Playwright smoke pass.
5. Commit: `chore: scaffold weather web app with CI quality gates`.

### Task 3: Implement tokens and responsive shell

**Objective:** Translate WeatherWise’s visual direction into accessible web tokens and navigation.

**Files:**
- Create: `src/styles/tokens.css`
- Create: `src/components/shell/app-shell.tsx`
- Create: `src/components/shell/navigation.tsx`
- Test: `src/components/shell/app-shell.test.tsx`
- Story: `stories/app-shell.stories.tsx`

**Verification:**
- Test active route semantics, keyboard navigation, reduced viewport behavior.
- Capture 360/768/1024/1440 screenshots.
- Run axe checks.
- Commit: `feat: add responsive accessible application shell`.

### Task 4: Build provider-neutral contracts

**Objective:** Prevent upstream response shapes from leaking into the app.

**Files:**
- Create: `src/server/schemas/weather.ts`
- Create: `src/server/providers/weather-provider.ts`
- Create: `src/test/fixtures/weather/*.json`
- Test: `src/server/schemas/weather.test.ts`

**Verification:**
- Test valid, missing optional fields, unknown fields, malformed timestamps, null precipitation, and extreme values.
- Commit: `feat: define canonical weather contracts`.

### Task 5: Implement secure BFF vertical slice

**Objective:** Fetch and normalize weather without exposing secrets.

**Files:**
- Create: `src/lib/env.ts`
- Create: `src/server/providers/<provider>-adapter.ts`
- Create: `src/app/api/weather/route.ts`
- Create: `src/app/api/geocode/route.ts`
- Test: route and adapter tests with MSW.

**Verification:**
- Confirm tests fail before implementation.
- Validate request parameters and error codes.
- Verify build output contains no secret using a CI scan.
- Verify timeout/abort behavior.
- Commit: `feat: add secure weather and geocoding BFF`.

### Task 6: Implement search and location flows

**Objective:** Support city selection and privacy-conscious GPS.

**Files:**
- Create: `src/features/search/*`
- Create: `src/features/location/*`
- Test: component/unit tests and `e2e/location.spec.ts`.

**Verification:**
- Test debounce, cancellation, duplicate city names, empty query, denied permission, unavailable GPS, and default-city fallback.
- Commit: `feat: add city search and location consent flows`.

### Task 7: Build dashboard components in isolation

**Objective:** Create visual states before page composition.

**Files:**
- Create: `src/components/weather/current-weather-hero.tsx`
- Create: `src/components/weather/hourly-strip.tsx`
- Create: `src/components/weather/metric-card.tsx`
- Create: `src/components/weather/daily-sidebar.tsx`
- Create corresponding tests and Storybook stories.

**Verification:**
- Test missing values, units, long text, stale indicator, keyboard scrolling, and 200% text zoom.
- Compare screenshots against WeatherWise references by layout/hierarchy—not pixel cloning.
- Commit each component separately.

### Task 8: Compose dashboard and offline snapshot

**Objective:** Deliver the primary end-to-end weather experience.

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/features/current-weather/queries.ts`
- Create: `src/lib/offline/weather-snapshot.ts`
- Test: `e2e/dashboard.spec.ts`, `e2e/offline.spec.ts`.

**Verification:**
- One normalized request serves dashboard widgets.
- Online, stale, offline, and no-cache paths pass.
- Lighthouse and bundle budgets pass.
- Commit: `feat: deliver responsive weather dashboard`.

### Task 9: Implement detailed forecast

**Objective:** Add timezone-correct daily forecast and shareable place routes.

**Files:**
- Create: `src/app/forecast/page.tsx`
- Create: `src/app/place/[locationId]/page.tsx`
- Create: `src/features/forecast/*`
- Test: DST/timezone fixtures and `e2e/forecast.spec.ts`.

**Verification:**
- Test date boundaries, route refresh, history, invalid ID, and unit toggles.
- Commit: `feat: add detailed timezone-aware forecast`.

### Task 10: Implement radar behind a lazy boundary

**Objective:** Add performant and accessible radar playback.

**Files:**
- Create: `src/app/radar/page.tsx`
- Create: `src/features/radar/radar-map.tsx`
- Create: `src/features/radar/radar-timeline.tsx`
- Create: `src/app/api/radar/route.ts`
- Test: unit, contract, and `e2e/radar.spec.ts`.

**Verification:**
- Test frame order, no frames, malformed metadata, keyboard step/play/pause, reduced motion, attribution, mobile sheet, and lazy chunking.
- Commit: `feat: add accessible radar timeline and map`.

### Task 11: PWA and service-worker safety

**Objective:** Make the app installable and offline-useful without stale-deployment traps.

**Files:**
- Create/modify: manifest, icons, service worker config.
- Create: `e2e/pwa.spec.ts`.
- Document: `docs/RUNBOOK.md`.

**Verification:**
- Test installability, update flow, offline dashboard, online recovery, and cache version migration.
- Commit: `feat: add safe PWA caching and offline snapshot`.

### Task 12: Production hardening and launch

**Objective:** Release through reproducible CI with monitoring and rollback.

**Files:**
- Modify: `.github/workflows/ci.yml`
- Create: `.github/workflows/deploy.yml`
- Create: `docs/RUNBOOK.md`, `docs/TEST-PLAN.md`, `docs/PRIVACY.md`.

**Verification:**
- Run full test matrix, secret scan, dependency audit, Lighthouse, axe, and production smoke.
- Verify logs redact location and secrets.
- Deploy preview, perform manual exploratory QA, deploy production, test rollback.
- Commit: `chore: harden and release weather web app`.

---

## 13. Test Strategy

### Unit tests

- Unit conversions and rounding.
- Timezone and local-date grouping.
- Condition/icon mapping.
- Cache freshness calculation.
- Radar frame sorting and playback reducer.
- Search normalization.
- Provider response mapping.

### Contract tests

- Saved real-world sanitized fixtures.
- Missing/null fields.
- Provider additions/unknown fields.
- 401/403/404/429/5xx.
- Timeout, invalid JSON, unexpected content type.

### Component/integration tests

- All state matrix variants.
- Keyboard and focus management.
- Search cancellation.
- Unit/theme persistence.
- Stale and partial data labels.

### E2E critical paths

1. Default city → dashboard.
2. Search ambiguous city → select correct region → forecast.
3. GPS allow → dashboard.
4. GPS deny → default city.
5. Refresh → updated timestamp.
6. Offline with cache → stale snapshot.
7. Offline without cache → actionable empty state.
8. Radar playback with keyboard.
9. Direct route refresh and browser history.
10. Dark mode, reduced motion, 200% zoom.

### Manual exploratory matrix

- Chrome, Firefox, Safari, Edge current stable.
- Android Chrome and iOS Safari real devices when available.
- Slow 3G, offline, high latency, provider timeout.
- Small mobile, tablet portrait, laptop, ultrawide.
- Long Indonesian/English city names.
- Screen reader spot checks (NVDA/VoiceOver).

---

## 14. AI Agent Execution Contract

The implementing AI agent must follow these rules:

### 14.1 Before coding

1. Read `docs/PRD.md`, relevant ADRs, API contracts, and current tests.
2. Inspect existing patterns before adding dependencies or abstractions.
3. State the exact acceptance criteria addressed by the task.
4. Identify external API assumptions and verify them against official documentation or live sanitized fixtures.
5. Never infer a provider field’s unit or time period from its name alone.

### 14.2 During implementation

1. Use TDD for pure logic, provider adapters, and error behavior.
2. Keep each commit limited to one coherent task.
3. Do not alter scope, provider, routing, or architecture without an ADR update.
4. Never place secrets in client code, fixtures, logs, screenshots, or commits.
5. Do not copy WeatherWise Flutter widgets; reproduce the visual intent using semantic web components.
6. Reuse tokens/components only after a real second use or when required by the design system.
7. Do not add a package without documenting why platform APIs/current dependencies are insufficient.
8. Preserve cancellation and abort signals through browser → BFF → upstream.
9. Treat accessibility, loading/error states, and responsive behavior as part of each feature—not cleanup work.
10. If an external service cannot be reached, report the blocker; do not fabricate fixture output or claim a successful request.

### 14.3 Required verification before claiming completion

The agent must provide real command output for:

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm test:a11y
pnpm lighthouse
```

For UI tasks, include responsive screenshots or Storybook URLs/artifacts. For API tasks, include sanitized contract-test evidence. For deployment, provide a verifiable preview URL and re-fetch it before claiming success.

### 14.4 Review protocol

Every implementation task receives two reviews:

1. **Spec compliance review:** Does it satisfy the exact acceptance criteria with no extra scope?
2. **Code quality review:** Security, accessibility, correctness, maintainability, tests, and performance.

Do not proceed until both pass. A self-review by the same context is insufficient for high-risk items such as provider mapping, secrets, service workers, and deployment.

### 14.5 Stop conditions

The agent must stop and ask/raise a decision when:

- provider terms prohibit planned caching;
- radar attribution/licensing is unclear;
- canonical field semantics differ across providers;
- a route or UX behavior conflicts with the frozen PRD;
- a new paid service is needed;
- precise location would be persisted or shared;
- a dependency requires weakening CSP/security;
- test evidence cannot be produced.

---

## 15. Definition of Done

A feature is done only when:

- acceptance criteria are documented and satisfied;
- tests were written and executed;
- loading, error, empty, stale, and offline states are handled where applicable;
- keyboard, screen reader semantics, contrast, and reduced motion were considered;
- mobile/tablet/desktop layouts are verified;
- no secrets or precise location leak;
- documentation and ADRs match behavior;
- no new lint/type/test/build failures exist;
- preview deployment is verified for user-visible features;
- screenshots/artifacts are attached for UI changes;
- no unrelated refactor or speculative feature was added.

---

## 16. Open Decisions to Resolve in Phase 0

1. Which weather provider offers the acceptable quota, licensing, timezone quality, and 7–8-day forecast?
2. Which radar source legally permits browser display, caching, and the intended geography?
3. Is Indonesian-only MVP preferred, or should English ship concurrently?
4. Is anonymous coarse rate limiting sufficient, or is a managed Redis service acceptable?
5. Should share links identify provider geocoding IDs, geohashes, or application-generated stable place IDs?
6. Should the MVP be installable PWA at launch, or should service-worker complexity wait until after stable online behavior?
7. Is BMKG radar a launch requirement for Indonesia, or a post-MVP layer?
8. What is the default city when GPS is unavailable?
9. What exact attribution and disclaimer language is required by each provider?
10. What hosting region best balances the primary user location and provider latency?

Recommended defaults: Indonesian MVP, Jakarta fallback, no Redis until observed need, stable application place IDs, PWA in hardening phase, BMKG post-MVP unless it is the only acceptable radar source.

---

## 17. Expected Outcome

Following this plan should yield a web application that keeps WeatherWise’s effective dashboard/radar information architecture while improving browser-native performance, accessibility, security, route behavior, testability, and operational reliability. The architecture intentionally protects the project from provider churn without introducing a separate backend or unnecessary enterprise complexity.
