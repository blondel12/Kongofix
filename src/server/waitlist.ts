import { createServerFn } from "@tanstack/react-start";
import { pgRun, pgQuery, ensureWaitlistTable } from "~/db/postgres";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SubscribeInput {
  email: string;
}

export interface SubscribeResult {
  success: boolean;
  message: string;
}

// ---------------------------------------------------------------------------
// Server function: subscribeToWaitlist
// ---------------------------------------------------------------------------

export const subscribeToWaitlist = createServerFn({ method: "POST" })
  .validator((input: unknown): SubscribeInput => {
    const data = input as Record<string, unknown>;
    if (!data.email || typeof data.email !== "string") {
      throw new Error("Email requis");
    }

    const email = data.email.trim().toLowerCase();

    // Validation de base du format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format d'email invalide");
    }

    // Limiter la longueur
    if (email.length > 255) {
      throw new Error("Email trop long");
    }

    return { email };
  })
  .handler(async ({ data }): Promise<SubscribeResult> => {
    const { email } = data;

    console.log(`[Waitlist] 📧 Nouvelle inscription newsletter : ${email}`);

    try {
      // Créer la table waitlist si elle n'existe pas encore
      await ensureWaitlistTable();

      // Vérifier si l'email existe déjà
      const existing = await pgQuery<{ id: number }>(
        "SELECT id FROM waitlist WHERE email = $1",
        email
      );

      if (existing) {
        console.log(`[Waitlist] ℹ️  Email déjà inscrit : ${email}`);
        return {
          success: true,
          message: "Vous êtes déjà inscrit ! Vous recevrez nos actualités.",
        };
      }

      // Insérer dans la table waitlist
      await pgRun(
        "INSERT INTO waitlist (email, created_at) VALUES ($1, NOW())",
        email
      );

      console.log(`[Waitlist] ✅ Inscription réussie : ${email}`);
      return {
        success: true,
        message: "Merci ! Vous recevrez nos actualités.",
      };
    } catch (err) {
      // Gérer le cas où la table n'existe pas encore (fallback graceful)
      const errorMessage =
        err instanceof Error ? err.message : String(err);
      console.error(`[Waitlist] ❌ Erreur lors de l'inscription : ${errorMessage}`);

      if (errorMessage.includes("relation") && errorMessage.includes("does not exist")) {
        return {
          success: false,
          message: "Service d'inscription temporairement indisponible. Réessayez plus tard.",
        };
      }

      return {
        success: false,
        message: "Une erreur est survenue. Veuillez réessayer.",
      };
    }
  });
