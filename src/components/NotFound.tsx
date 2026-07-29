import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted/60">
        <span className="text-5xl">🔍</span>
      </div>

      {/* Error code */}
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Erreur 404
      </p>

      {/* Logo + Title */}
      <div className="mb-3 flex items-center gap-2">
        <img src="/logo.svg" alt="KongoFix" className="h-8" width="32" height="32" loading="lazy" decoding="async" />
      </div>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Page introuvable
      </h1>

      {/* Message */}
      <p className="mb-8 max-w-md text-base text-muted-foreground leading-relaxed">
        Désolé, la page que vous cherchez n'existe pas ou a été déplacée.
        Vérifiez l'URL ou retournez à l'accueil.
      </p>

      {/* CTA */}
      <Button asChild size="lg" className="gap-2">
        <Link to="/">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>
      </Button>
    </div>
  );
}
