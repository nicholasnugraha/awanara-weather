# Environment and Credential Setup

## Local tools

Agent harus memverifikasi:

```bash
node --version
corepack --version
pnpm --version
git --version
gh --version
gh auth status
gh api user
```

Gunakan Node LTS yang kompatibel dengan Next.js, pnpm via Corepack, lockfile committed, dan `.nvmrc`/`.node-version`.

## Secret

Gunakan server-only variable:

```dotenv
OPENWEATHER_API_KEY=***
```

Dilarang menggunakan `NEXT_PUBLIC_OPENWEATHER_API_KEY`.

- Local: `.env.local`, gitignored.
- GitHub Actions: repository secret hanya jika live smoke test benar-benar dibutuhkan.
- Vercel Preview/Production: encrypted environment variables.
- Jangan cetak key atau URL yang mengandung key.
- Rotate jika key bocor di Git, log, artifact, screenshot, atau chat.

## OpenWeatherMap discovery

Agent berikutnya wajib mencari tahu:

- exact One Call API 4.0 endpoint/auth;
- included fields dan forecast horizon;
- timezone/units/nullability;
- attribution;
- caching terms;
- quota accounting dan failed-call behavior;
- `429`/rate-limit headers;
- pricing di atas cap;
- quota geocoding;
- radar/map availability.

Simpan hasil ke ADR dan API contracts. Gunakan test fixture untuk CI; jangan gunakan live API pada setiap test.

## Request budget

- 1.000 requests/day hard operational budget.
- Browser hanya memanggil BFF.
- Shared snapshot untuk current/hourly/daily.
- Cache server berdasarkan rounded location + units + language.
- Debounce geocoding 400–500 ms, cancellation, dan cache.
- Preview dilindungi/rate-limited.
- Internal request counter dan alert threshold 70%, 85%, 95%.
- Jangan retry agresif pada 429.
- Initial TTL 10 menit hanya asumsi; sesuaikan dengan terms resmi.

## Deployment

Target default: Vercel Free/Hobby jika current terms mengizinkan.

Sebelum deploy:

```bash
vercel --version
vercel whoami
```

Jika belum authenticated, owner melakukan login interaktif. Jangan meminta token/password plain text.
