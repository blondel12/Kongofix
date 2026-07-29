import { createServerFn } from "@tanstack/react-start";
import {
  pgRun as dbRun,
  pgQuery as dbQuery,
  pgAll as dbAll,
  generateUUID,
  nowISO,
  ensurePaymentsTable,
} from "~/db/postgres";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Payment {
  id: string;
  requestId: string;
  clientId: string;
  amount: string;
  method: "airtel_money" | "mtn_money" | "cash";
  status: "pending" | "confirmed" | "completed";
  reference: string;
  phoneNumber: string;
  createdAt: string;
}

export interface CreatePaymentInput {
  requestId: string;
  amount: string;
  method: "airtel_money" | "mtn_money" | "cash";
  phoneNumber?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generatePaymentReference(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 4; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PRX-PAY-${result}`;
}

function rowToPayment(row: Record<string, unknown>): Payment {
  return {
    id: row.id as string,
    requestId: (row.request_id as string) || "",
    clientId: (row.client_id as string) || "",
    amount: row.amount as string,
    method: (row.method as Payment["method"]) || "cash",
    status: (row.status as Payment["status"]) || "pending",
    reference: row.reference as string,
    phoneNumber: (row.phone_number as string) || "",
    createdAt: row.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// Lazy table ensure (non-blocking)
// ---------------------------------------------------------------------------

let tableEnsured = false;

async function lazyEnsureTable(): Promise<void> {
  if (tableEnsured) return;
  try {
    await ensurePaymentsTable();
    tableEnsured = true;
  } catch (err) {
    console.error("[PAYMENTS] ⚠️ Failed to ensure payments table:", (err as Error).message);
  }
}

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

/**
 * Crée un paiement pour une demande d'intervention.
 */
export const createPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as CreatePaymentInput;
    if (!input.requestId) throw new Error("Identifiant de demande requis.");
    if (!input.amount) throw new Error("Montant requis.");
    if (!input.method) throw new Error("Méthode de paiement requise.");
    if (!["airtel_money", "mtn_money", "cash"].includes(input.method)) {
      throw new Error("Méthode de paiement invalide.");
    }
    // Mobile Money requires phone number
    if (input.method !== "cash" && (!input.phoneNumber || input.phoneNumber.trim().length < 8)) {
      throw new Error("Numéro de téléphone requis pour le paiement Mobile Money (min 8 chiffres).");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { requestId, amount, method, phoneNumber } = data;

    await lazyEnsureTable();

    // Check if request exists and get client info
    const request = await dbQuery<{ client_id: string; reference: string }>(
      "SELECT client_id, reference FROM service_requests WHERE id = $1",
      requestId
    );
    if (!request) throw new Error("Demande introuvable.");

    // Check for existing payment on this request
    const existing = await dbQuery<{ id: string }>(
      "SELECT id FROM payments WHERE request_id = $1 AND status != 'completed'",
      requestId
    );
    if (existing) throw new Error("Un paiement est déjà en cours pour cette demande.");

    const paymentId = generateUUID();
    const reference = generatePaymentReference();
    const now = nowISO();

    await dbRun(
      `INSERT INTO payments (id, request_id, client_id, amount, method, status, reference, phone_number, created_at)
       VALUES ($1, $2, $3, $4, $5, 'pending', $6, $7, $8)`,
      paymentId,
      requestId,
      request.client_id,
      amount,
      method,
      reference,
      (phoneNumber || "").trim(),
      now
    );

    console.log(`[PAYMENTS] ✅ Paiement créé: ${reference} — ${amount} FCFA (${method})`);

    const payment = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM payments WHERE id = $1",
      paymentId
    );

    return { success: true, payment: payment ? rowToPayment(payment) : null };
  });

/**
 * Récupère un paiement par son ID.
 */
export const getPayment = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { paymentId: string };
    if (!input.paymentId) throw new Error("Identifiant de paiement requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { paymentId } = data;

    await lazyEnsureTable();

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM payments WHERE id = $1",
      paymentId
    );

    if (!row) throw new Error("Paiement introuvable.");

    return { payment: rowToPayment(row) };
  });

/**
 * Récupère un paiement par référence.
 */
export const getPaymentByRef = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { reference: string };
    if (!input.reference) throw new Error("Référence de paiement requise.");
    return input;
  })
  .handler(async ({ data }) => {
    const { reference } = data;

    await lazyEnsureTable();

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM payments WHERE reference = $1",
      reference
    );

    if (!row) throw new Error("Paiement introuvable.");

    return { payment: rowToPayment(row) };
  });

/**
 * Confirme un paiement (passe le statut de 'pending' à 'confirmed').
 * Le client clique "J'ai payé" → le statut devient 'confirmed'.
 * L'admin peut ensuite valider définitivement → 'completed'.
 */
export const confirmPayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { paymentId: string };
    if (!input.paymentId) throw new Error("Identifiant de paiement requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { paymentId } = data;

    await lazyEnsureTable();

    const payment = await dbQuery<{ status: string }>(
      "SELECT status FROM payments WHERE id = $1",
      paymentId
    );

    if (!payment) throw new Error("Paiement introuvable.");
    if (payment.status !== "pending") {
      throw new Error(`Ce paiement est déjà ${payment.status === "confirmed" ? "confirmé" : "finalisé"}.`);
    }

    await dbRun(
      "UPDATE payments SET status = 'confirmed' WHERE id = $1",
      paymentId
    );

    console.log(`[PAYMENTS] ✅ Paiement confirmé par le client: ${paymentId}`);

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM payments WHERE id = $1",
      paymentId
    );

    return { success: true, payment: row ? rowToPayment(row) : null };
  });

/**
 * Admin: marque un paiement comme complété (validation finale).
 */
export const completePayment = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { paymentId: string };
    if (!input.paymentId) throw new Error("Identifiant de paiement requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { paymentId } = data;

    await lazyEnsureTable();

    const payment = await dbQuery<{ status: string }>(
      "SELECT status FROM payments WHERE id = $1",
      paymentId
    );

    if (!payment) throw new Error("Paiement introuvable.");
    if (payment.status !== "confirmed") {
      throw new Error("Seuls les paiements confirmés par le client peuvent être finalisés.");
    }

    await dbRun(
      "UPDATE payments SET status = 'completed' WHERE id = $1",
      paymentId
    );

    console.log(`[PAYMENTS] 🏁 Paiement finalisé par admin: ${paymentId}`);

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM payments WHERE id = $1",
      paymentId
    );

    return { success: true, payment: row ? rowToPayment(row) : null };
  });

/**
 * Admin: récupère tous les paiements en attente.
 */
export const getPendingPayments = createServerFn({ method: "GET" }).handler(async () => {
  await lazyEnsureTable();

  const rows = await dbAll<Record<string, unknown>>(
    "SELECT * FROM payments WHERE status IN ('pending', 'confirmed') ORDER BY created_at DESC"
  );

  return { payments: rows.map(rowToPayment) };
});

/**
 * Récupère le paiement lié à une demande.
 */
export const getPaymentByRequest = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { requestId: string };
    if (!input.requestId) throw new Error("Identifiant de demande requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { requestId } = data;

    await lazyEnsureTable();

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM payments WHERE request_id = $1 ORDER BY created_at DESC LIMIT 1",
      requestId
    );

    return { payment: row ? rowToPayment(row) : null };
  });
