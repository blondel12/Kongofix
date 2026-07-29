// ---------------------------------------------------------------------------
// Session management
// Stores session data client-side (localStorage) for the mock phase.
// Will be replaced with HTTP-only cookie + server-side sessions when DB is ready.
// ---------------------------------------------------------------------------

const SESSION_KEY = "kongofix_session";

export interface SessionData {
  userId: string;
  role: "client" | "technicien" | "admin";
  createdAt: number;
}

export function saveSession(userId: string, role: SessionData["role"]): void {
  const session: SessionData = { userId, role, createdAt: Date.now() };
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

export function loadSession(): SessionData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as SessionData;
    if (!session.userId || !session.role || !session.createdAt) return null;
    // Sessions expire after 7 days
    if (Date.now() - session.createdAt > 7 * 24 * 60 * 60 * 1000) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function isAuthenticated(): boolean {
  return loadSession() !== null;
}

export function getUserRole(): SessionData["role"] | null {
  return loadSession()?.role ?? null;
}
