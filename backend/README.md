# OTT Streaming — Core Backend (1-bosqich)

Bu repo **alohida servis** sifatida rejalashtirilgan (Temporal / Spark / Dagster shu yerga
qo'shilmaydi — ular kelajakda alohida repo/service bo'lib, faqat kerakli joylarda bu backend
bilan HTTP/queue orqali gaplashadi).

## Nima bor (1-bosqich: Postgres + NestJS asosiy CRUD)

| Modul | Nima qiladi |
|---|---|
| `auth` | Register, login, email OTP verifikatsiya, forgot/reset password, JWT |
| `movies` | Kino katalogi CRUD (pagination + search + filter) |
| `subscriptions` | Oylik obuna (auto-billing yo'q), status, cancel, tarix |
| `tickets` | Premyera kino uchun abadiy chipta sotib olish + access-check |

## Muhim arxitektura qarorlari

1. **TypeORM emas, raw parameterized SQL (`pg`).** Loyihaning qolgan qismi
   (UPZ, ticket_app) bilan bir xil pattern — repository qatlamida to'g'ridan-to'g'ri
   SQL, query ustidan to'liq nazorat.

2. **Auto-billing yo'q model.** `subscriptions.expires_at` saqlanadi, lekin hech narsa
   avtomatik yechilmaydi. `cancel()` darhol statusni `cancelled`ga o'tkazadi. Eslatma
   yuborish (1 kun oldin / tugagan kunda) — **BullMQ delayed job** bilan keyingi bosqichda
   qo'shiladi (`subscription.service.ts` ichida shu joy izohlab qo'yilgan).

3. **Abadiy chipta — race-safe.** `tickets` jadvalida `UNIQUE(user_id, movie_id)`
   DB darajasida bor. Repository ikkinchi marta sotib olishga urinishni ham
   (`23505` — unique violation) tutib, mavjud chiptani qaytaradi — ikki qatlamli himoya,
   bito_task'dagi no-oversell pattern'iga o'xshash.

4. **Access-check qoidasi (`tickets/services/ticket.service.ts` — `checkAccess`):**
   - Premyera kino → **faqat chipta** yetarli (obuna yetmaydi)
   - Oddiy kino → **faol obuna YOKI chipta** yetarli

5. **`download_unlocked_at` — SQL darajasida hisoblanadi.** Kino yaratilganda
   `premiere_date + N oy` avtomatik hisoblab qo'yiladi (`movie.repository.ts`daqiladigan
   `INSERT` ichidagi `CASE ... interval` qarang). Haqiqiy "chiptani unlock qilish"
   (`tickets.can_download = true`) — bu ham keyingi bosqichda **delayed job** orqali
   ishga tushiriladi (`unlockDownloadsDueForMovie` metodi shuning uchun tayyorlab qo'yilgan).

## Hali yo'q (keyingi bosqichlar, reja bo'yicha)

- Video upload + FFmpeg HLS transcoding
- Redis 10-soniyalik batching → keyin ClickHouse
- To'lov integratsiyasi (Payme/Click)
- Temporal (subscription/ticket workflow'lar) — **alohida servis**
- Spark + Dagster (tungi anti-cheat tahlil) — **alohida servis**
- Testlar (`*.spec.ts`) — hozircha yozilmagan, keyingi commit'da qo'shiladi

## Ishga tushirish

```bash
cp .env.example .env
docker compose up -d postgres redis
npm install
npm run dev
```

Swagger: `http://localhost:8080/api/v1/docs`

## Muhim eslatma

`movies`, `subscriptions`, `tickets` endpointlari hozircha **rol tizimisiz** —
har qanday login qilgan foydalanuvchi kino qo'sha/o'zgartira oladi. Bu ataylab
shunday qoldirilgan (1-bosqichda RBAC yo'q), lekin production'ga chiqishdan oldin
`RolesGuard` (admin/user) albatta qo'shilishi kerak — `movie.controller.ts` ichida
shu joy izohlangan.
