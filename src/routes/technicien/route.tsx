import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Home, ClipboardList, Star, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { loadSession, clearSession } from "~/lib/session";
import { logoutTechnician } from "~/server/technician";

export const Route = createFileRoute("/technicien")({
  component: TechnicienLayout,
});

// Public routes that don't require auth
const publicRoutes = ["/technicien/login", "/technicien/register"];

function TechnicienLayout() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [userName, setUserName] = useState("");
  const [availability, setAvailability] = useState<"available" | "busy" | "offline">("offline");

  useEffect(() => {
    const session = loadSession();
    const currentPath = window.location.pathname;
    const isPublic = publicRoutes.includes(currentPath);

    if (!session || session.role !== "technicien") {
      if (!isPublic) {
        window.location.href = "/technicien/login";
        return;
      }
      setIsAuth(false);
      return;
    }

    setIsAuth(true);
    const stored = sessionStorage.getItem("kongofix_username");
    if (stored) setUserName(stored);

    // Fetch availability from sessionStorage or default
    const savedAvailability = sessionStorage.getItem("kongofix_tech_availability");
    if (savedAvailability) {
      setAvailability(savedAvailability as any);
    }
  }, []);

  async function handleLogout() {
    try {
      await logoutTechnician();
    } catch { /* ignore */ }
    clearSession();
    sessionStorage.removeItem("kongofix_username");
    sessionStorage.removeItem("kongofix_tech_id");
    sessionStorage.removeItem("kongofix_tech_availability");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  if (isAuth === null) {
    return (
      <div className="min-h-dvh flex flex-col">
        <nav className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto flex items-center gap-1 px-6 h-10" />
        </nav>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </main>
      </div>
    );
  }

  // For public routes, render without sub-nav
  if (!isAuth) {
    return (
      <div className="min-h-dvh flex flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  const availabilityBadge = {
    available: { label: "Disponible", variant: "default" as const },
    busy: { label: "Occupé", variant: "secondary" as const },
    offline: { label: "Hors ligne", variant: "outline" as const },
  };

  const currentBadge = availabilityBadge[availability];

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Sub-nav */}
      <nav className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-1 px-6 h-10">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/technicien">
                <Home className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/technicien">
                <ClipboardList className="h-4 w-4 mr-1" />
                Demandes
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/technicien">
                <Star className="h-4 w-4 mr-1" />
                Avis
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/technicien/profil">
                <User className="h-4 w-4 mr-1" />
                Profil
              </Link>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={currentBadge.variant} className="text-xs gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${
                availability === "available" ? "bg-green-500" :
                availability === "busy" ? "bg-yellow-500" : "bg-gray-400"
              }`} />
              {currentBadge.label}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>
      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
