import { createServerFn } from "@tanstack/react-start";
import { pgRun as dbRun, pgQuery as dbQuery, pgAll as dbAll, generateUUID, nowISO } from "~/db/postgres";
import { sendEmailAsync } from "~/lib/email";
import { technicianRegistered } from "~/lib/email-templates";
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from "~/lib/rate-limiter";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TechnicianRegistrationData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  photoUrl: string;
  city: string;
  neighborhood: string;
  specialties: string[];
  yearsExperience: number;
  description: string;
  tariff: string;
  languages: string;
  identityDoc: string;
  certifications: string[];
  portfolio: string[];
  acceptedTerms: boolean;
}

export interface TechnicianProfile {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  photoUrl: string;
  city: string;
  neighborhood: string;
  specialties: string[];
  yearsExperience: number;
  description: string;
  tariff: string;
  languages: string;
  identityDoc: string;
  certifications: string[];
  portfolio: string[];
  status: "pending" | "verified" | "rejected" | "suspended";
  availability: "available" | "busy" | "offline";
  workingHours: { start: string; end: string };
  rating: number;
  reviewCount: number;
  totalInterventions: number;
  createdAt: string;
}

export interface TechnicianRequest {
  id: string;
  reference: string;
  clientName: string;
  category: string;
  date: string;
  timeSlot: string;
  address: string;
  urgency: "normal" | "urgent";
  description: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  createdAt: string;
}

export interface TechnicianStats {
  monthlyRevenue: number;
  completedMissions: number;
  averageRating: number;
  pendingRequests: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function techRowToProfile(row: Record<string, unknown>): TechnicianProfile {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    phone: row.phone as string,
    email: row.email as string,
    password: row.password_hash as string,
    photoUrl: (row.photo_url as string) || "",
    city: row.city as string,
    neighborhood: row.neighborhood as string,
    specialties: JSON.parse((row.specialties as string) || "[]"),
    yearsExperience: (row.years_experience as number) || 0,
    description: (row.description as string) || "",
    tariff: (row.tariff as string) || "",
    languages: (row.languages as string) || "",
    identityDoc: (row.identity_doc as string) || "",
    certifications: JSON.parse((row.certifications as string) || "[]"),
    portfolio: JSON.parse((row.portfolio as string) || "[]"),
    status: (row.status as TechnicianProfile["status"]) || "pending",
    availability: (row.availability as TechnicianProfile["availability"]) || "offline",
    workingHours: JSON.parse((row.working_hours as string) || '{"start":"08:00","end":"18:00"}'),
    rating: (row.rating as number) || 0,
    reviewCount: (row.review_count as number) || 0,
    totalInterventions: (row.total_interventions as number) || 0,
    createdAt: row.created_at as string,
  };
}

function requestRowToObj(row: Record<string, unknown>): TechnicianRequest {
  return {
    id: row.id as string,
    reference: row.reference as string,
    clientName: row.client_name as string,
    category: row.category as string,
    date: row.date as string,
    timeSlot: row.time_slot as string,
    address: `${row.street || ""}, ${row.neighborhood || ""}, ${row.city || ""}`,
    urgency: (row.urgency as "normal" | "urgent") || "normal",
    description: row.description as string,
    status: (row.status as TechnicianRequest["status"]) || "pending",
    createdAt: row.created_at as string,
  };
}

function generateRef(): string {
  const num = String(Date.now() % 1000000).padStart(6, "0");
  return `PRX-${num}`;
}

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

/**
 * Inscription d'un technicien (soumis pour vérification).
 */
export const registerTechnician = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as TechnicianRegistrationData;
    if (!input.fullName || input.fullName.trim().length < 3)
      throw new Error("Le nom complet est requis (min 3 caractères).");
    if (!input.phone || !/^\+?\d{9,15}$/.test(input.phone.replace(/\s/g, "")))
      throw new Error("Numéro de téléphone invalide.");
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email))
      throw new Error("Adresse email invalide.");
    if (!input.password || input.password.length < 6)
      throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
    if (!input.city || input.city.trim().length < 2)
      throw new Error("La ville est requise.");
    if (!input.neighborhood || input.neighborhood.trim().length < 2)
      throw new Error("Le quartier est requis.");
    if (!input.specialties || input.specialties.length === 0)
      throw new Error("Veuillez sélectionner au moins une spécialité.");
    if (!input.yearsExperience || input.yearsExperience < 0)
      throw new Error("Veuillez indiquer vos années d'expérience.");
    if (!input.description || input.description.trim().length < 20)
      throw new Error("La description doit contenir au moins 20 caractères.");
    if (!input.tariff || input.tariff.trim().length < 2)
      throw new Error("Veuillez indiquer votre tarif indicatif.");
    if (!input.identityDoc)
      throw new Error("La pièce d'identité est obligatoire.");
    if (!input.acceptedTerms)
      throw new Error("Vous devez accepter les conditions et la charte des techniciens.");
    return input;
  })
  .handler(async ({ data }) => {
    // Check duplicate email
    const existing = await dbQuery<{ id: string }>(
      "SELECT id FROM technicians WHERE email = $1",
      data.email
    );
    if (existing) {
      throw new Error("Un compte technicien avec cet email existe déjà.");
    }

    const id = generateUUID();
    const userId = generateUUID();
    const now = nowISO();

    // Créer l'utilisateur
    await dbRun(
      `INSERT INTO users (id, full_name, phone, email, password_hash, role, verified, created_at)
       VALUES ($1, $2, $3, $4, $5, 'technicien', 0, $6)`,
      userId, data.fullName.trim(), data.phone, data.email, await Bun.password.hash(data.password), now
    );

    // Créer le profil technicien
    await dbRun(
      `INSERT INTO technicians (
        id, user_id, full_name, phone, email, password_hash, photo_url,
        city, neighborhood, specialties, years_experience, description,
        tariff, languages, identity_doc, certifications, portfolio,
        status, availability, working_hours, rating, review_count,
        total_interventions, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, 'pending', 'offline', '{"start":"08:00","end":"18:00"}', 0, 0, 0, $19)`,
      id, userId,
      data.fullName.trim(), data.phone, data.email, await Bun.password.hash(data.password),
      data.photoUrl || "", data.city.trim(), data.neighborhood.trim(),
      JSON.stringify(data.specialties), data.yearsExperience,
      data.description.trim(), data.tariff.trim(), data.languages || "",
      data.identityDoc, JSON.stringify(data.certifications || []),
      JSON.stringify(data.portfolio || []), now
    );

    console.log(`[TECHNICIAN] ✅ Inscription technicien: ${id} (${data.email})`);
    console.log(`[TECHNICIAN] 📋 Statut: en attente de vérification`);

    // Email de confirmation d'inscription
    const regTemplate = technicianRegistered(data.fullName.trim());
    sendEmailAsync(data.email, regTemplate.subject, regTemplate.html);

    return { success: true, technicianId: id };
  });

/**
 * Connexion technicien (vérifie que le compte est vérifié).
 */
export const loginTechnician = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { email: string; password: string };
    if (!input.email || !input.password)
      throw new Error("Email et mot de passe requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { email, password } = data;

    // Rate limiting : max 5 tentatives par email par minute
    const rateCheck = checkRateLimit(`tech-login:${email}`);
    if (!rateCheck.allowed) {
      throw new Error(
        `Trop de tentatives. Réessayez dans ${rateCheck.retryAfterSeconds} seconde${rateCheck.retryAfterSeconds > 1 ? "s" : ""}.`
      );
    }

    const tech = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM technicians WHERE email = $1",
      email
    );

    if (!tech) {
      recordFailedAttempt(`tech-login:${email}`);
      throw new Error("Email ou mot de passe incorrect.");
    }

    if (!(await Bun.password.verify(password, tech.password_hash as string))) {
      recordFailedAttempt(`tech-login:${email}`);
      throw new Error("Email ou mot de passe incorrect.");
    }

    if (tech.status === "pending") {
      throw new Error(
        "Votre compte est en cours de vérification. Vous recevrez une réponse sous 48h."
      );
    }

    if (tech.status === "rejected") {
      throw new Error(
        "Votre inscription a été refusée. Veuillez contacter le support."
      );
    }

    if (tech.status === "suspended") {
      throw new Error(
        "Votre compte a été suspendu. Veuillez contacter le support."
      );
    }

    // Connexion réussie → réinitialiser le compteur
    resetRateLimit(`tech-login:${email}`);

    console.log(`[TECHNICIAN] 🔑 Connexion: ${tech.id} (${email})`);

    return {
      success: true,
      technician: {
        id: tech.id as string,
        fullName: tech.full_name as string,
        email: tech.email as string,
        phone: tech.phone as string,
        role: "technicien" as const,
      },
    };
  });

/**
 * Récupère le profil du technicien connecté.
 */
export const getTechnicianProfile = createServerFn({ method: "GET" })
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

    const { password_hash: _, ...profile } = techRowToProfile(tech);
    return { profile };
  });

/**
 * Met à jour le profil du technicien.
 */
export const updateTechnicianProfile = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string } & Partial<TechnicianProfile>;
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId, ...updates } = data;

    const tech = await dbQuery<{ id: string }>(
      "SELECT id FROM technicians WHERE id = $1",
      technicianId
    );
    if (!tech) throw new Error("Technicien introuvable.");

    const allowed = [
      "fullName", "phone", "email", "photoUrl", "city", "neighborhood",
      "specialties", "yearsExperience", "description", "tariff", "languages",
      "portfolio", "certifications", "availability", "workingHours",
    ];

    const colMap: Record<string, string> = {
      fullName: "full_name",
      phone: "phone",
      email: "email",
      photoUrl: "photo_url",
      city: "city",
      neighborhood: "neighborhood",
      specialties: "specialties",
      yearsExperience: "years_experience",
      description: "description",
      tariff: "tariff",
      languages: "languages",
      portfolio: "portfolio",
      certifications: "certifications",
      availability: "availability",
      workingHours: "working_hours",
    };

    const fields: string[] = [];
    const values: any[] = [];

    for (const key of allowed) {
      if (key in updates) {
        const col = colMap[key] || key;
        let val = (updates as any)[key];
        // Serialize JSON fields
        if (["specialties", "certifications", "portfolio"].includes(key)) {
          val = JSON.stringify(val || []);
        }
        if (key === "workingHours") {
          val = JSON.stringify(val || { start: "08:00", end: "18:00" });
        }
        fields.push(`${col} = $${fields.length + 1}`);
        values.push(val);
      }
    }

    if (fields.length > 0) {
      values.push(technicianId);
      await dbRun(
        `UPDATE technicians SET ${fields.join(", ")} WHERE id = $${values.length}`,
        ...values
      );
    }

    console.log(`[TECHNICIAN] ✏️ Profil mis à jour: ${technicianId}`);

    const updated = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM technicians WHERE id = $1",
      technicianId
    );
    const { password_hash: _, ...profile } = techRowToProfile(updated!);
    return { success: true, profile };
  });

/**
 * Récupère les demandes reçues par le technicien.
 */
export const getTechnicianRequests = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string };
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId } = data;

    const rows = await dbAll<Record<string, unknown>>(
      "SELECT * FROM service_requests WHERE technician_id = $1 ORDER BY created_at DESC",
      technicianId
    );

    return { requests: rows.map(requestRowToObj) };
  });

/**
 * Accepte une demande d'intervention.
 */
export const acceptRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string; requestId: string };
    if (!input.technicianId || !input.requestId)
      throw new Error("Identifiants requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId, requestId } = data;

    const req = await dbQuery<{ reference: string; status: string }>(
      "SELECT reference, status FROM service_requests WHERE id = $1 AND technician_id = $2",
      requestId, technicianId
    );

    if (!req) throw new Error("Demande introuvable.");
    if (req.status !== "pending")
      throw new Error("Cette demande n'est plus en attente.");

    await dbRun(
      "UPDATE service_requests SET status = 'accepted' WHERE id = $1",
      requestId
    );

    console.log(`[TECHNICIAN] ✅ Demande acceptée: ${req.reference} — ${technicianId}`);

    return { success: true };
  });

/**
 * Refuse une demande d'intervention.
 */
export const declineRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string; requestId: string };
    if (!input.technicianId || !input.requestId)
      throw new Error("Identifiants requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId, requestId } = data;

    const req = await dbQuery<{ reference: string; status: string }>(
      "SELECT reference, status FROM service_requests WHERE id = $1 AND technician_id = $2",
      requestId, technicianId
    );

    if (!req) throw new Error("Demande introuvable.");
    if (req.status !== "pending")
      throw new Error("Cette demande n'est plus en attente.");

    await dbRun(
      "UPDATE service_requests SET status = 'rejected' WHERE id = $1",
      requestId
    );

    console.log(`[TECHNICIAN] ❌ Demande refusée: ${req.reference} — ${technicianId}`);

    return { success: true };
  });

/**
 * Récupère les statistiques du technicien.
 */
export const getTechnicianStats = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { technicianId: string };
    if (!input.technicianId) throw new Error("Identifiant technicien requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { technicianId } = data;

    const tech = await dbQuery<{ rating: number; total_interventions: number }>(
      "SELECT rating, total_interventions FROM technicians WHERE id = $1",
      technicianId
    );

    const completed = (await dbQuery<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM service_requests WHERE technician_id = $1 AND status = 'completed'",
      technicianId
    ))?.cnt || 0;

    const pending = (await dbQuery<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM service_requests WHERE technician_id = $1 AND status = 'pending'",
      technicianId
    ))?.cnt || 0;

    const stats: TechnicianStats = {
      monthlyRevenue: 185000,
      completedMissions: completed,
      averageRating: tech?.rating || 4.5,
      pendingRequests: pending,
    };

    return { stats };
  });

/**
 * Déconnexion.
 */
export const logoutTechnician = createServerFn({ method: "POST" })
  .handler(async () => {
    console.log("[TECHNICIAN] 👋 Déconnexion");
    return { success: true };
  });
