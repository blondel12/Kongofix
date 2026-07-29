import { createServerFn } from "@tanstack/react-start";
import { pgRun as dbRun, pgQuery as dbQuery, pgAll as dbAll, generateUUID, nowISO, ensureReviewsTable } from "~/db/postgres";
import { sendEmailAsync } from "~/lib/email";
import { requestConfirmation, requestAssigned } from "~/lib/email-templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubmitRequestInput {
  category: string;
  date: string;
  timeSlot: string;
  urgency: "normal" | "urgent";
  street: string;
  neighborhood: string;
  city: string;
  description: string;
  technicianId: string | null;
  clientId: string;
  clientName: string;
}

export interface ServiceRequest {
  id: string;
  reference: string;
  category: string;
  date: string;
  timeSlot: string;
  urgency: "normal" | "urgent";
  street: string;
  neighborhood: string;
  city: string;
  description: string;
  technicianId: string | null;
  clientId: string;
  clientName: string;
  status: "pending" | "accepted" | "rejected" | "completed" | "cancelled";
  createdAt: string;
}

export interface TechnicianInfo {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  photoUrl: string;
  city: string;
  neighborhood: string;
  specialties: string;
  rating: number;
  reviewCount: number;
  tariff: string;
  yearsExperience: number;
}

export interface PaymentInfo {
  id: string;
  amount: string;
  method: string;
  status: string;
  reference: string;
  phoneNumber: string;
}

export interface ReviewInfo {
  id: string;
  rating: number;
  comment: string;
  photoUrl: string;
  createdAt: string;
}

export interface RequestDetail {
  request: ServiceRequest;
  technician: TechnicianInfo | null;
  payment: PaymentInfo | null;
  review: ReviewInfo | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateReference(): string {
  const num = String(Date.now() % 1000000).padStart(6, "0");
  return `PRX-${num}`;
}

function rowToRequest(row: Record<string, unknown>): ServiceRequest {
  return {
    id: row.id as string,
    reference: row.reference as string,
    category: row.category as string,
    date: row.date as string,
    timeSlot: row.time_slot as string,
    urgency: (row.urgency as "normal" | "urgent") || "normal",
    street: (row.street as string) || "",
    neighborhood: (row.neighborhood as string) || "",
    city: (row.city as string) || "",
    description: row.description as string,
    technicianId: (row.technician_id as string) || null,
    clientId: row.client_id as string,
    clientName: row.client_name as string,
    status: (row.status as ServiceRequest["status"]) || "pending",
    createdAt: row.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

export const submitRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as SubmitRequestInput;

    if (!input.category) throw new Error("Veuillez sélectionner un type de service.");
    if (!input.date) throw new Error("Veuillez choisir une date d'intervention.");

    const selectedDate = new Date(input.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate <= today) {
      throw new Error("La date d'intervention doit être dans le futur.");
    }

    if (!input.timeSlot) throw new Error("Veuillez choisir un créneau horaire.");
    if (!input.urgency) throw new Error("Veuillez indiquer le niveau d'urgence.");
    if (!input.street || input.street.trim().length < 3)
      throw new Error("Veuillez renseigner la rue (min 3 caractères).");
    if (!input.neighborhood || input.neighborhood.trim().length < 2)
      throw new Error("Veuillez renseigner le quartier.");
    if (!input.city || input.city.trim().length < 2)
      throw new Error("Veuillez renseigner la ville.");
    if (!input.description || input.description.trim().length < 20)
      throw new Error("La description doit contenir au moins 20 caractères.");
    if (!input.clientId) throw new Error("Vous devez être connecté.");

    return input;
  })
  .handler(async ({ data }) => {
    const {
      category, date, timeSlot, urgency, street,
      neighborhood, city, description, technicianId,
      clientId, clientName,
    } = data;

    const requestId = generateUUID();
    const reference = generateReference();
    const now = nowISO();

    await dbRun(
      `INSERT INTO service_requests (
        id, reference, category, date, time_slot, urgency,
        street, neighborhood, city, description, technician_id,
        client_id, client_name, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', $14)`,
      requestId, reference, category, date, timeSlot, urgency,
      street.trim(), neighborhood.trim(), city.trim(),
      description.trim(), technicianId,
      clientId, clientName, now
    );

    console.log(`[REQUESTS] ✅ Nouvelle demande: ${reference} — ${category}`);
    console.log(`[REQUESTS]    Client: ${clientName} (${clientId})`);
    if (technicianId) {
      console.log(`[REQUESTS]    Technicien: ${technicianId}`);
    }
    console.log(`[REQUESTS]    Date: ${date} — ${timeSlot} (${urgency})`);

    // Email de confirmation au client
    const clientRow = await dbQuery<{ email: string }>(
      "SELECT email FROM users WHERE id = $1",
      clientId
    );
    if (clientRow) {
      const confirmTemplate = requestConfirmation(category, date);
      sendEmailAsync(clientRow.email, confirmTemplate.subject, confirmTemplate.html);
    }

    // Notification au technicien si assigné
    if (technicianId) {
      const techRow = await dbQuery<{ full_name: string; email: string }>(
        "SELECT full_name, email FROM technicians WHERE id = $1",
        technicianId
      );
      if (techRow) {
        const assignTemplate = requestAssigned(techRow.full_name, date);
        sendEmailAsync(techRow.email, assignTemplate.subject, assignTemplate.html);
      }
    }

    return { success: true, requestId, reference };
  });

/**
 * Récupère les demandes d'un client donné.
 */
export const getClientRequests = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { clientId: string };
    if (!input.clientId) throw new Error("Identifiant client requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { clientId } = data;

    const rows = await dbAll<Record<string, unknown>>(
      "SELECT * FROM service_requests WHERE client_id = $1 ORDER BY created_at DESC",
      clientId
    );

    return { requests: rows.map(rowToRequest) };
  });

/**
 * Récupère les détails complets d'une demande (client, technicien, paiement, avis).
 */
export const getRequestDetail = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { requestId: string };
    if (!input.requestId) throw new Error("Identifiant de demande requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { requestId } = data;

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM service_requests WHERE id = $1",
      requestId
    );
    if (!row) throw new Error("Demande introuvable.");

    const request = rowToRequest(row);

    // Technicien info
    let technician: TechnicianInfo | null = null;
    if (request.technicianId) {
      const techRow = await dbQuery<Record<string, unknown>>(
        `SELECT id, full_name, phone, email, photo_url, city, neighborhood,
                specialties, rating, review_count, tariff, years_experience
         FROM technicians WHERE id = $1`,
        request.technicianId
      );
      if (techRow) {
        technician = {
          id: techRow.id as string,
          fullName: techRow.full_name as string,
          phone: techRow.phone as string,
          email: techRow.email as string,
          photoUrl: (techRow.photo_url as string) || "",
          city: techRow.city as string,
          neighborhood: techRow.neighborhood as string,
          specialties: techRow.specialties as string,
          rating: (techRow.rating as number) || 0,
          reviewCount: (techRow.review_count as number) || 0,
          tariff: (techRow.tariff as string) || "",
          yearsExperience: (techRow.years_experience as number) || 0,
        };
      }
    }

    // Payment info
    let payment: PaymentInfo | null = null;
    try {
      const payRow = await dbQuery<Record<string, unknown>>(
        "SELECT * FROM payments WHERE request_id = $1 ORDER BY created_at DESC LIMIT 1",
        requestId
      );
      if (payRow) {
        payment = {
          id: payRow.id as string,
          amount: payRow.amount as string,
          method: payRow.method as string,
          status: payRow.status as string,
          reference: payRow.reference as string,
          phoneNumber: (payRow.phone_number as string) || "",
        };
      }
    } catch {
      // Table payments might not exist yet
    }

    // Review info
    let review: ReviewInfo | null = null;
    try {
      const revRow = await dbQuery<Record<string, unknown>>(
        "SELECT * FROM reviews WHERE request_id = $1 LIMIT 1",
        requestId
      );
      if (revRow) {
        review = {
          id: revRow.id as string,
          rating: revRow.rating as number,
          comment: (revRow.comment as string) || "",
          photoUrl: (revRow.photo_url as string) || "",
          createdAt: revRow.created_at as string,
        };
      }
    } catch {
      // Table reviews might not exist yet
    }

    return { request, technician, payment, review };
  });

/**
 * Annule une demande en attente (statut passé à "cancelled").
 */
export const cancelRequest = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { requestId: string };
    if (!input.requestId) throw new Error("Identifiant de demande requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { requestId } = data;

    const row = await dbQuery<{ status: string }>(
      "SELECT status FROM service_requests WHERE id = $1",
      requestId
    );
    if (!row) throw new Error("Demande introuvable.");

    if (row.status !== "pending" && row.status !== "accepted") {
      throw new Error(
        `Cette demande ne peut pas être annulée (statut actuel : ${row.status}).`
      );
    }

    await dbRun(
      "UPDATE service_requests SET status = 'cancelled' WHERE id = $1",
      requestId
    );

    console.log(`[REQUESTS] ❌ Demande annulée: ${requestId}`);

    return { success: true };
  });

/**
 * Soumet un avis (review) pour une demande terminée.
 */
export const submitReview = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as {
      requestId: string;
      rating: number;
      comment?: string;
      photoUrl?: string;
    };
    if (!input.requestId) throw new Error("Identifiant de demande requis.");
    if (!input.rating || input.rating < 1 || input.rating > 5) {
      throw new Error("La note doit être comprise entre 1 et 5.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { requestId, rating, comment, photoUrl } = data;

    // Vérifie que la demande existe et est terminée
    const row = await dbQuery<{ status: string; technician_id: string | null; client_id: string }>(
      "SELECT status, technician_id, client_id FROM service_requests WHERE id = $1",
      requestId
    );
    if (!row) throw new Error("Demande introuvable.");
    if (row.status !== "completed") {
      throw new Error("Vous ne pouvez noter qu'une intervention terminée.");
    }
    if (!row.technician_id) {
      throw new Error("Aucun technicien assigné à cette demande.");
    }

    // Vérifie qu'il n'y a pas déjà un avis
    const existing = await dbQuery<{ id: string }>(
      "SELECT id FROM reviews WHERE request_id = $1",
      requestId
    );
    if (existing) {
      throw new Error("Vous avez déjà noté cette intervention.");
    }

    // Ensure reviews table exists
    try {
      await ensureReviewsTable();
    } catch {
      // Table might already exist
    }

    const reviewId = generateUUID();
    const now = nowISO();

    await dbRun(
      `INSERT INTO reviews (id, request_id, technician_id, client_id, rating, comment, photo_url, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      reviewId, requestId, row.technician_id, row.client_id,
      rating, (comment || "").trim(), (photoUrl || "").trim(), now
    );

    // Update technician rating average
    const stats = await dbQuery<{ avg: number; cnt: number }>(
      "SELECT AVG(rating)::real as avg, COUNT(*)::int as cnt FROM reviews WHERE technician_id = $1",
      row.technician_id
    );
    if (stats) {
      await dbRun(
        "UPDATE technicians SET rating = $1, review_count = $2 WHERE id = $3",
        Math.round((stats.avg || rating) * 10) / 10,
        stats.cnt || 1,
        row.technician_id
      );
    }

    console.log(`[REVIEWS] ⭐ Avis soumis: ${reviewId} — note ${rating}/5`);

    return {
      success: true,
      review: {
        id: reviewId,
        rating,
        comment: (comment || "").trim(),
        photoUrl: (photoUrl || "").trim(),
        createdAt: now,
      } as ReviewInfo,
    };
  });
