import { createServerFn } from "@tanstack/react-start";
import { pgRun as dbRun, pgQuery as dbQuery, pgAll as dbAll, generateUUID, nowISO } from "~/db/postgres";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  senderRole: "client" | "technician";
  content: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function rowToMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    requestId: row.request_id as string,
    senderId: row.sender_id as string,
    senderRole: row.sender_role as "client" | "technician",
    content: row.content as string,
    createdAt: row.created_at as string,
  };
}

async function ensureMessagesTable(): Promise<void> {
  await dbRun(
    `CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      request_id TEXT REFERENCES service_requests(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL,
      sender_role TEXT NOT NULL CHECK (sender_role IN ('client', 'technician')),
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT ''
    )`
  );
  await dbRun(
    `CREATE INDEX IF NOT EXISTS idx_messages_request ON messages(request_id, created_at)`
  );
}

// Run on module load
ensureMessagesTable().catch((err) => {
  console.error("[MESSAGES] ⚠️ Could not ensure messages table:", err.message);
});

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

/**
 * Envoie un message dans une demande.
 */
export const sendMessage = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as {
      requestId: string;
      senderId: string;
      senderRole: "client" | "technician";
      content: string;
    };
    if (!input.requestId) throw new Error("Identifiant de la demande requis.");
    if (!input.senderId) throw new Error("Identifiant de l'expéditeur requis.");
    if (!input.senderRole || !["client", "technician"].includes(input.senderRole)) {
      throw new Error("Rôle invalide.");
    }
    if (!input.content || input.content.trim().length === 0) {
      throw new Error("Le message ne peut pas être vide.");
    }
    if (input.content.length > 2000) {
      throw new Error("Le message est trop long (max 2000 caractères).");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { requestId, senderId, senderRole, content } = data;

    await ensureMessagesTable();

    const msgId = generateUUID();
    const now = nowISO();

    await dbRun(
      `INSERT INTO messages (id, request_id, sender_id, sender_role, content, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      msgId, requestId, senderId, senderRole, content.trim(), now
    );

    console.log(`[MESSAGES] ✉️ Message envoyé: ${msgId} (${senderRole}) — demande ${requestId}`);

    const msg = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM messages WHERE id = $1",
      msgId
    );

    return { success: true, message: msg ? rowToMessage(msg) : null };
  });

/**
 * Récupère tous les messages d'une demande.
 */
export const getMessages = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { requestId: string };
    if (!input.requestId) throw new Error("Identifiant de la demande requis.");
    return input;
  })
  .handler(async ({ data }) => {
    const { requestId } = data;

    await ensureMessagesTable();

    const rows = await dbAll<Record<string, unknown>>(
      "SELECT * FROM messages WHERE request_id = $1 ORDER BY created_at ASC",
      requestId
    );

    return { messages: rows.map(rowToMessage) };
  });
