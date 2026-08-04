# Phase 0 — Discovery Report

> Status: **Menunggu approval owner** sebelum scaffolding besar.
> Disusun oleh AI agent sesuai urutan `00-AGENT-START-HERE.md`.

---

## 1. Verifikasi Environment (Lokal)

| Tool | Versi | Status |
|---|---|---|
| Node.js | v24.16.0 | ✅ Tersedia |
| npm | 12.0.2 | ✅ Tersedia |
| corepack | 0.35.0 | ✅ Tersedia (via `corepack.cmd`) |
| pnpm | 11.20.0 | ✅ Terinstal via `npm -g` |
| git | 2.51.0.windows.1 | ✅ Tersedia |
| GitHub CLI (`gh`) | 2.97.0 | ⚠️ Terinstal, **belum login** |
| winget | tersedia | ✅ (tidak berhasil untuk gh, dipakai metode manual) |

**Catatan penting tentang `gh`:**
- `winget install GitHub.cli` menggantung setelah verifikasi hash; dipakai metode manual (unduh zip rilis ke `C:\Users\Nicholas\tools\gh\bin\gh.exe`).
- `gh` belum tersedia di PATH permanen. Perlu ditambahkan ke PATH Windows, atau jalankan dengan path absolut.
- **`gh auth status` = belum login ke host GitHub mana pun.** Untuk membuat repository, perlu `gh auth login` yang interaktif oleh owner.

**Catatan corepack:** perintah `corepack` bare di MSYS bash gagal karena path-mangling (`C:\c\Program Files\nodejs`). Bekerja normal via `corepack.cmd`.

---

## 2. Verifikasi Akun GitHub

- Akun: **`nicholasnugraha`**
- Tipe: **User** (akun pribadi, bukan organization) ✅
- Nama: **Nicholas Rassya Nugraha** — cocok dengan owner.

Sesuai docs, ini adalah akun pribadi yang dimaksud. Namun **autentikasi `gh` belum ada**, sehingga operasi pembuatan repository tetap menunggu `gh auth login` oleh owner.

---

## 3. Ketersediaan Nama

- `https://api.github.com/repos/nicholasnugraha/awanara-weather` → **HTTP 404** = nama **tersedia** (belum dipakai) ✅
- Pemeriksaan dasar ini belum termasuk trademark/domain clearance formal.

---

## 4. Temuan OpenWeatherMap One Call API 4.0

> Panel: "One Call API 4.0" (https://openweathermap.org/api/one-call-4). Konten diverifikasi langsung dari dokumentasi resmi.

### 4.1 Skema subscribe & quota

- One Call API 4.0 hanya tersedia di subscription **"One Call by Call"**.
- Paket ini menyertakan **1.000 calls/day gratis**.
- Anda hanya membayar untuk **jumlah panggilan di atas batas gratis harian**.
- Setelah subscribe, **default limit 2.000 calls/day** diatur otomatis; limit ini **bisa diubah**.
- Tidak diperlukan subscription OpenWeather lain untuk mengakses One Call 4.0.

> ✅ **Konfirmasi penting:** batas operasional yang Anda tetapkan (1.000 request/hari) **tepat sama dengan free tier One Call 4.0**. Ini aman dan tidak akan menimbulkan biaya selama penggunaan di bawah 1.000 calls/hari.

### 4.2 Arsitektur endpoint — PERUBAHAN BESAR vs One Call 3.0

| Aspek | One Call 3.0 (diasumsikan plan) | One Call 4.0 (aktual) |
|---|---|---|
| Selfkal satu response | Satu endpoint `/onecall` mengembalikan current+hourly+daily sekaligus | **Terpecah** menjadi beberapa endpoint terpisah |
| Current | di dalam `/onecall` | `/data/4.0/onecall/current` |
| Hourly | di dalam `/onecall` | `/data/4.0/onecall/timeline/1h` |
| Daily | di dalam `/onecall` | `/data/4.0/onecall/timeline/1day` |
| Detail | — | `/timeline/1min`, `/timeline/15min`, `/alert/{id}` |

**Implikasi arsitektur:** plan mengasumsikan "satu snapshot gabungan untuk current/hourly/daily". Dengan 4.0, **dashboard refresh membutuhkan 3 panggilan terpisah** (current + timeline/1h + timeline/1day). Ini harus direvisi pada desain BFF dan cache.

### 4.3 Batas record per endpoint

| Endpoint | Max record | Kegunaan |
|---|---|---|
| `/current` | 1 record | Kondisi saat ini |
| `/timeline/1min` | 60 record | 60 menit |
| `/timeline/15min` | 50 record | 12,5 jam |
| `/timeline/1h` | 20 record | **20 jam** |
| `/timeline/1day` | 10 record | **10 hari** |

> ⚠️ **Keterbatasan penting:** timeline `/1h` hanya mengembalikan **20 record = 20 jam**, padahal acceptance criteria MVP meminta **hourly forecast 24 jam**. Untuk 24 jam dibutuhkan **pagination** (panggilan tambahan via `next`/`prev`), atau menerima 20 jam, atau kombinasi. Setiap panggilan pagination **dihitung sebagai panggilan terpisah**.

### 4.4 Parameter & autentikasi

- URL: `https://api.openweathermap.org/data/4.0/onecall/...`
- Auth: `appid={API key}` (query param)
- `lat`, `lon` wajib.
- `units`: `standard` (kelvin) | `metric` (Celsius) | `imperial` (Fahrenheit). Default `standard`.
- `lang`: untuk output bahasa.
- `cnt`, `start`: untuk pagination timeline.
- Response berisi `timezone` (IANA, mis. `Europe/London`) dan `timezone_offset`.

### 4.5 Struktur response (ringkas)

**Current** (`/current`):
```
lat, lon, timezone, timezone_offset
data[0]: dt, sunrise, sunset, temp, feels_like, pressure, humidity,
         dew_point, uvi, clouds, visibility, wind_speed, wind_deg,
         weather[{id, main, description, icon}], alerts[ID...]
```
- Field opsional **dihilangkan** (bukan null) jika fenomena tidak terjadi.
- `alerts` = array ID; detail alert diambil via `/alert/{id}`.

**Timeline 1day** (`/timeline/1day`):
```
data[].dt, sunrise, sunset, moonrise, moonset, moon_phase,
temp {day, min, max, night, eve, morn},
feels_like {day, night, eve, morn},
pressure, humidity, dew_point, wind_speed, wind_deg, wind_gust,
weather[{id, main, description, icon}], clouds, pop, uvi
```
- `pop` = probability of precipitation.
- `prev`/`next` = URL pagination.

### 4.6 Geocoding

- Geocoding (cari kota → koordinat) adalah **produk terpisah** (`/geo/1.0/direct`, `/geo/1.0/reverse`), bukan bagian dari One Call 4.0. Quota geocoding dihitung terpisah dari One Call.

### 4.7 Perlu diverifikasi lebih lanjut (setelah ada key)

- Perilaku exact `429` dan header rate-limit.
- Akuntansi quota: apakah failed call dihitung.
- Harga overage per call di atas 1.000/hari (pricing page).
- Ketentuan caching/attribution resmi.
- Ketersediaan endpoint `alerts` di paket ini.

---

## 5. Implikasi Arsitektur terhadap Plan

1. **Revisi desain BFF/cache:** dashboard = 3 panggilan (current + 1h + 1day). Cache per-koordinat harus menyimpan hasil 3 endpoint sebagai satu snapshot, memakai `timezone`/`timezone_offset` dari response.
2. **Hourly 24 jam:** endpoint `/timeline/1h` hanya 20 record. Keputusan: (a) pagination jadi 2 panggilan, (b) terima 20 jam, atau (c) query `start`/`cnt` untuk rentang. **Butuh keputusan owner.**
3. **Budget 1.000/hari:** full refresh ≈ 3 calls. Dengan cache TTL, personal use aman. Geocoding terpisah.
4. **Field opsional dihilangkan (bukan null):** schema Zod harus menangani field missing, bukan `null`.
5. **`units` default kelvin** — aplikasi wajib selalu mengirim `units=metric` eksplisit.

---

## 6. Rekomendasi Keputusan yang Dibutuhkan Owner

### A. Autentikasi GitHub (blocking untuk melangkah)
- Jalankan `gh auth login` (interaktif, oleh owner) agar agent bisa membuat repository.
- Atau beri tahu agent lokasi/manajemen token yang disetujui (bukan plain text di chat).

### B. Hourly forecast 24 jam vs 20 jam — **DIPUTUSKAN: Opsi 2 (20 jam)**
- ✅ Owner memilih **menerima 20 jam untuk MVP** (paling hemat quota, sesuai KISS).
- Dashboard menampilkan hourly hingga 20 jam ke depan dari `/timeline/1h` (1 panggilan).
- Full refresh = 3 calls (current + 1h + 1day).
- Revisi di masa depan (24 jam penuh) dapat dilakukan via pagination saat benar-benar dibutuhkan.

### C. Scope Phase 1-2
- Apakah boleh lanjut ke **Phase 1 (scaffold Next.js + CI)** setelah repository dibuat dan di-approve, atau berhenti setelah setup repo?

### D. Open items yang saya tangani di Phase 0 setelah approval
- Menulis ADR `0002-openweathermap-one-call-4.md`.
- Menulis draft API contracts (`docs/API-CONTRACTS.md`).
- Membuat repository, branch/ruleset, GitHub Project, Phase 0 issues.
- Berhenti untuk review owner terhadap setup repository.

---

## 7. Ringkasan Approval Request

Berdasarkan `00-AGENT-START-HERE.md`, saya tidak melanjutkan ke scaffolding tanpa approval. Mohon konfirmasi:

1. **Autentikasi `gh`** — lakukan `gh auth login` atau instruksikan metode login yang disetujui.
2. **Keputusan hourly** (B di atas).
3. **Persetujuan** untuk melanjutkan membuat repository + setup Phase 0 setelah auth selesai.