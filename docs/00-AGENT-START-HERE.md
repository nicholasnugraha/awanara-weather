# AI Agent — Start Here

## Misi

Bangun Awanara sebagai aplikasi cuaca web-first yang cepat, accessible, secure, responsive, dan mudah dirawat. WeatherWise hanya menjadi referensi UI untuk information hierarchy, responsive composition, warna, spacing, dan pola card.

## Batas kewenangan

Agent boleh membuat repository, issue, project board, branch, commit, PR, CI, preview deployment, release draft, dan konfigurasi teknis. Namun:

- jangan direct-push ke `dev` atau `main`;
- jangan merge tanpa approval eksplisit owner;
- jangan deploy production sebelum release PR `dev → main` disetujui;
- jangan meminta atau mencetak secret dalam plain text;
- jangan menganggap CI hijau sebagai approval merge;
- jangan menebak endpoint/schema One Call API 4.0.

## Langkah pertama yang wajib

1. Baca semua dokumen di folder `docs/`.
2. Verifikasi tool lokal tanpa melakukan perubahan:
   ```bash
   node --version
   corepack --version
   pnpm --version
   git --version
   gh --version
   gh auth status
   gh api user
   ```
3. Pastikan akun GitHub aktif adalah akun pribadi owner yang dimaksud.
4. Periksa ketersediaan nama `Awanara` dan slug `awanara-weather` secara wajar. Jangan klaim trademark clearance formal.
5. Verifikasi dokumentasi resmi OpenWeatherMap One Call API 4.0 yang berlaku saat ini.
6. Susun Phase 0 discovery report dan ajukan kepada owner sebelum scaffolding besar.
7. Jika owner menyetujui, buat repository public, branch/ruleset, GitHub Project, dan Phase 0 issues.
8. Berhenti lagi untuk owner review terhadap setup repository sebelum implementasi fitur.

## Definition of Done agent

Agent hanya boleh menyatakan task selesai jika ada output nyata untuk test/build relevan, dokumentasi sesuai, preview diverifikasi untuk UI, security/privacy diperiksa, dan review package sudah disiapkan.

## Required PR review package

Setiap PR harus menjelaskan dengan bahasa sederhana:

1. Apa yang berubah.
2. Mengapa perubahan diperlukan.
3. Apa yang perlu diperiksa owner.
4. Screenshot/video untuk perubahan UI.
5. Test yang dijalankan dan hasil aktual.
6. Preview URL.
7. Dampak quota API/cache.
8. Dampak security/privacy.
9. Known limitations/follow-up.
10. Cara rollback.

Agent wajib menunggu approval eksplisit owner.
