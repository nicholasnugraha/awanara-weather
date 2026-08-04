# API Contracts — Awanara

> Draft v0.1 — menyusul ADR 0002. Semua field mendokumentasikan unit dan nullability.
> Internal DTO (provider-neutral) — UI **tidak pernah** menerima response provider mentah.

## 1. Prinsip

- Browser hanya memanggil endpoint BFF same-origin (`/api/*`).
- Provider key hanya ada di server.
- Timestamp disimpan sebagai **Unix seconds (UTC)**; rendering waktu lokal memakai `timezone` (IANA) dari response.
- Field yang tidak tersedia = **missing/omitted**, bukan `null` dan bukan `0` sentinel.
- Semua unit dikonversi di pure function terpusat (`lib/weather/units.ts`).

## 2. Location

```ts
interface Location {
  id: string;              // stable app-generated id (geohash atau slug kota)
  name: string;            // nama kota
  region?: string;         // state/provinsi (jika ada)
  country: string;         // kode negara (ISO 3166-1 alpha-2)
  lat: number;
  lon: number;
  timezone: string;        // IANA, contoh "Asia/Jakarta"
}
```

## 3. CurrentConditions

```ts
interface CurrentConditions {
  observedAt: number;      // Unix seconds UTC
  temperature: number;     // °C (metric)
  feelsLike: number;       // °C
  humidity: number;        // %
  pressure: number;        // hPa
  visibility?: number;     // meter (missing jika tidak tersedia)
  cloudCover?: number;     // %
  uvIndex?: number;        // 0-11+ (missing jika tidak tersedia)
  dewPoint?: number;       // °C
  wind: { speed: number; deg?: number };  // km/h, derajat
  condition: { id: number; main: string; description: string; icon: string };
  sunrise?: number;        // Unix seconds UTC
  sunset?: number;         // Unix seconds UTC
  alerts?: string[];       // ID alert (4.0), detail via /alert/{id}
}
```

## 4. HourlyForecast (MVP: hingga 20 jam)

```ts
interface HourlyForecastEntry {
  startsAt: number;        // Unix seconds UTC
  temperature: number;     // °C
  feelsLike?: number;      // °C
  condition: { id: number; main: string; description: string; icon: string };
  precipitationProbability?: number;  // pop, 0-1
  precipitationMm?: number;           // mm (1h), missing jika tidak tersedia
  wind: { speed: number; deg?: number };  // km/h
  humidity?: number;       // %
  uvIndex?: number;
}
```

## 5. DailyForecast (MVP: hingga 10 hari, tampilkan 7-8)

```ts
interface DailyForecastEntry {
  localDate: string;       // "YYYY-MM-DD" dalam timezone lokasi
  dt: number;              // Unix seconds UTC
  sunrise?: number;
  sunset?: number;
  temp: { day: number; min: number; max: number; night?: number; eve?: number; morn?: number };  // °C
  feelsLike?: { day?: number; night?: number; eve?: number; morn?: number };  // °C
  humidity?: number;       // %
  wind: { speed: number; deg?: number; gust?: number };  // km/h
  condition: { id: number; main: string; description: string; icon: string };
  clouds?: number;         // %
  precipitationProbability?: number;  // pop 0-1
  precipitationMm?: number;           // mm
  uvIndex?: number;
  moonPhase?: number;      // 0-1
}
```

## 6. WeatherSnapshot (gabungan BFF)

```ts
interface WeatherSnapshot {
  location: Location;
  source: "openweathermap-onecall-4";
  fetchedAt: number;       // Unix seconds UTC (waktu BFF fetch)
  expiresAt: number;       // fetchedAt + TTL cache
  timezone: string;        // IANA
  timezoneOffset: number;  // detik dari UTC
  current: CurrentConditions;
  hourly: HourlyForecastEntry[];   // ≤ 20
  daily: DailyForecastEntry[];     // ≤ 10
}
```

## 7. Endpoint BFF

| Endpoint | Query | Response | Cache (server) |
|---|---|---|---|
| `GET /api/weather?locationId=...&units=metric` | locationId wajib | `WeatherSnapshot` | TTL 5-10 menit, key: rounded lat/lon + units + lang |
| `GET /api/geocode?q=...` | q ≥ 2 chars | `Location[]` (≤ 5) | TTL 24 jam |
| `GET /api/radar?locationId=...` | (post-MVP) | radar frames | TTL 1-2 menit |
| `GET /api/health` | — | `{ status, quotaUsed, quotaLimit }` | — |

## 8. Typed errors (BFF → client)

```
LOCATION_PERMISSION_DENIED
LOCATION_UNAVAILABLE
PLACE_NOT_FOUND
INVALID_REQUEST
UPSTREAM_RATE_LIMITED
UPSTREAM_UNAVAILABLE
RADAR_UNAVAILABLE
OFFLINE_NO_CACHE
MALFORMED_UPSTREAM_RESPONSE
```

Format: `{ "error": { "code": "...", "message": "..." } }` — message berbahasa Indonesia, kode stabil.

## 9. Peta pemetaan upstream → DTO

| DTO field | Sumber One Call 4.0 |
|---|---|
| `current.*` | `/onecall/current` → `data[0]` |
| `hourly[]` | `/onecall/timeline/1h` → `data[]` |
| `daily[]` | `/onecall/timeline/1day` → `data[]` |
| `timezone` / `timezoneOffset` | response root |
| `precipitationProbability` | `data[].pop` (0-1) |
| `precipitationMm` | `data[].precipitation` (mm/h, hanya mm/h tersedia) |
| wind speed (km/h) | `wind_speed` — **unit upstream: default m/s di metric** → konversi ke km/h di `units.ts` (× 3.6) |
