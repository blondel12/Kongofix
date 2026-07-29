/**
 * KongoFix — Module d'envoi d'emails
 *
 * Centralise l'envoi d'emails. Deux modes :
 * - Mode console (fallback) : log les emails dans la console serveur
 * - Mode API (si EMAIL_API_URL est configuré) : envoie via fetch
 *
 * Les emails sont envoyés de manière asynchrone (fire-and-forget)
 * pour ne jamais bloquer la réponse au client.
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const EMAIL_API_URL = process.env.EMAIL_API_URL || "";
const EMAIL_API_KEY = process.env.EMAIL_API_KEY || "";
const FROM_EMAIL = "noreply@kongofix.com";
const FROM_NAME = "KongoFix";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

// ---------------------------------------------------------------------------
// Envoi API
// ---------------------------------------------------------------------------

async function sendViaApi(payload: EmailPayload): Promise<boolean> {
  try {
    const response = await fetch(EMAIL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${EMAIL_API_KEY}`,
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error(`[EMAIL] ❌ API error ${response.status}: ${body.slice(0, 200)}`);
      return false;
    }

    console.log(`[EMAIL] ✅ Envoyé via API → ${payload.to} : "${payload.subject}"`);
    return true;
  } catch (err) {
    console.error(`[EMAIL] ❌ API fetch error: ${(err as Error).message}`);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Envoi console (fallback)
// ---------------------------------------------------------------------------

function sendViaConsole(payload: EmailPayload): boolean {
  const divider = "═".repeat(60);
  console.log(`\n${divider}`);
  console.log(`[EMAIL] 📧 Envoi d'email (mode console)`);
  console.log(`[EMAIL]    To:      ${payload.to}`);
  console.log(`[EMAIL]    Subject: ${payload.subject}`);
  console.log(`[EMAIL]    HTML:    ${payload.html.length} caractères`);
  console.log(`${divider}\n`);
  return true;
}

// ---------------------------------------------------------------------------
// Fonction publique
// ---------------------------------------------------------------------------

/**
 * Envoie un email.
 *
 * - Si EMAIL_API_URL est configuré : envoie via l'API HTTP
 * - Sinon : log dans la console (mode développement)
 *
 * L'envoi est asynchrone (fire-and-forget) — on ne bloque jamais
 * la réponse pour attendre l'email.
 *
 * @returns Promise<boolean> — true si l'email a été envoyé/loggé
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const payload: EmailPayload = { to, subject, html };

  // Validation minimale
  if (!to || !to.includes("@")) {
    console.error(`[EMAIL] ❌ Adresse email invalide: "${to}"`);
    return false;
  }

  // Mode API si configuré, sinon mode console
  if (EMAIL_API_URL) {
    return sendViaApi(payload);
  }

  return sendViaConsole(payload);
}

/**
 * Envoie un email de manière asynchrone (fire-and-forget).
 * À utiliser depuis les handlers de server functions pour ne pas
 * bloquer la réponse HTTP.
 */
export function sendEmailAsync(to: string, subject: string, html: string): void {
  sendEmail(to, subject, html).catch((err) => {
    console.error(`[EMAIL] ❌ Erreur asynchrone: ${(err as Error).message}`);
  });
}
