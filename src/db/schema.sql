-- ProxiServ — Schéma PostgreSQL (aligné avec le code serveur existant)
-- Ce schéma reprend exactement la structure SQLite avec types PostgreSQL natifs.

-- Types ENUM
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'technicien', 'admin');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE technician_status AS ENUM ('pending', 'verified', 'rejected', 'suspended');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE technician_availability AS ENUM ('available', 'busy', 'offline');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_status AS ENUM ('pending', 'accepted', 'rejected', 'completed', 'cancelled');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE request_urgency AS ENUM ('normal', 'urgent');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- Table: users
-- ============================================================
DROP TABLE IF EXISTS password_resets CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS service_requests CASCADE;
DROP TABLE IF EXISTS technician_services CASCADE;
DROP TABLE IF EXISTS technicians CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS service_categories CASCADE;

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'client',
    verified INTEGER NOT NULL DEFAULT 0,
    address TEXT,
    photo_url TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);

-- ============================================================
-- Table: technicians
-- ============================================================
CREATE TABLE technicians (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL DEFAULT '',
    photo_url TEXT DEFAULT '',
    city TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    specialties TEXT NOT NULL DEFAULT '[]',
    years_experience INTEGER NOT NULL DEFAULT 0,
    description TEXT DEFAULT '',
    tariff TEXT DEFAULT '',
    languages TEXT DEFAULT '',
    identity_doc TEXT DEFAULT '',
    certifications TEXT NOT NULL DEFAULT '[]',
    portfolio TEXT NOT NULL DEFAULT '[]',
    status technician_status NOT NULL DEFAULT 'pending',
    availability technician_availability NOT NULL DEFAULT 'offline',
    working_hours TEXT NOT NULL DEFAULT '{"start":"08:00","end":"18:00"}',
    rating REAL NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    total_interventions INTEGER NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    created_at TEXT NOT NULL
);

CREATE INDEX idx_technicians_status ON technicians(status);
CREATE INDEX idx_technicians_city ON technicians(city);
CREATE INDEX idx_technicians_user_id ON technicians(user_id);

-- ============================================================
-- Table: service_categories
-- ============================================================
CREATE TABLE service_categories (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🔧',
    slug TEXT UNIQUE NOT NULL,
    tech_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT ''
);

-- ============================================================
-- Table: service_requests
-- ============================================================
CREATE TABLE service_requests (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    urgency request_urgency NOT NULL DEFAULT 'normal',
    street TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT NOT NULL,
    technician_id TEXT,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status request_status NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
);

CREATE INDEX idx_service_requests_status ON service_requests(status);
CREATE INDEX idx_service_requests_client ON service_requests(client_id);
CREATE INDEX idx_service_requests_technician ON service_requests(technician_id);
CREATE INDEX idx_service_requests_date ON service_requests(date);

-- ============================================================
-- Table: otps
-- ============================================================
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE INDEX idx_otps_user_id ON otps(user_id);

-- ============================================================
-- Table: password_resets
-- ============================================================
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE INDEX idx_password_resets_email ON password_resets(email);

-- ============================================================
-- Table: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    request_id TEXT REFERENCES service_requests(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'technician')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_messages_request ON messages(request_id, created_at);

-- ============================================================
-- Table: payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    request_id TEXT REFERENCES service_requests(id) ON DELETE SET NULL,
    client_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    amount TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('airtel_money', 'mtn_money', 'cash')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
    reference TEXT UNIQUE NOT NULL,
    phone_number TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_request ON payments(request_id);

-- ============================================================
-- Table : waitlist (newsletter)
-- ============================================================
CREATE TABLE IF NOT EXISTS waitlist (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Insertion des catégories de services par défaut
-- ============================================================
INSERT INTO service_categories (name, icon, slug, tech_count, created_at) VALUES
    ('Électricien', '⚡', 'electricien', 0, NOW()::TEXT),
    ('Plombier', '🔧', 'plombier', 0, NOW()::TEXT),
    ('Menuisier', '🪚', 'menuisier', 0, NOW()::TEXT),
    ('Peintre', '🎨', 'peintre', 0, NOW()::TEXT),
    ('Climatisation', '❄️', 'climatisation', 0, NOW()::TEXT),
    ('Électroménager', '🧺', 'electromenager', 0, NOW()::TEXT),
    ('Mécanicien mobile', '🚗', 'mecanicien-mobile', 0, NOW()::TEXT),
    ('Caméras de surveillance', '📹', 'cameras-surveillance', 0, NOW()::TEXT),
    ('Internet / Wi-Fi', '📡', 'internet-wifi', 0, NOW()::TEXT),
    ('Systèmes solaires', '☀️', 'systemes-solaires', 0, NOW()::TEXT)
ON CONFLICT (slug) DO NOTHING;
