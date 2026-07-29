import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import {
  AlertTriangle,
  Phone,
  MapPin,
  FileText,
  Check,
  Home,
  ArrowLeft,
  ChevronRight,
  Siren,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { submitRequest } from "~/server/requests";
import { loadSession, type SessionData } from "~/lib/session";

// ---------------------------------------------------------------------------
// Emergency types (simplified for urgency form)
// ---------------------------------------------------------------------------

const EMERGENCY_TYPES = [
  { value: "Électricité", label: "Électricité", icon: "⚡" },
  { value: "Plomberie", label: "Plomberie", icon: "🔧" },
  { value: "Climatisation", label: "Climatisation", icon: "❄️" },
  { value: "Serrurerie", label: "Serrurerie", icon: "🔐" },
  { value: "Autre", label: "Autre", icon: "🆘" },
];

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/client/urgence")({
  head: () => ({
    meta: [
      { title: "Urgence 24/24 — KongoFix" },
      { name: "description", content: "Besoin urgent d'un technicien ? Intervention rapide disponible 24h/24 et 7j/7 en République du Congo." },
      { property: "og:title", content: "Urgence 24/24 — KongoFix" },
      { property: "og:description", content: "Besoin urgent d'un technicien ? Intervention rapide disponible 24h/24 et 7j/7 en République du Congo." },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UrgencePage,
});

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function UrgencePage() {
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestRef, setRequestRef] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [userName, setUserName] = useState("");

  // ── Auth check ──────────────────────────────────────────────────────────
  useEffect(() => {
    const s = loadSession();
    if (!s) {
      window.location.href =
        "/client/login?redirect=" + encodeURIComponent("/client/urgence");
      return;
    }
    setSession(s);
    const stored = sessionStorage.getItem("kongofix_username");
    if (stored) setUserName(stored);
    setLoading(false);
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────
  function validate(): boolean {
    const errs: Record<string, string> = {};

    if (!category) errs.category = "Veuillez sélectionner un type d'urgence.";
    if (!phone || phone.trim().length < 8)
      errs.phone = "Veuillez renseigner un numéro de téléphone valide.";
    if (!address || address.trim().length < 5)
      errs.address = "Veuillez renseigner votre adresse (min 5 caractères).";
    if (!description || description.trim().length < 20)
      errs.description = "Veuillez décrire votre urgence (min 20 caractères).";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    if (!session) return;

    setSubmitting(true);
    try {
      const fullDescription = `[URGENCE] Tél: ${phone.trim()}. ${description.trim()}`;

      const result = await submitRequest({
        data: {
          category,
          date: getTomorrow(),
          timeSlot: "morning",
          urgency: "urgent",
          street: address.trim(),
          neighborhood: "—",
          city: "Brazzaville",
          description: fullDescription,
          technicianId: null,
          clientId: session.userId,
          clientName: userName || "Client",
        },
      });

      if (result.success) {
        setRequestRef(result.reference);
        setSubmittedRequestId(result.requestId);
        setSubmitted(true);
      }
    } catch (err: any) {
      setErrors({ submit: err.message || "Une erreur est survenue." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-[calc(100dvh-7rem)] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // ── Submitted state ─────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 text-center">
        <div className="mb-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Siren className="h-10 w-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-3">Demande d'urgence envoyée !</h1>
        <p className="text-muted-foreground mb-2">
          Un technicien vous contactera dans l'heure.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Référence : <span className="font-bold text-primary tracking-wider">{requestRef}</span>
        </p>

        <Card className="bg-muted/30 border-dashed mb-6 text-left">
          <CardContent className="pt-4 pb-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              Ce qui va se passer :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Un technicien qualifié examinera votre demande en priorité.</li>
              <li>Vous serez contacté par téléphone dans l'heure qui suit.</li>
              <li>Le technicien interviendra dès que possible à l'adresse indiquée.</li>
            </ul>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {submittedRequestId && (
            <Button asChild className="gap-2">
              <Link to="/client/suivi/$requestId" params={{ requestId: submittedRequestId }}>
                <FileText className="h-4 w-4" />
                Suivre ma demande
              </Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back link */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-3" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <Badge variant="destructive" className="mb-2 gap-1">
          <AlertTriangle className="h-3 w-3" />
          Urgence 24/24
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-bold">Demande d'intervention urgente</h1>
        <p className="text-muted-foreground mt-1">
          Remplissez ce formulaire. Un technicien vous contactera dans l'heure.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Siren className="h-5 w-5 text-destructive" />
            Formulaire d'urgence
          </CardTitle>
          <CardDescription>
            Tous les champs sont obligatoires.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Emergency type */}
            <div className="space-y-2">
              <Label>Type d'urgence *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EMERGENCY_TYPES.map((et) => (
                  <button
                    key={et.value}
                    type="button"
                    onClick={() => {
                      setCategory(et.value);
                      if (errors.category) setErrors((prev) => { const n = { ...prev }; delete n.category; return n; });
                    }}
                    className={`flex items-center gap-2 p-3 rounded-lg border-2 text-left text-sm transition-all ${
                      category === et.value
                        ? "border-destructive bg-destructive/5 shadow-sm"
                        : "border-border hover:border-destructive/40 hover:bg-muted/30"
                    }`}
                  >
                    <span className="text-lg">{et.icon}</span>
                    <span className="font-medium">{et.label}</span>
                  </button>
                ))}
              </div>
              {errors.category && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.category}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                Téléphone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Ex: +242 06 123 45 67"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => { const n = { ...prev }; delete n.phone; return n; });
                }}
              />
              {errors.phone && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <Label htmlFor="address" className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Adresse *
              </Label>
              <Input
                id="address"
                placeholder="Rue, quartier, ville"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((prev) => { const n = { ...prev }; delete n.address; return n; });
                }}
              />
              {errors.address && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {errors.address}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="desc" className="flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />
                Description brève *
              </Label>
              <Textarea
                id="desc"
                placeholder="Décrivez votre problème urgent (minimum 20 caractères)..."
                rows={4}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors((prev) => { const n = { ...prev }; delete n.description; return n; });
                }}
              />
              <div className="flex justify-between">
                {errors.description ? (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}
                <span
                  className={`text-xs ${
                    description.length >= 20 ? "text-green-600" : "text-muted-foreground"
                  }`}
                >
                  {description.length}/20 min
                </span>
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.submit}
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-700 text-white gap-2"
              size="lg"
            >
              {submitting ? (
                "Envoi en cours..."
              ) : (
                <>
                  <Siren className="h-5 w-5" />
                  Envoyer la demande d'urgence
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Un technicien vous contactera dans l'heure suivant votre demande.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
