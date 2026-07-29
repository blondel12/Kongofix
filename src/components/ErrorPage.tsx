import { Link } from "@tanstack/react-router";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { ErrorComponentProps } from "@tanstack/react-router";

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
        <span className="text-5xl">⚠️</span>
      </div>

      {/* Error code */}
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-destructive">
        Erreur 500
      </p>

      {/* Logo + Title */}
      <div className="mb-3 flex items-center gap-2">
        <img src="/logo.svg" alt="KongoFix" className="h-8" width="32" height="32" loading="lazy" decoding="async" />
      </div>
      <h1 className="mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
        Erreur serveur
      </h1>

      {/* Message */}
      <p className="mb-2 max-w-md text-base text-muted-foreground leading-relaxed">
        Une erreur inattendue s'est produite. Nos équipes ont été notifiées.
        Veuillez réessayer dans quelques instants.
      </p>

      {/* Show error detail in development */}
      {process.env.NODE_ENV !== "production" && error && (
        <details className="mb-6 max-w-lg text-left">
          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            Détails techniques
          </summary>
          <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground max-h-40">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>
        </details>
      )}

      {/* CTAs */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {reset && (
          <Button onClick={reset} variant="outline" size="lg" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Réessayer
          </Button>
        )}
        <Button asChild size="lg" className="gap-2">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  );
}
