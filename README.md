# Awanara

Awanara adalah proyek web app cuaca personal, web-first, yang menggunakan UI WeatherWise sebagai referensi hierarchy dan visual direction—bukan source code yang disalin.

## Mulai di sini (AI agent)

Baca dokumen dalam urutan berikut:

1. [`docs/00-AGENT-START-HERE.md`](docs/00-AGENT-START-HERE.md)
2. [`docs/01-PRD.md`](docs/01-PRD.md)
3. [`docs/02-IMPLEMENTATION-PLAN.md`](docs/02-IMPLEMENTATION-PLAN.md)
4. [`docs/03-PROJECT-GOVERNANCE.md`](docs/03-PROJECT-GOVERNANCE.md)
5. [`docs/04-ENVIRONMENT-SETUP.md`](docs/04-ENVIRONMENT-SETUP.md)
6. [`docs/05-DECISIONS-AND-OPEN-QUESTIONS.md`](docs/05-DECISIONS-AND-OPEN-QUESTIONS.md)

## Status

Workspace dokumentasi awal. Source code dan repository GitHub belum dibuat.

## Keputusan utama

- Nama kerja: **Awanara**
- Repository yang disarankan: `awanara-weather`
- Repository: baru, public, akun GitHub pribadi
- Branch: `dev` untuk staging/testing, `main` untuk stable/production
- Semua merge memerlukan review dan approval eksplisit owner
- Weather provider: OpenWeatherMap, One Call API 4.0
- Batas operasional: 1.000 upstream request/hari
- Stack: Next.js App Router, React, TypeScript strict, BFF server-side
- Bahasa MVP: Indonesia
- Default city: Jakarta
- Radar: setelah provider gratis dan terms-nya diverifikasi

## Secret

Jangan menaruh API key di dokumen, source code, issue, PR, log, screenshot, atau chat. Salin `.env.example` menjadi `.env.local` ketika implementasi dimulai.
