import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import {
  Home, Users, ClipboardList, LogOut, Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { loadSession, clearSession } from "~/lib/session";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

// Public routes that don't require auth
const publicRoutes = ["/admin/login"];

function AdminLayout() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const [adminName, setAdminName] = useState("");

  useEffect(() => {
    const session = loadSession();
    const currentPath = window.location.pathname;
    const isPublic = publicRoutes.includes(currentPath);

    if (!session || session.role !== "admin") {
      if (!isPublic) {
        window.location.href = "/admin/login";
        return;
      }
      setIsAuth(false);
      return;
    }

    setIsAuth(true);
    const stored = sessionStorage.getItem("kongofix_admin_name");
    if (stored) setAdminName(stored);
  }, []);

  function handleLogout() {
    clearSession();
    sessionStorage.removeItem("kongofix_admin_name");
    if (typeof window !== "undefined") {
      window.location.href = "/admin/login";
    }
  }

  // Loading state
  if (isAuth === null) {
    return (
      <div className="min-h-dvh flex flex-col">
        <nav className="border-b bg-muted/30">
          <div className="max-w-6xl mx-auto flex items-center gap-1 px-6 h-12" />
        </nav>
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Chargement...</div>
        </main>
      </div>
    );
  }

  // Public routes (login) — render without nav
  if (!isAuth) {
    return (
      <div className="min-h-dvh flex flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    );
  }

  // Authenticated layout
  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-background">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 h-12">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-semibold text-sm hidden sm:inline">KongoFix Admin</span>
          </div>

          {/* User */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {adminName || "Admin"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Sub-nav */}
      <nav className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto flex items-center gap-1 px-4 sm:px-6 h-10 overflow-x-auto">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <Home className="h-4 w-4 mr-1" />
              Tableau de bord
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/techniciens">
              <Users className="h-4 w-4 mr-1" />
              Techniciens
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <ClipboardList className="h-4 w-4 mr-1" />
              Demandes
            </Link>
          </Button>
        </div>
      </nav>

      {/* Page content */}
      <main className="flex-1 bg-muted/20">
        <Outlet />
      </main>
    </div>
  );
}
