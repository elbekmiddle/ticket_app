CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============ MOVIES ============
CREATE TABLE IF NOT EXISTS movies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_premiere BOOLEAN NOT NULL DEFAULT FALSE,
    premiere_date TIMESTAMPTZ,
    price NUMERIC(12, 2),
    poster_url TEXT,
    video_url TEXT,
    download_unlocked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movies_is_premiere ON movies (is_premiere);
CREATE INDEX IF NOT EXISTS idx_movies_title ON movies (title);

-- ============ SUBSCRIPTIONS ============
-- Auto-billing yo'q model: har bir obuna aniq expires_at bilan tugaydi,
-- foydalanuvchi qayta sotib olmasa avtomatik yechilmaydi.
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL DEFAULT 'monthly',
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active | expired | cancelled
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- "Foydalanuvchining faol obunasi bormi" so'rovi eng ko'p ishlatiladigan
-- so'rov bo'ladi (har video ochilganda tekshiriladi) — shuning uchun composite index:
CREATE INDEX IF NOT EXISTS idx_subscriptions_active_lookup
    ON subscriptions (user_id, status, expires_at);

-- ============ TICKETS (abadiy chipta) ============
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    can_download BOOLEAN NOT NULL DEFAULT FALSE,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),

    -- Bitta foydalanuvchi bitta kinoni ikki marta sotib ololmaydi (DB darajasida majburiy,
    -- application-level tekshiruv bilan birga ikki qatlamli himoya beradi)
    UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_movie_id ON tickets (movie_id);

-- ============ USER TIER / ADMIN ============
ALTER TABLE users ADD COLUMN IF NOT EXISTS tier INT NOT NULL DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- ============ REVIEWS ============
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Bitta user bitta kinoga faqat bitta review yoza oladi
    UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON reviews (movie_id);

-- ============ VIDEO PROGRESS (YouTube-style resume) ============
-- Redis'dan har 1 daqiqada flush qilinadigan "oxirgi holat" jadvali —
-- real-vaqtli progress Redis'da (user:progress:{userId}:{movieId}),
-- bu jadval faqat worker qayta ishga tushganda yoki Redis TTL tugaganda
-- fallback sifatida ishlatiladi.
CREATE TABLE IF NOT EXISTS user_video_progress (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    last_position_seconds INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, movie_id)
);

-- ============ SOFT DELETE (users, movies, reviews) ============
-- Qoida: hech qachon haqiqiy DELETE ishlatilmaydi (tickets/subscriptions bundan mustasno —
-- ular allaqachon status maydoni orqali "faol emas" holatini bildiradi, deleted_at kerak emas).
-- deleted_at NULL bo'lsa — yozuv "faol". deleted_at NOT NULL bo'lsa — "o'chirilgan" deb hisoblanadi,
-- lekin ma'lumot bazada qoladi (audit, statistika, kelajakda tiklash uchun).
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE movies ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- users.email UNIQUE ham xuddi shu muammoga duch keladi: agar user soft-delete
-- qilinsa, o'sha email bilan qayta ro'yxatdan o'tib bo'lmay qolardi. Partial
-- unique index'ga o'tkazamiz.
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_active
	ON users (email) WHERE deleted_at IS NULL;

-- reviews'dagi UNIQUE(user_id, movie_id) — agar review soft-delete qilinsa,
-- eski (o'chirilgan) qator baribir constraint'ga tegib, userning YANGI review
-- yozishiga to'sqinlik qilardi. Shuning uchun oddiy UNIQUE constraint'ni
-- PARTIAL unique index'ga almashtiramiz — faqat "faol" (deleted_at IS NULL)
-- qatorlar orasida noyoblikni talab qiladi.
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_movie_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_movie_active
	ON reviews (user_id, movie_id) WHERE deleted_at IS NULL;

-- "Faol yozuvlar"ni tez qidirish uchun partial index — o'chirilganlar indexga kirmaydi,
-- shuning uchun index kichikroq va tezroq bo'ladi (eng ko'p so'rov "faol"larni qidiradi).
CREATE INDEX IF NOT EXISTS idx_users_active ON users (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_movies_active ON movies (id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_active ON reviews (id) WHERE deleted_at IS NULL;

-- ============ MOVIES: aniq sana bilan download unlock ============
-- download_unlocked_at endi ikki yo'l bilan belgilanishi mumkin:
--   1) Aniq sana (movie.repository.ts'da INSERT paytida to'g'ridan-to'g'ri o'sha qiymat yoziladi)
--   2) premiere_date + N oy (eski nisbiy hisoblash, hali ham qo'llab-quvvatlanadi)
-- Ustunlik — aniq sanada, agar u berilgan bo'lsa.

-- ============ DOWNLOAD UNLOCK CRON UCHUN FLAG ============
-- Har cron tick'da butun movies jadvalini "download_unlocked_at <= NOW()" bo'yicha
-- qayta-qayta skanerlamaslik uchun — bir marta qayta ishlangan kino belgilab qo'yiladi.
ALTER TABLE movies ADD COLUMN IF NOT EXISTS downloads_unlocked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_movies_pending_unlock
	ON movies (download_unlocked_at)
	WHERE downloads_unlocked = FALSE AND deleted_at IS NULL;
