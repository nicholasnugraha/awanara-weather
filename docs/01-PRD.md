# Product Requirements Document — Awanara

## 1. Ringkasan

Awanara adalah aplikasi cuaca personal berbasis web untuk melihat kondisi saat ini, prakiraan per jam dan harian, serta—setelah sumber yang sesuai ditemukan—radar/presipitasi. Produk menggunakan UI WeatherWise sebagai referensi visual, tetapi dibangun ulang menggunakan stack web-native.

## 2. Tujuan

- Memeriksa cuaca saat ini dengan cepat.
- Memilih lokasi melalui pencarian kota atau GPS setelah tindakan eksplisit user.
- Melihat prakiraan 24 jam dan 7–8 hari.
- Menampilkan metrik dengan unit, periode, timestamp, timezone, dan sumber yang jelas.
- Memberikan pengalaman responsif pada mobile, tablet, dan desktop.
- Menjaga API key tetap server-side.
- Tetap berguna melalui snapshot cuaca terakhir ketika offline sementara.

## 3. Target user

Penggunaan pribadi dengan deployment publik dan traffic rendah. Tidak ada SLA komersial.

## 4. MVP

1. Dashboard current weather.
2. Search kota yang menampilkan kota, region/state, dan country.
3. GPS berdasarkan aksi user, dengan fallback Jakarta.
4. Hourly forecast 24 jam.
5. Daily forecast 7–8 hari.
6. Detail humidity, pressure, wind, visibility, UV, precipitation jika tersedia.
7. Light/dark/system theme.
8. Unit Celsius, km/h, hPa, km, dan mm.
9. URL browser-native dan shareable place route.
10. Loading, empty, stale, offline, partial, dan typed error states.
11. BFF yang melindungi OpenWeatherMap key.
12. Cache dan request budget untuk menjaga batas 1.000 request/hari.

## 5. Post-MVP

- Radar setelah provider gratis/personal-use dan terms diverifikasi.
- Installable PWA dan service worker setelah online flow stabil.
- BMKG atau Open-Meteo sebagai layer/fallback terpisah jika terms dan semantik sesuai.
- Bahasa Inggris.
- Favorite places, air quality, dan alerts hanya berdasarkan kebutuhan nyata.

## 6. Non-goals MVP

- Account/login.
- Cloud sync.
- Payment/ads.
- Analytics/tracking.
- Push notification.
- Historical climate analytics.
- Native mobile app.
- AI-generated forecast.
- Mencampurkan metrik beberapa provider secara diam-diam.

## 7. UI direction

Pertahankan dari WeatherWise:

- desktop sidebar/navigation;
- tablet rail;
- mobile bottom navigation;
- current-weather hero dengan temperature besar;
- hourly strip;
- metric card grid;
- daily forecast sidebar di desktop;
- cool off-white/deep navy surfaces;
- brand blue, sunny orange, storm violet, precipitation cyan;
- Inter, spacing base 4px, card radius sekitar 24px.

Perbaikan wajib:

- semantic HTML;
- keyboard navigation;
- WCAG 2.2 AA;
- reduced motion;
- text zoom 200%;
- warna tidak menjadi satu-satunya indikator;
- state matrix Storybook;
- radar memiliki kontrol non-pointer dan timestamp/sumber yang jelas.

## 8. Route contract awal

- `/` dashboard
- `/forecast`
- `/radar`
- `/settings`
- `/place/[locationId]`
- `/api/weather`
- `/api/geocode`
- `/api/radar`
- `/api/health`

Jangan masukkan koordinat GPS presisi ke share URL biasa.

## 9. Provider dan quota

- Canonical provider: OpenWeatherMap.
- Account: One Call API 4.0 aktif.
- Hard operational budget: 1.000 request/hari.
- Satu key untuk dev dan production.
- Tidak ada automatic provider fallback pada MVP.
- Agent wajib memverifikasi endpoint, schema, quota accounting, pricing behavior, attribution, cache policy, geocoding quota, rate-limit headers, dan radar availability dari dokumentasi resmi terkini dan satu request live yang disanitasi.

## 10. Privacy

- GPS hanya setelah tindakan user.
- Simpan last selected city secara lokal.
- Jangan log precise coordinates.
- Jangan kirim precise location ke monitoring.
- Berikan clear local data.
- Provider key tidak boleh masuk client bundle/source map.

## 11. Acceptance criteria

1. Primary routes berfungsi pada 360, 768, 1024, dan 1440px.
2. Direct navigation, refresh, back, dan forward berfungsi.
3. Client artifacts tidak berisi API key.
4. View cuaca menampilkan lokasi, unit, timestamp, timezone-local time, dan attribution.
5. GPS denied, place not found, offline, quota, dan provider outage berbeda secara jelas.
6. Semua fungsi utama dapat dioperasikan dengan keyboard.
7. Axe tidak menemukan serious/critical violation pada primary route.
8. Cached dashboard dapat tampil offline dengan label stale dan timestamp.
9. Upstream response divalidasi runtime dan malformed payload tidak merusak UI.
10. Dashboard tidak membuat request upstream terpisah untuk setiap widget.
