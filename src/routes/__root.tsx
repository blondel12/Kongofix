import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { Menu, User, LogOut, LogIn, UserPlus } from "lucide-react";
import { type ReactNode, useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import appCss from "~/styles/app.css?url";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { loadSession, clearSession, type SessionData } from "~/lib/session";
import { logout } from "~/server/auth";
import { CookieConsent } from "~/components/CookieConsent";
import { ErrorBoundary } from "~/components/ErrorBoundary";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KongoFix — Services techniques à domicile en République du Congo" },
      { name: "description", content: "Trouvez rapidement un électricien, plombier, menuisier ou climatiseur qualifié au Congo. Intervention rapide, techniciens vérifiés, prix transparents." },
      { name: "theme-color", content: "#2563eb" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "KongoFix" },
      { property: "og:title", content: "KongoFix — Services techniques à domicile en République du Congo" },
      { property: "og:description", content: "Trouvez rapidement un électricien, plombier, menuisier ou climatiseur qualifié au Congo. Intervention rapide, techniciens vérifiés, prix transparents." },
      { property: "og:image", content: "/og-image.svg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "KongoFix — Services techniques à domicile en République du Congo" },
      { name: "twitter:description", content: "Trouvez rapidement un électricien, plombier, menuisier ou climatiseur qualifié au Congo." },
      { name: "twitter:image", content: "/og-image.svg" },
      { name: "google-site-verification", content: "A_METTRE_APRES_VERIFICATION" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/logo.svg",
      },
      { rel: "apple-touch-icon", href: "/logo.svg" },
    ],
    scripts: [
      {
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "KongoFix",
          "description": "Services techniques à domicile en République du Congo — plomberie, électricité, climatisation, menuiserie et plus encore.",
          "url": "https://kongofix.com",
          "logo": "https://kongofix.com/logo.svg",
          "image": "https://kongofix.com/og-image.svg",
          "telephone": "+242065431806",
          "areaServed": [
            { "@type": "Country", "name": "République du Congo" },
            { "@type": "City", "name": "Brazzaville" },
            { "@type": "City", "name": "Pointe-Noire" }
          ],
          "serviceType": [
            "Plomberie",
            "Électricité",
            "Climatisation",
            "Menuiserie",
            "Peinture",
            "Serrurerie",
            "Nettoyage",
            "Dépannage"
          ],
          "priceRange": "Variable",
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            "opens": "08:00",
            "closes": "18:00"
          },
          "sameAs": [],
          "knowsLanguage": "fr"
        }),
        type: "application/ld+json",
      },
      {
        children: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js').then(
                function(registration) { console.log('SW registered:', registration.scope); },
                function(err) { console.log('SW registration failed:', err); }
              );
            });
          }
        `,
      },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  const routerState = useRouterState();
  const isAdmin = routerState.location.pathname.startsWith("/admin");

  return (
    <RootDocument>
      <Header />
      <div className="flex flex-col min-h-dvh">
        <main id="main-content" className="flex-1" tabIndex={-1}>
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
        <FooterLegal />
      </div>
      {!isAdmin && <WhatsAppFloatingButton />}
      {!isAdmin && <CookieConsent />}
    </RootDocument>
  );
}

function FooterLegal() {
  return (
    <footer className="border-t bg-muted/30 px-6 py-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} KongoFix — Services techniques à domicile</p>
        <nav className="flex items-center gap-4">
          <Link to="/a-propos" className="hover:text-foreground transition-colors">
            À propos
          </Link>
          <Link to="/faq" className="hover:text-foreground transition-colors">
            FAQ
          </Link>
          <Link to="/charte-techniciens" className="hover:text-foreground transition-colors">
            Charte tech.
          </Link>
          <Link to="/cgu" className="hover:text-foreground transition-colors">
            CGU
          </Link>
          <Link to="/confidentialite" className="hover:text-foreground transition-colors">
            Confidentialité
          </Link>
          <Link to="/contact" className="hover:text-foreground transition-colors">
            Contact
          </Link>
        </nav>
      </div>
    </footer>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
        >
          Aller au contenu
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [userName, setUserName] = useState("");

  // Load session on mount
  useEffect(() => {
    const s = loadSession();
    setSession(s);
    // Try to get user name from session storage (set during login/register)
    if (s && typeof window !== "undefined") {
      const stored = sessionStorage.getItem("kongofix_username");
      if (stored) setUserName(stored);
    }
  }, []);

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // ignore
    }
    clearSession();
    setSession(null);
    setUserName("");
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  const navLinks = [
    { to: "/client", label: "Espace Client" },
    { to: "/technicien", label: "Espace Technicien" },
    { to: "/admin", label: "Administration" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          aria-label="Page d'accueil"
        >
          <img src="/logo.svg" alt="KongoFix" class="h-8" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Navigation principale">
          {navLinks.map((link) => (
            <Button key={link.to} variant="ghost" asChild>
              <Link to={link.to}>{link.label}</Link>
            </Button>
          ))}

          {/* Auth buttons or user menu */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-2 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium truncate">{userName || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground">
                    {session.role === "client" ? "Client" : session.role}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/client/account" className="cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    Mon compte
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild className="ml-2">
                <Link to="/client/login">
                  <LogIn className="h-4 w-4 mr-1" />
                  Connexion
                </Link>
              </Button>
              <Button size="sm" asChild className="ml-1">
                <Link to="/client/register">
                  <UserPlus className="h-4 w-4 mr-1" />
                  Inscription
                </Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader className="mb-6">
              <SheetTitle className="flex items-center gap-2">
                <img src="/logo.svg" alt="KongoFix" class="h-6" />
              </SheetTitle>
            </SheetHeader>

            {session && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-muted/40">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{userName || "Utilisateur"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {session.role === "client" ? "Client" : session.role}
                  </p>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Button
                  key={link.to}
                  variant="ghost"
                  className="justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to={link.to}>{link.label}</Link>
                </Button>
              ))}

              <div className="border-t my-2" />

              {session ? (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/client/account">
                      <User className="h-4 w-4 mr-2" />
                      Mon compte
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start text-destructive"
                    onClick={() => {
                      handleLogout();
                      setOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Déconnexion
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/client/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Connexion
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to="/client/register">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Inscription
                    </Link>
                  </Button>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}

function WhatsAppFloatingButton() {
  return (
    <a
      href="https://wa.me/242065431806?text=Bonjour%20KongoFix%20!"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 animate-bounce group"
      aria-label="Discutez avec nous sur WhatsApp"
      title="Discutez avec nous sur WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
        className="h-7 w-7 sm:h-8 sm:w-8"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
      {/* Tooltip */}
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:block">
        Discutez avec nous sur WhatsApp
      </span>
    </a>
  );
}
