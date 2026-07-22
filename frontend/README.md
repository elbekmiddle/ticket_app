# OTT.Stream — Frontend

Vite + React + TypeScript + Tailwind v4. Landing sahifadan tortib to'liq admin
panelgacha — backend'dagi barcha endpoint'lar bilan ishlaydi.

## Dizayn yo'nalishi

- **Ranglar:** Ink (#0e0b12, asosiy fon) / Curtain (#1b1420, kartalar) / Gold (#d4a24e,
  asosiy urg'u — kino afishasi oltin rangi) / Velvet (#8c2f39, premyera/qizil gilam urg'usi)
- **Shrift:** Fraunces (sarlavhalar, kinematik marquee hissi) + Inter (matn) + IBM Plex Mono
  (narxlar, chipta kodlari, sanalar)
- **Imzo element:** "Ticket-stub" — chap tomonida perforatsiya chizig'i bo'lgan karta
  komponenti (`.ticket-stub` klassi). Bu mahsulotning o'zi — abadiy chipta — dan olingan
  vizual metafora, generic gradient-card emas.

## Struktura

```
src/
  lib/
    api.ts             — barcha backend chaqiruvlari + token/refresh boshqaruvi
    auth-context.tsx   — joriy foydalanuvchi holati (React Context)
  components/
    PublicLayout.tsx   — header/footer (kirish/chiqish, admin link)
    AdminLayout.tsx    — admin sidebar
    RouteGuards.tsx    — ProtectedRoute (login kerak) / AdminRoute (admin kerak)
    VideoPlayer.tsx    — HLS.js bilan .m3u8 pleyer, progress tracking
    MovieCard.tsx, Stars.tsx, ui.tsx — qayta ishlatiladigan UI qismlari
  pages/
    Landing, Movies, MovieDetail, Login, Register, VerifyEmail,
    ForgotPassword, ResetPassword, Profile, Tickets, Subscription
    admin/
      AdminDashboard, AdminMovies, AdminMovieForm, AdminUsers
```

## Muhim texnik qarorlar

1. **Token saqlash — localStorage'da (ikkalasi ham).** Sodda yechim, lekin production
   uchun access token'ni xotirada (React state), refresh token'ni httpOnly cookie'da
   saqlash xavfsizroq bo'lardi. Backend hozircha ikkalasini ham JSON body'da qaytaradi,
   shuning uchun bu yerda soddalik tanlandi (`src/lib/api.ts` — `tokenStore`).

2. **401 kelsa — avtomatik refresh, keyin bir marta qayta urinish.** Parallel so'rovlar
   bir vaqtda 401 olsa, refresh faqat BIR marta chaqiriladi (`refreshPromise` bilan).

3. **Video progress — har 8 soniyada backend'ga yuboriladi**, backend Redis'ga yozadi,
   har 1 daqiqada Postgres'ga flush qiladi (backend arxitekturasiga qarang).

4. **Reviews moderatsiyasi (pin/unpin/delete)** — alohida "Admin → Reviews" sahifasi
   yo'q, chunki backend'da faqat `/reviews/movie/:movieId` bor (global list yo'q).
   Shuning uchun moderatsiya to'g'ridan-to'g'ri har bir kino sahifasida (`MovieDetail.tsx`)
   qilinadi — admin bo'lsa, pin/unpin/o'chirish tugmalari shu yerda chiqadi.

5. **Media yuklash** — admin fayl tanlaganda, avval backend'dan presigned S3 URL so'raladi
   (`/admin/media/upload-url`), keyin fayl **to'g'ridan-to'g'ri brauzerdan S3'ga** PUT
   qilinadi (backend orqali proxy emas — katta video fayllar uchun muhim).

## Ishga tushirish

```bash
cp .env.example .env
# .env ichida VITE_API_URL backend manzilingizga mos ekanini tekshiring
npm install
npm run dev
```

Backend `docker compose` bilan ishga tushirilgan bo'lishi kerak (`http://localhost:8080/api/v1`)