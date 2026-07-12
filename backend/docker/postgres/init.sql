CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
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
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    can_download BOOLEAN NOT NULL DEFAULT FALSE,
    purchased_at TIMESTAMPTZ DEFAULT NOW(),

    -- Bitta foydalanuvchi bitta kinoni ikki marta sotib ololmaydi (DB darajasida majburiy,
    -- application-level tekshiruv bilan birga ikki qatlamli himoya beradi)
    UNIQUE (user_id, movie_id)
);

CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_movie_id ON tickets (movie_id);
