import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Home, Search, Clock, LogIn, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { loadSession } from "~/lib/session";

export const Route = createFileRoute("/client")({
  component: ClientLayout,
});

// Routes that don't require authentication
const publicRoutes = ["/client/login", "/client/register", "/client/verify-otp"];

function ClientLayout() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const session = loadSession();
    const currentPath = window.location.pathname;
    const isPublic = publicRoutes.includes(currentPath);

    if (!session && !isPublic) {
      // Redirect to login for protected routes with return URL
      const redirect = encodeURIComponent(currentPath + window.location.search);
      window.location.href = "/client/login?redirect=" + redirect;
      return;
    }
    setIsAuth(!!session);
  }, []);

  // Loading state while checking auth
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

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Sub-nav */}
      <nav className="border-b bg-muted/30">
        <div className="max-w-6xl mx-auto flex items-center gap-1 px-6 h-10">
          {isAuth ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client">
                  <Home className="h-4 w-4 mr-1" />
                  Accueil
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client">
                  <Search className="h-4 w-4 mr-1" />
                  Rechercher
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client">
                  <Clock className="h-4 w-4 mr-1" />
                  Mes demandes
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client/login">
                  <LogIn className="h-4 w-4 mr-1" />
                  Connexion
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/client/register">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Inscription
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
