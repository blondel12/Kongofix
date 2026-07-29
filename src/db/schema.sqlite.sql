-- ProxiServ — Schéma de base de données SQLite
-- Adapté du schéma PostgreSQL pour bun:sqlite

-- ============================================================
-- Table: users (clients + techniciens + admins)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('client', 'technicien', 'admin')),
    verified INTEGER NOT NULL DEFAULT 0,
    address TEXT,
    photo_url TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================
-- Table: technicians (profil étendu)
-- ============================================================
CREATE TABLE IF NOT EXISTS technicians (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    password_hash TEXT NOT NULL,
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
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'suspended')),
    availability TEXT NOT NULL DEFAULT 'offline' CHECK (availability IN ('available', 'busy', 'offline')),
    working_hours TEXT NOT NULL DEFAULT '{"start":"08:00","end":"18:00"}',
    rating REAL NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    total_interventions INTEGER NOT NULL DEFAULT 0,
    rejection_reason TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_technicians_status ON technicians(status);
CREATE INDEX IF NOT EXISTS idx_technicians_city ON technicians(city);
CREATE INDEX IF NOT EXISTS idx_technicians_user_id ON technicians(user_id);

-- ============================================================
-- Table: service_categories
-- ============================================================
CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🔧',
    slug TEXT UNIQUE NOT NULL,
    tech_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================
-- Table: service_requests (demandes d'intervention)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
    street TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    city TEXT NOT NULL,
    description TEXT NOT NULL,
    technician_id TEXT,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_service_requests_client ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_technician ON service_requests(technician_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_date ON service_requests(date);

-- ============================================================
-- Table: otps (codes de vérification)
-- ============================================================
CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps(user_id);
