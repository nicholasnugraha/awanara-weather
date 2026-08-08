# Setup Secret GitHub Actions untuk OpenWeatherMap API

## Langkah-langkah

1. **Daftar di OpenWeatherMap**: https://home.openweathermap.org/users/sign_up
2. **Dapatkan API Key**: Setelah login, buka profile & copy `API key`
3. **Set GitHub Secret**:
   ```bash
   gh secret set OPENWEATHER_API_KEY -b YOUR_API_KEY_HERE -R nicholasnugraha/awanara-weather
   ```
   atau via GitHub UI: Settings → Secrets and variables → Actions → New repository secret
  
4. **Verify workflow** akan auto-test kontrak API setiap PR ke dev/main

## Workflow api-contract.yml

Workflow ini dijalankan otomatis saat ada perubahan di:
- `src/server/**/*.ts` (adapter & schema)
- `src/app/api/weather/route.ts`
- `src/app/api/geocode/route.ts`

Dia akan:
1. Build production + start server
2. Test `/api/weather?lat=-6.2088&lon=106.8456` dengan real API key
3. Validasi struktur JSON sesuai skema Zod
4. Test geocoding untuk Jakarta/Bandung
5. Kill server setelah selesai

Tanpa secret ini, test skipped. Dengan secret, CI benar-benar uji jalur data nyata → mencegah bug kelas yang sama terulang.

## Note untuk maintainers

Jika workflow gagal karena quota exhausted (free tier 1000 calls/day):
- Tunggu sampai tomorrow UTC reset
- Atau upgrade ke paid plan jika testing intensif diperlukan
- Bisa juga gunakan mock fixture untuk unit tests, tapi tetap perlu integration test berkala
