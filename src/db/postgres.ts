/**
 * KongoFix — Adaptateur de base de données PostgreSQL (Neon)
 *
 * Même interface que sqlite.ts mais utilise PostgreSQL via @neondatabase/serverless.
 * Les requêtes utilisent la syntaxe $1, $2 au lieu de ?.
 *
 * Toutes les fonctions sont async (contrairement à SQLite qui était synchrone).
 */

import { Pool } from "@neondatabase/serverless";

// ---------------------------------------------------------------------------
// Singleton pool lazy
// ---------------------------------------------------------------------------

let _pool: Pool | null = null;

function getPool(): Pool {
  if (!_pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error(
        "DATABASE_URL is not set — connect a database before running queries."
      );
    }
    _pool = new Pool({ connectionString: url });
    console.log("[PostgreSQL] ✅ Pool de connexion créé");
  }
  return _pool;
}

// ---------------------------------------------------------------------------
// Helpers wrappés (async, interface compatible SQLite)
// ---------------------------------------------------------------------------

export function generateUUID(): string {
  return crypto.randomUUID();
}

export function nowISO(): string {
  return new Date().toISOString();
}

/**
 * Exécute une requête SELECT et retourne la première ligne, ou null.
 */
export async function pgQuery<T = Record<string, unknown>>(
  text: string,
  ...params: any[]
): Promise<T | null> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return (result.rows[0] as T) || null;
}

/**
 * Exécute une requête INSERT/UPDATE/DELETE et retourne toutes les lignes affectées.
 */
export async function pgRun(
  text: string,
  ...params: any[]
): Promise<Record<string, unknown>[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as Record<string, unknown>[];
}

/**
 * Exécute une requête SELECT et retourne toutes les lignes.
 */
export async function pgAll<T = Record<string, unknown>>(
  text: string,
  ...params: any[]
): Promise<T[]> {
  const pool = getPool();
  const result = await pool.query(text, params);
  return result.rows as T[];
}

// ---------------------------------------------------------------------------
// Table: payments
// ---------------------------------------------------------------------------

export async function ensurePaymentsTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
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
    )
  `);
  console.log("[PostgreSQL] ✅ Table payments vérifiée/créée");
}

// ---------------------------------------------------------------------------
// Table: reviews
// ---------------------------------------------------------------------------

export async function ensureReviewsTable(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      request_id TEXT REFERENCES service_requests(id) ON DELETE CASCADE,
      technician_id TEXT REFERENCES technicians(id) ON DELETE CASCADE,
      client_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT DEFAULT '',
      photo_url TEXT DEFAULT '',
      created_at TEXT NOT NULL
    )
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_reviews_technician ON reviews(technician_id)
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_reviews_request ON reviews(request_id)
  `);
  console.log("[PostgreSQL] ✅ Table reviews vérifiée/créée");
}
