import { createServerFn } from "@tanstack/react-start";
import { pgRun as dbRun, pgQuery as dbQuery, pgAll as dbAll, generateUUID, nowISO } from "~/db/postgres";
import { sendEmailAsync } from "~/lib/email";
import { otpEmail, welcomeEmail } from "~/lib/email-templates";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RegisterInput {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface UpdateProfileInput {
  userId: string;
  fullName?: string;
  phone?: string;
  email?: string;
  address?: string;
  photoUrl?: string;
}

export interface UserData {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: "client" | "technicien" | "admin";
  verified: boolean;
  address?: string;
  photoUrl?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateOTP(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function userRowToData(row: Record<string, unknown>): UserData {
  return {
    id: row.id as string,
    fullName: row.full_name as string,
    phone: row.phone as string,
    email: row.email as string,
    role: row.role as "client" | "technicien" | "admin",
    verified: !!row.verified,
    address: (row.address as string) || undefined,
    photoUrl: (row.photo_url as string) || undefined,
    createdAt: row.created_at as string,
  };
}

// ---------------------------------------------------------------------------
// Server Functions
// ---------------------------------------------------------------------------

/**
 * Crée un compte client et génère un code OTP de vérification.
 */
export const registerUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as RegisterInput;
    if (!input.fullName || !input.phone || !input.email || !input.password) {
      throw new Error("Tous les champs sont requis.");
    }
    if (input.password.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error("Adresse email invalide.");
    }
    if (!/^\+?\d{9,15}$/.test(input.phone.replace(/\s/g, ""))) {
      throw new Error("Numéro de téléphone invalide.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { fullName, phone, email, password } = data;

    // Vérifie que l'email n'est pas déjà utilisé
    const existing = await dbQuery<{ id: string }>(
      "SELECT id FROM users WHERE email = $1",
      email
    );
    if (existing) {
      throw new Error("Un compte avec cet email existe déjà.");
    }

    const userId = generateUUID();
    const now = nowISO();
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await dbRun(
      `INSERT INTO users (id, full_name, phone, email, password_hash, role, verified, created_at)
       VALUES ($1, $2, $3, $4, $5, 'client', 0, $6)`,
      userId, fullName, phone, email, await Bun.password.hash(password), now
    );

    await dbRun(
      "INSERT INTO otps (user_id, code, expires_at) VALUES ($1, $2, $3)",
      userId, otpCode, expiresAt
    );

    console.log(`[AUTH] ✅ Utilisateur créé: ${userId} (${email})`);

    // Envoi de l'OTP par email
    const otpTemplate = otpEmail(otpCode);
    sendEmailAsync(email, otpTemplate.subject, otpTemplate.html);

    // Email de bienvenue
    const welcomeTemplate = welcomeEmail(fullName);
    sendEmailAsync(email, welcomeTemplate.subject, welcomeTemplate.html);

    return { success: true, userId, phone };
  });

/**
 * Connecte un utilisateur avec email et mot de passe.
 */
export const loginUser = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as LoginInput;
    if (!input.email || !input.password) {
      throw new Error("Email et mot de passe requis.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { email, password } = data;

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM users WHERE email = $1",
      email
    );

    if (!row) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    if (!(await Bun.password.verify(password, row.password_hash as string))) {
      throw new Error("Email ou mot de passe incorrect.");
    }

    if (!row.verified) {
      throw new Error(
        "Votre compte n'est pas encore vérifié. Veuillez vérifier votre téléphone."
      );
    }

    console.log(`[AUTH] 🔑 Connexion: ${row.id} (${email})`);

    return {
      success: true,
      user: userRowToData(row),
    };
  });

/**
 * Vérifie le code OTP et active le compte.
 */
export const verifyOTP = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { userId: string; code: string };
    if (!input.userId || !input.code) {
      throw new Error("Code requis.");
    }
    if (input.code.length !== 4 || !/^\d{4}$/.test(input.code)) {
      throw new Error("Le code doit contenir exactement 4 chiffres.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { userId, code } = data;

    const otpRow = await dbQuery<{ code: string; expires_at: string }>(
      "SELECT code, expires_at FROM otps WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
      userId
    );

    if (!otpRow) {
      throw new Error("Aucun code trouvé. Veuillez demander un nouveau code.");
    }

    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      await dbRun("DELETE FROM otps WHERE user_id = $1", userId);
      throw new Error("Le code a expiré. Veuillez demander un nouveau code.");
    }

    if (otpRow.code !== code) {
      throw new Error("Code incorrect.");
    }

    await dbRun("UPDATE users SET verified = 1 WHERE id = $1", userId);
    await dbRun("DELETE FROM otps WHERE user_id = $1", userId);

    const userRow = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM users WHERE id = $1",
      userId
    );

    console.log(`[AUTH] ✅ Compte vérifié: ${userId}`);

    return {
      success: true,
      user: userRow ? userRowToData(userRow) : null,
    };
  });

/**
 * Renvoie un nouveau code OTP.
 */
export const resendOTP = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { userId: string };
    if (!input.userId) {
      throw new Error("Identifiant utilisateur requis.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { userId } = data;

    const userRow = await dbQuery<{ phone: string; email: string }>(
      "SELECT phone, email FROM users WHERE id = $1",
      userId
    );
    if (!userRow) {
      throw new Error("Utilisateur introuvable.");
    }

    // Supprimer les anciens OTPs
    await dbRun("DELETE FROM otps WHERE user_id = $1", userId);

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await dbRun(
      "INSERT INTO otps (user_id, code, expires_at) VALUES ($1, $2, $3)",
      userId, otpCode, expiresAt
    );

    console.log(`[AUTH] 📱 Nouvel OTP généré pour: ${userId}`);

    // Envoi de l'OTP par email
    const otpTemplate = otpEmail(otpCode);
    sendEmailAsync(userRow.email, otpTemplate.subject, otpTemplate.html);

    return { success: true };
  });

/**
 * Récupère l'utilisateur par ID (utilisé après restauration de session).
 */
export const getCurrentUser = createServerFn({ method: "GET" })
  .validator((data: unknown) => {
    const input = data as { userId: string };
    if (!input.userId) {
      throw new Error("Identifiant utilisateur requis.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { userId } = data;

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM users WHERE id = $1",
      userId
    );

    if (!row) {
      return { user: null };
    }

    return { user: userRowToData(row) };
  });

/**
 * Met à jour le profil utilisateur.
 */
export const updateProfile = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as UpdateProfileInput;
    if (!input.userId) {
      throw new Error("Identifiant utilisateur requis.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { userId, ...updates } = data;

    const existing = await dbQuery<{ id: string }>(
      "SELECT id FROM users WHERE id = $1",
      userId
    );
    if (!existing) {
      throw new Error("Utilisateur introuvable.");
    }

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.fullName !== undefined) {
      fields.push(`full_name = $${fields.length + 1}`);
      values.push(updates.fullName);
    }
    if (updates.phone !== undefined) {
      fields.push(`phone = $${fields.length + 1}`);
      values.push(updates.phone);
    }
    if (updates.email !== undefined) {
      fields.push(`email = $${fields.length + 1}`);
      values.push(updates.email);
    }
    if (updates.address !== undefined) {
      fields.push(`address = $${fields.length + 1}`);
      values.push(updates.address);
    }
    if (updates.photoUrl !== undefined) {
      fields.push(`photo_url = $${fields.length + 1}`);
      values.push(updates.photoUrl);
    }

    if (fields.length > 0) {
      values.push(userId);
      await dbRun(
        `UPDATE users SET ${fields.join(", ")} WHERE id = $${values.length}`,
        ...values
      );
    }

    const row = await dbQuery<Record<string, unknown>>(
      "SELECT * FROM users WHERE id = $1",
      userId
    );

    console.log(`[AUTH] ✏️ Profil mis à jour: ${userId}`);

    return { success: true, user: row ? userRowToData(row) : null };
  });

/**
 * Déconnecte l'utilisateur.
 */
export const logout = createServerFn({ method: "POST" }).handler(async () => {
  console.log("[AUTH] 👋 Déconnexion");
  return { success: true };
});

/**
 * Étape 1 : Envoie un code OTP pour réinitialisation de mot de passe.
 * Cherche dans users et technicians.
 */
export const forgotPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { email: string };
    if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
      throw new Error("Adresse email invalide.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { email } = data;

    // Cherche dans users
    let user = await dbQuery<{ id: string; phone: string }>(
      "SELECT id, phone FROM users WHERE email = $1",
      email
    );

    // Si pas trouvé, cherche dans technicians
    if (!user) {
      user = await dbQuery<{ id: string; phone: string }>(
        "SELECT id, phone FROM technicians WHERE email = $1",
        email
      );
    }

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      console.log(`[AUTH] 🔑 Forgot password demandé pour email inexistant: ${email}`);
      return { success: true };
    }

    // Supprimer les anciens OTPs de password reset
    await dbRun("DELETE FROM password_resets WHERE email = $1", email);

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    await dbRun(
      "INSERT INTO password_resets (email, code, expires_at) VALUES ($1, $2, $3)",
      email, otpCode, expiresAt
    );

    console.log(`[AUTH] 📱 Forgot password OTP généré pour: ${email}`);

    // Envoi de l'OTP par email
    const otpTemplate = otpEmail(otpCode);
    sendEmailAsync(email, otpTemplate.subject, otpTemplate.html);

    return { success: true };
  });

/**
 * Étape 2 : Vérifie l'OTP et met à jour le mot de passe.
 * Cherche dans users et technicians.
 */
export const resetPassword = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = data as { email: string; code: string; newPassword: string };
    if (!input.email || !input.code || !input.newPassword) {
      throw new Error("Tous les champs sont requis.");
    }
    if (input.code.length !== 4 || !/^\d{4}$/.test(input.code)) {
      throw new Error("Le code doit contenir exactement 4 chiffres.");
    }
    if (input.newPassword.length < 6) {
      throw new Error("Le mot de passe doit contenir au moins 6 caractères.");
    }
    return input;
  })
  .handler(async ({ data }) => {
    const { email, code, newPassword } = data;

    // Vérifier l'OTP
    const resetRow = await dbQuery<{ code: string; expires_at: string }>(
      "SELECT code, expires_at FROM password_resets WHERE email = $1 ORDER BY id DESC LIMIT 1",
      email
    );

    if (!resetRow) {
      throw new Error("Aucun code trouvé. Veuillez demander un nouveau code.");
    }

    if (new Date(resetRow.expires_at).getTime() < Date.now()) {
      await dbRun("DELETE FROM password_resets WHERE email = $1", email);
      throw new Error("Le code a expiré. Veuillez demander un nouveau code.");
    }

    if (resetRow.code !== code) {
      throw new Error("Code incorrect.");
    }

    // Chercher et mettre à jour dans users ou technicians
    const userRow = await dbQuery<{ id: string }>(
      "SELECT id FROM users WHERE email = $1",
      email
    );

    if (userRow) {
      await dbRun("UPDATE users SET password_hash = $1 WHERE id = $2", await Bun.password.hash(newPassword), userRow.id);
      console.log(`[AUTH] 🔑 Mot de passe réinitialisé pour user: ${userRow.id}`);
    } else {
      const techRow = await dbQuery<{ id: string }>(
        "SELECT id FROM technicians WHERE email = $1",
        email
      );
      if (techRow) {
        await dbRun("UPDATE technicians SET password_hash = $1 WHERE id = $2", await Bun.password.hash(newPassword), techRow.id);
        console.log(`[AUTH] 🔑 Mot de passe réinitialisé pour technician: ${techRow.id}`);
      } else {
        throw new Error("Utilisateur introuvable.");
      }
    }

    // Nettoyer les OTPs
    await dbRun("DELETE FROM password_resets WHERE email = $1", email);

    return { success: true };
  });
