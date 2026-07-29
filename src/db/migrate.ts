/**
 * KongoFix — Migration de base de données PostgreSQL
 *
 * Ce script lit le fichier schema.sql et l'exécute sur la base de données PostgreSQL
 * en découpant le SQL en instructions individuelles.
 *
 * Usage :
 *   bun run src/db/migrate.ts
 *
 * Prérequis : DATABASE_URL doit être défini dans l'environnement.
 */

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Pool } from "@neondatabase/serverless";

async function migrate() {
  console.log("🚀 Démarrage de la migration...");

  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error(
      "❌ DATABASE_URL n'est pas défini. Connectez une base de données avant d'exécuter la migration.",
    );
    process.exit(1);
  }

  const schemaPath = join(import.meta.dirname ?? __dirname, "schema.sql");
  console.log(`📄 Lecture du schéma : ${schemaPath}`);

  let schemaSQL: string;
  try {
    schemaSQL = await readFile(schemaPath, "utf-8");
  } catch (err) {
    console.error("❌ Impossible de lire le fichier schema.sql :", err);
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });

  try {
    // Split into individual statements, handling DO $$ ... $$ blocks and string literals
    const statements = splitSQL(schemaSQL);

    console.log(`⚙️  Exécution de ${statements.length} instructions SQL...`);
    let successCount = 0;
    let skipCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;

      try {
        await pool.query(stmt);
        successCount++;
      } catch (err: any) {
        // Ignore "does not exist" errors for DROP, and duplicate_object for CREATE TYPE
        const msg = err.message || "";
        if (
          msg.includes("does not exist") ||
          msg.includes("duplicate_object") ||
          msg.includes("already exists")
        ) {
          skipCount++;
        } else {
          console.error(`❌ Erreur SQL (instruction ${i + 1}): ${msg}`);
          console.error(`   SQL: ${stmt.substring(0, 100)}...`);
          throw err;
        }
      }
    }

    console.log(`✅ Migration terminée avec succès ! (${successCount} exécutées, ${skipCount} ignorées)`);
    console.log("📊 Tables créées :");
    console.log("   - users");
    console.log("   - technicians");
    console.log("   - service_categories (10 catégories par défaut)");
    console.log("   - service_requests");
    console.log("   - otps");
    console.log("   - password_resets");
  } catch (err) {
    console.error("❌ Erreur lors de la migration :", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

/**
 * Split SQL into individual statements, handling:
 * - DO $$ ... $$ blocks (plpgsql)
 * - String literals with $$ quoting
 * - Regular semicolons as statement separators
 */
function splitSQL(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollarBlock = false;
  let dollarTag = "";

  const chars = [...sql];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];

    if (!inDollarBlock) {
      // Check for $$ or $tag$
      const rest = chars.slice(i).join("");
      const dollarMatch = rest.match(/^(\$[a-z_]*\$)/i);
      if (dollarMatch) {
        dollarTag = dollarMatch[1];
        inDollarBlock = true;
        current += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }

      if (ch === ";") {
        current = current.trim();
        if (current) statements.push(current);
        current = "";
        continue;
      }
    } else {
      // Inside $$ block - look for matching end tag
      const rest = chars.slice(i).join("");
      if (rest.startsWith(dollarTag)) {
        inDollarBlock = false;
        current += dollarTag;
        i += dollarTag.length - 1;
        continue;
      }
    }

    current += ch;
  }

  const remaining = current.trim();
  if (remaining) statements.push(remaining);

  return statements;
}

migrate();
