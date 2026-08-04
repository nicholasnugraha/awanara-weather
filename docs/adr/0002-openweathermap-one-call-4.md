# ADR 0002 — OpenWeatherMap One Call API 4.0

- **Status:** Proposed (menunggu approval owner)
- **Tanggal:** 2026-08-04
- **Referensi:** `docs/06-PHASE0-DISCOVERY.md`, issue #1

## Konteks

Awanara membutuhkan data cuaca (current, hourly, daily) dengan batas operasional 1.000 request/hari (keputusan owner). Plan awal mengasumsikan One Call API 3.0 yang mengembalikan current+hourly+daily dalam satu response. Verifikasi dokumentasi resmi menunjukkan **One Call API 4.0** (versi yang aktif di akun owner) memiliki arsitektur endpoint terpisah.

## Keputusan

1. **Provider kanonikal:** OpenWeatherMap **One Call API 4.0**, subscription "One Call by Call".
2. **Free tier:** 1.000 calls/day gratis; bayar hanya untuk overage (default limit 2.000 calls/day, bisa diubah). Batas operasional Awanara = **1.000 calls/day** (sesuai free tier → tanpa biaya).
3. **Endpoint yang dipakai MVP:**
   - `/data/4.0/onecall/current` — kondisi saat ini (1 record)
   - `/data/4.0/onecall/timeline/1h` — hourly, maks **20 record = 20 jam**
   - `/data/4.0/onecall/timeline/1day` — daily, maks **10 record = 10 hari**
4. **Hourly MVP = 20 jam** (keputusan owner, opsi 2). Pagination untuk 24 jam ditunda.
5. **Geocoding** (`/geo/1.0/direct`, `/geo/1.0/reverse`) adalah produk terpisah; quota dihitung terpisah dari One Call.
6. **Auth:** query param `appid={API key}`; key hanya di server (BFF), tidak pernah di client.
7. **Units:** selalu kirim `units=metric` eksplisit (default API = kelvin).
8. **Lang:** `lang=id` (MVP Bahasa Indonesia).
9. **Field opsional:** dihilangkan dari response (bukan `null`) jika fenomena tidak terjadi → schema harus toleran terhadap field missing.

## Konsekuensi

- **Dashboard refresh = 3 panggilan** (current + 1h + 1day). Dengan cache server TTL dan deduplication, personal use aman di bawah 1.000/hari.
- BFF harus menggabungkan 3 response menjadi satu snapshot (`WeatherSnapshot`) dengan `timezone`/`timezone_offset` dari response sebagai sumber waktu lokal.
- `alerts` pada current = array ID; detail alert via `/alert/{id}` (opsional, post-MVP).
- Pagination (`next`/`prev`) menghitung sebagai panggilan terpisah — hindari kecuali diperlukan.

## Yang masih perlu diverifikasi (setelah key tersedia)

- Behavior HTTP `429` dan header rate-limit.
- Akuntansi quota: apakah failed call dihitung.
- Harga overage per call di atas 1.000/hari.
- Ketentuan caching & attribution resmi.
- Ketersediaan `alerts` pada paket ini.

## Alternatif yang dipertimbangkan

- **One Call API 3.0:** satu endpoint gabungan (lebih hemat call), tetapi tidak lagi menjadi produk yang aktif di akun owner; tidak dipilih.
- **Open-Meteo (gratis, tanpa key):** dipertimbangkan sebagai fallback/layer tambahan post-MVP, bukan pengganti (keputusan owner: tanpa provider fallback di MVP).
