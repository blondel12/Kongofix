/**
 * KongoFix — Adaptateur de base de données SQLite
 *
 * Utilise bun:sqlite (intégré à Bun, pas de dépendance).
 * Le fichier kongofix.db est créé automatiquement à la racine du projet.
 *
 * Tout le code d'initialisation est lazy pour éviter l'exécution
 * côté navigateur via TanStack Start.
 */

import { Database } from "bun:sqlite";

// ---------------------------------------------------------------------------
// Singleton lazy
// ---------------------------------------------------------------------------

let _db: Database | null = null;
let _initialized = false;

function getDBPath(): string {
  // Le fichier kongofix.db est à la racine du projet
  return "./kongofix.db";
}

function getDB(): Database {
  if (!_db) {
    _db = new Database(getDBPath(), { create: true });
    _db.run("PRAGMA journal_mode = WAL");
    _db.run("PRAGMA foreign_keys = ON");
    console.log(`[SQLite] ✅ Base de données ouverte : ${getDBPath()}`);
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Helpers wrappés
// ---------------------------------------------------------------------------

function ensureInit(): void {
  if (!_initialized) initializeDatabase();
}

export function dbRun(sql: string, ...params: any[]): void {
  ensureInit();
  getDB().run(sql, ...params);
}

export function dbQuery<T = Record<string, unknown>>(
  sql: string,
  ...params: any[]
): T | null {
  ensureInit();
  return getDB().query<T, any[]>(sql).get(...params) as T | null;
}

export function dbAll<T = Record<string, unknown>>(
  sql: string,
  ...params: any[]
): T[] {
  ensureInit();
  return getDB().query<T, any[]>(sql).all(...params) as T[];
}

// ---------------------------------------------------------------------------
// Initialisation automatique (lazy, appelée au premier usage)
// ---------------------------------------------------------------------------

export function initializeDatabase(): void {
  if (_initialized) return;
  _initialized = true;

  const db = getDB();
  console.log("[SQLite] 🔧 Initialisation de la base de données...");

  // Schéma inline pour éviter de dépendre de node:fs
  const schema = `
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

CREATE TABLE IF NOT EXISTS service_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🔧',
    slug TEXT UNIQUE NOT NULL,
    tech_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

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

CREATE TABLE IF NOT EXISTS otps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps(user_id);

CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email);
`;

  const statements = schema
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  for (const stmt of statements) {
    try {
      db.run(stmt);
    } catch (err: any) {
      if (!err.message?.includes("already exists")) {
        console.error(`[SQLite] ⚠️ Erreur SQL: ${err.message}`);
      }
    }
  }

  // Insérer les catégories si la table est vide
  const catCount = (
    db.query("SELECT COUNT(*) as cnt FROM service_categories").get() as any
  )?.cnt || 0;

  if (catCount === 0) {
    console.log("[SQLite] 📋 Insertion des catégories par défaut...");
    const categories = [
      { name: "Électricien", icon: "⚡", slug: "electricien", tech_count: 0 },
      { name: "Plombier", icon: "🔧", slug: "plombier", tech_count: 0 },
      { name: "Menuisier", icon: "🪚", slug: "menuisier", tech_count: 0 },
      { name: "Peintre", icon: "🎨", slug: "peintre", tech_count: 0 },
      { name: "Climatisation", icon: "❄️", slug: "climatisation", tech_count: 0 },
      { name: "Électroménager", icon: "🧺", slug: "electromenager", tech_count: 0 },
      { name: "Mécanicien mobile", icon: "🚗", slug: "mecanicien-mobile", tech_count: 0 },
      { name: "Caméras de surveillance", icon: "📹", slug: "cameras-surveillance", tech_count: 0 },
      { name: "Internet / Wi-Fi", icon: "📡", slug: "internet-wifi", tech_count: 0 },
      { name: "Systèmes solaires", icon: "☀️", slug: "systemes-solaires", tech_count: 0 },
    ];

    const insert = db.prepare(
      "INSERT INTO service_categories (name, icon, slug, tech_count) VALUES (?, ?, ?, ?)"
    );
    for (const cat of categories) {
      insert.run(cat.name, cat.icon, cat.slug, cat.tech_count);
    }
  }

  // Log des stats
  const usersCount = (db.query("SELECT COUNT(*) as cnt FROM users").get() as any)?.cnt || 0;
  const techsCount = (db.query("SELECT COUNT(*) as cnt FROM technicians").get() as any)?.cnt || 0;
  const reqsCount = (db.query("SELECT COUNT(*) as cnt FROM service_requests").get() as any)?.cnt || 0;
  const catsCount = (db.query("SELECT COUNT(*) as cnt FROM service_categories").get() as any)?.cnt || 0;

  console.log(`[SQLite] 📊 Stats après init :`);
  console.log(`   - ${usersCount} utilisateurs`);
  console.log(`   - ${techsCount} techniciens`);
  console.log(`   - ${reqsCount} demandes`);
  console.log(`   - ${catsCount} catégories`);
}

// ---------------------------------------------------------------------------
// Helpers pour UUID et timestamps
// ---------------------------------------------------------------------------

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}
