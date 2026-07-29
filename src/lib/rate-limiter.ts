// ---------------------------------------------------------------------------
// Rate Limiter — Protection anti brute-force
//
// Stockage en mémoire (Map) avec expiration automatique.
// Par défaut : maximum 5 tentatives par identifiant (email) par minute.
//
// Utilisé sur les endpoints de connexion (login client, technicien, admin)
// pour prévenir les attaques par force brute.
// ---------------------------------------------------------------------------

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute

interface RateLimitEntry {
  attempts: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Nettoie les entrées expirées de la Map.
 * Appelé périodiquement pour éviter les fuites mémoire.
 */
function cleanExpired(): void {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > DEFAULT_WINDOW_MS) {
      store.delete(key);
    }
  }
}

// Nettoyage toutes les 60 secondes (côté serveur uniquement)
if (typeof setInterval !== "undefined") {
  setInterval(cleanExpired, 60_000);
}

/**
 * Vérifie si une requête est autorisée pour une clé donnée.
 *
 * @param key  - Identifiant (email, IP, etc.)
 * @param maxAttempts - Nombre max de tentatives (défaut: 5)
 * @param windowMs - Durée de la fenêtre en ms (défaut: 60000 = 1 min)
 *
 * @returns { allowed: boolean, retryAfterSeconds: number }
 *   - allowed: true si la requête peut continuer
 *   - retryAfterSeconds: secondes à attendre avant la prochaine tentative (0 si allowed)
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = DEFAULT_MAX_ATTEMPTS,
  windowMs: number = DEFAULT_WINDOW_MS,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const normalized = key.trim().toLowerCase();

  let entry = store.get(normalized);

  // Pas d'entrée ou fenêtre expirée → réinitialiser
  if (!entry || now - entry.windowStart > windowMs) {
    store.set(normalized, { attempts: 1, windowStart: now });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  // Dans la fenêtre → vérifier le compteur
  if (entry.attempts >= maxAttempts) {
    const elapsed = now - entry.windowStart;
    const retryAfterMs = windowMs - elapsed;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfterSeconds) };
  }

  // Incrémenter le compteur
  entry.attempts++;
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Incrémente le compteur de tentatives pour une clé donnée.
 * À appeler après un échec de connexion.
 */
export function recordFailedAttempt(key: string): void {
  const normalized = key.trim().toLowerCase();
  const now = Date.now();

  let entry = store.get(normalized);
  if (!entry || now - entry.windowStart > DEFAULT_WINDOW_MS) {
    store.set(normalized, { attempts: 1, windowStart: now });
  } else {
    entry.attempts++;
  }
}

/**
 * Réinitialise le compteur pour une clé donnée.
 * À appeler après un succès de connexion.
 */
export function resetRateLimit(key: string): void {
  const normalized = key.trim().toLowerCase();
  store.delete(normalized);
}
