import { createServerFn } from "@tanstack/react-start";
import { pgRun as dbRun, pgQuery as dbQuery, pgAll as dbAll, generateUUID, nowISO } from "~/db/postgres";
import { sendEmailAsync } from "~/lib/email";
import { technicianValidated, technicianRejected } from "~/lib/email-templates";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "~/lib/rate-limiter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  role: "admin";
}

export interface AdminTechnician {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  photoUrl: string;
  city: string;
  neighborhood: string;
  specialties: string[];
  yearsExperience: number;
  description: string;
  tariff: string;
  identityDoc: string;
  certifications: string[];
  status: "pending" | "verified" | "rejected" | "suspended";
  rating: number;
  reviewCount: number;
  totalInterventions: number;
  createdAt: string;
  rejectionReason?: string;
}

export interface AdminRequest {
  id: string;
  reference: string;
  clientName: string;
  technicianName: string | null;
  technicianId: string | null;
  category: string;
  date: string;
  timeSlot: string;
  address: string;
  urgency: "normal" | "urgent";
  description: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: string;
}

export interface AdminStats {
  totalClients: number;
  totalTechnicians: number;
  interventionsToday: number;
  monthlyRevenue: number;
  satisfactionRate: number;
  pendingRequests: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function techRowToAdmin(row: Record<string, unknown>): AdminTechnician {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    phone: row.phone as string,
    email: row.email as string,
    photoUrl: (row.photo_url as string) || "",
    city: row.city as string,
    neighborhood: row.neighborhood as string,
    specialties: JSON.parse((row.specialties as string) || "[]"),
    yearsExperience: (row.years_experience as number) || 0,
    description: (row.description as string) || "",
    tariff: (row.tariff as string) || "",
    identityDoc: (row.identity_doc as string) || "",
    certifications: JSON.parse((row.certifications as string) || "[]"),
    status: (row.status as AdminTechnician["status"]) || "pending",
    rating: (row.rating as number) || 0,
    reviewCount: (row.review_count as number) || 0,
    totalInterventions: (row.total_interventions as number) || 0,
    createdAt: row.created_at as string,
    rejectionReason: (row.rejection_reason as string) || undefined,
  };
}

function reqRowToAdmin(row: Record<string, unknown>): AdminRequest {
  return {
    id: row.id as string,
    reference: row.reference as string,
    clientName: row.client_name as string,
    technicianName: (row.tech_name as string) || null,
    technicianId: (row.technician_id as string) || null,
    category: row.category as string,
    date: row.date as string,
    timeSlot: row.time_slot as string,
    address: `${row.street || ""}, ${row.neighborhood || ""}, ${row.city || ""}`,
    urgency: (row.urgency as "normal" | "urgent") || "normal",
    description: row.description as string,
    status: (row.status as AdminRequest["status"]) || "pending",
    createdAt: row.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// Seed admin account if none exists (async, called lazily)
// ---------------------------------------------------------------------------

async function ensureAdminAccount(): Promise<void> {
  try {
    const existing = await dbQuery<{ id: string }>(
      "SELECT id FROM users WHERE email = 'admin@kongofix.com'"
    );
    if (!existing) {
      const id = generateUUID();
      await dbRun(
        `INSERT INTO users (id, full_name, phone, email, password_hash, role, verified, created_at)
         VALUES ($1, 'Administrateur KongoFix', '+242000000000', 'admin@kongofix.com', 'admin123', 'admin', 1, $2)`,
        id, nowISO()
      );
      console.log("[ADMIN] ✅ Compte admin créé: admin@kongofix.com / admin123");
    }
  } catch (err) {
    // Silently ignore if table doesn't exist yet (migration not run)
    console.log("[ADMIN] ⚠️ Could not ensure admin account:", (err as Error).message);
  }
}

// Try to ensure admin on module load (non-blocking)
ensureAdminAccount();

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

/**
 * Connexion administrateur.
 */
export const loginAdmin = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { email: string; password: string };
    if (!input.email || !input.password) {
      throw new Error("Email et mot de passe requis.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { email, password } = data;

    // Rate limiting : max 5 tentatives par email par minute
    const rateCheck = checkRateLimit(`admin-login:${email}`);
    if (!rateCheck.allowed) {
      throw new Error(
        `Trop de tentatives. Réessayez dans ${rateCheck.retryAfterSeconds} seconde${rateCheck.retryAfterSeconds > 1 ? "s" : ""}.`
      );
    }

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM users WHERE email = $1 AND role = 'admin'",
      email
    );

    if (!row) {
      recordFailedAttempt(`admin-login:${email}`);
      throw new Error("Email ou mot de passe incorrect.");
    }

    if (row.password_hash !== password) {
      recordFailedAttempt(`admin-login:${email}`);
      throw new Error("Email ou mot de passe incorrect.");
    }

    // Connexion réussie → réinitialiser le compteur
    resetRateLimit(`admin-login:${email}`);

    console.log(`[ADMIN] 🔑 Connexion: ${email}`);

    const user: AdminUser = {
      id: row.id as string,
      fullName: row.full_name as string,
      email: row.email as string,
      role: "admin",
    };

    return { success: true, user };
  });

/**
 * Récupère les statistiques du dashboard admin.
 */
export const getAdminStats = createServerFn({ method: "GET" }).handler(async () => {
  const todayStr = new Date().toISOString().split("T")[0];

  const totalClients = (await dbQuery<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM users WHERE role = 'client'"
  ))?.cnt || 0;

  const totalVerified = (await dbQuery<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM technicians WHERE status = 'verified'"
  ))?.cnt || 0;

  const interventionsToday = (await dbQuery<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM service_requests WHERE date = $1 AND status != 'cancelled'",
    todayStr
  ))?.cnt || 0;

  const pendingRequests = (await dbQuery<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM service_requests WHERE status = 'pending'"
  ))?.cnt || 0;

  const stats: AdminStats = {
    totalClients,
    totalTechnicians: totalVerified,
    interventionsToday,
    monthlyRevenue: 2850000,
    satisfactionRate: 4.6,
    pendingRequests,
  };

  return { stats };
});

/**
 * Récupère les techniciens en attente de validation.
 */
export const getPendingTechnicians = createServerFn({ method: "GET" }).handler(async () => {
  const rows = await dbAll<Record<string, unknown>>(
    "SELECT * FROM technicians WHERE status = 'pending' ORDER BY created_at DESC"
  );

  return { technicians: rows.map(techRowToAdmin) };
});

/**
 * Valide un technicien.
 */
export const validateTechnician = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string };
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId } = data;

    const tech = await dbQuery<{ full_name: string; email: string; status: string }>(
      "SELECT full_name, email, status FROM technicians WHERE id = $1",
      technicianId
    );

    if (!tech) throw new Error("Technicien introuvable.");
    if (tech.status !== "pending" && tech.status !== "suspended") {
      throw new Error("Ce technicien n'est pas en attente de validation.");
    }

    await dbRun(
      "UPDATE technicians SET status = 'verified', rejection_reason = NULL WHERE id = $1",
      technicianId
    );

    // Also mark the user as verified
    const techUser = await dbQuery<{ user_id: string }>(
      "SELECT user_id FROM technicians WHERE id = $1",
      technicianId
    );
    if (techUser) {
      await dbRun("UPDATE users SET verified = 1 WHERE id = $1", techUser.user_id);
    }

    console.log(`[ADMIN] ✅ Technicien validé: ${tech.full_name} (${technicianId})`);

    // Email de notification — compte validé
    const validatedTemplate = technicianValidated(tech.full_name);
    sendEmailAsync(tech.email, validatedTemplate.subject, validatedTemplate.html);

    return { success: true };
  });

/**
 * Refuse un technicien.
 */
export const rejectTechnician = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string; reason: string };
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    if (!input.reason || input.reason.trim().length < 5) {
      throw new Error("Veuillez fournir une raison de refus (min 5 caractères).");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId, reason } = data;

    const tech = await dbQuery<{ full_name: string; email: string; status: string }>(
      "SELECT full_name, email, status FROM technicians WHERE id = $1",
      technicianId
    );

    if (!tech) throw new Error("Technicien introuvable.");
    if (tech.status !== "pending") {
      throw new Error("Ce technicien n'est plus en attente de validation.");
    }

    await dbRun(
      "UPDATE technicians SET status = 'rejected', rejection_reason = $1 WHERE id = $2",
      reason.trim(), technicianId
    );

    console.log(`[ADMIN] ❌ Technicien refusé: ${tech.full_name} — ${reason.trim()}`);

    // Email de notification — compte refusé
    const rejectedTemplate = technicianRejected(tech.full_name, reason.trim());
    sendEmailAsync(tech.email, rejectedTemplate.subject, rejectedTemplate.html);

    return { success: true };
  });

/**
 * Suspend un technicien.
 */
export const suspendTechnician = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string };
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId } = data;

    const tech = await dbQuery<{ full_name: string; status: string }>(
      "SELECT full_name, status FROM technicians WHERE id = $1",
      technicianId
    );

    if (!tech) throw new Error("Technicien introuvable.");
    if (tech.status !== "verified") {
      throw new Error("Seuls les techniciens vérifiés peuvent être suspendus.");
    }

    await dbRun(
      "UPDATE technicians SET status = 'suspended' WHERE id = $1",
      technicianId
    );

    console.log(`[ADMIN] ⏸️ Technicien suspendu: ${tech.full_name}`);
    return { success: true };
  });

/**
 * Récupère tous les techniciens (avec recherche et filtres).
 */
export const getAllTechnicians = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as {
      search?: string;
      status?: string;
      specialty?: string;
    };
    return input || {};
  })
  .handler(async ({ data }) => {
    const { search, status, specialty } = data;

    let query = "SELECT * FROM technicians WHERE 1=1";
    const params: any[] = [];
    let paramIdx = 0;

    if (search) {
      paramIdx++;
      query += ` AND (full_name LIKE $${paramIdx} OR email LIKE $${paramIdx} OR city LIKE $${paramIdx})`;
      params.push(`%${search}%`);
    }

    if (status && status !== "tous") {
      paramIdx++;
      query += ` AND status = $${paramIdx}`;
      params.push(status);
    }

    if (specialty && specialty !== "tous") {
      paramIdx++;
      query += ` AND specialties LIKE $${paramIdx}`;
      params.push(`%${specialty}%`);
    }

    query += " ORDER BY created_at DESC";

    const rows = await dbAll<Record<string, unknown>>(query, ...params);

    // If specialty exact filter needed, do it in JS
    let results = rows.map(techRowToAdmin);
    if (specialty && specialty !== "tous") {
      results = results.filter((t) => t.specialties.includes(specialty));
    }

    return { technicians: results };
  });

/**
 * Récupère un technicien par ID.
 */
export const getTechnicianById = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string };
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId } = data;

    const tech = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM technicians WHERE id = $1",
      technicianId
    );

    if (!tech) throw new Error("Technicien introuvable.");
    return { technician: techRowToAdmin(tech) };
  });

/**
 * Récupère toutes les demandes avec filtres.
 */
export const getAllRequests = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { status?: string };
    return input || {};
  })
  .handler(async ({ data }) => {
    const { status } = data;

    let query = `
      SELECT sr.*, t.full_name as tech_name
      FROM service_requests sr
      LEFT JOIN technicians t ON sr.technician_id = t.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status && status !== "tous") {
      query += " AND sr.status = $1";
      params.push(status);
    }

    query += " ORDER BY sr.created_at DESC";

    const rows = await dbAll<Record<string, unknown>>(query, ...params);
    return { requests: rows.map(reqRowToAdmin) };
  });

/**
 * Supprime un technicien.
 */
export const deleteTechnician = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string };
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId } = data;

    const tech = await dbQuery<{ full_name: string; user_id: string }>(
      "SELECT full_name, user_id FROM technicians WHERE id = $1",
      technicianId
    );

    if (!tech) throw new Error("Technicien introuvable.");

    // Delete the associated user first (CASCADE will handle technician row)
    await dbRun("DELETE FROM users WHERE id = $1", tech.user_id);
    // Also delete technician row if cascade didn't work
    await dbRun("DELETE FROM technicians WHERE id = $1", technicianId);

    console.log(`[ADMIN] 🗑️ Technicien supprimé: ${tech.full_name}`);
    return { success: true };
  });
