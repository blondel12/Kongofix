import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  Upload,
  X,
  Image,
  Shield,
  Wrench,
  ChevronRight,
  Home,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { categories } from "~/data/categories";
import { mockTechnicians, type MockTechnician } from "~/data/mock-technicians";
import { submitRequest } from "~/server/requests";
import { loadSession, type SessionData } from "~/lib/session";

const demanderBreadcrumbJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://kongofix.com/" },
    { "@type": "ListItem", "position": 2, "name": "Trouver un technicien", "item": "https://kongofix.com/client" },
    { "@type": "ListItem", "position": 3, "name": "Demander une intervention", "item": "https://kongofix.com/client/demander" },
  ],
});

// ---------------------------------------------------------------------------
// Route definition
// ---------------------------------------------------------------------------

export const Route = createFileRoute("/client/demander")({
  head: () => ({
    meta: [
      { title: "Demander une intervention — KongoFix" },
      { name: "description", content: "Décrivez votre besoin, choisissez une date et recevez une mise en relation avec un technicien qualifié près de chez vous." },
      { property: "og:title", content: "Demander une intervention — KongoFix" },
      { property: "og:description", content: "Décrivez votre besoin, choisissez une date et recevez une mise en relation avec un technicien qualifié près de chez vous." },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [
      { children: demanderBreadcrumbJsonLd, type: "application/ld+json" },
    ],
  }),
  component: DemanderInterventionPage,
  validateSearch: (search: Record<string, string>) => ({
    technicien: search.technicien || "",
  }),
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PhotoPreview {
  file: File;
  url: string;
}

interface FormData {
  category: string;
  date: string;
  timeSlot: string;
  urgency: "normal" | "urgent";
  street: string;
  neighborhood: string;
  city: string;
  description: string;
  photos: PhotoPreview[];
  technicianId: string;
  acceptTerms: boolean;
}

const INITIAL_FORM: FormData = {
  category: "",
  date: "",
  timeSlot: "",
  urgency: "normal",
  street: "",
  neighborhood: "",
  city: "",
  description: "",
  photos: [],
  technicianId: "",
  acceptTerms: false,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const timeSlotLabels: Record<string, string> = {
  morning: "Matin (8h – 12h)",
  afternoon: "Après-midi (13h – 18h)",
};

// ---------------------------------------------------------------------------
// Step indicator
// ---------------------------------------------------------------------------

const STEPS = [
  { num: 1, label: "Service" },
  { num: 2, label: "Détails" },
  { num: 3, label: "Récapitulatif" },
  { num: 4, label: "Confirmation" },
];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-xl mx-auto">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full text-sm font-semibold transition-colors ${
                  currentStep > s.num
                    ? "bg-primary text-primary-foreground"
                    : currentStep === s.num
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`text-xs mt-1.5 hidden sm:block ${
                  currentStep >= s.num ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mt-[-12px] transition-colors ${
                  currentStep > s.num ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function DemanderInterventionPage() {
  const { technicien } = Route.useSearch();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requestRef, setRequestRef] = useState("");
  const [submittedRequestId, setSubmittedRequestId] = useState("");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<SessionData | null>(null);
  const [userName, setUserName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Auth check ──────────────────────────────────────────────────────────
  useEffect(() => {
    const s = loadSession();
    if (!s) {
      window.location.href = "/client/login?redirect=" + encodeURIComponent("/client/demander" + (technicien ? `?technicien=${technicien}` : ""));
      return;
    }
    setSession(s);
    const stored = sessionStorage.getItem("kongofix_username");
    if (stored) setUserName(stored);
    setLoading(false);
  }, [technicien]);

  // ── Pre-select technician category ──────────────────────────────────────
  const selectedTech: MockTechnician | null = technicien
    ? mockTechnicians.find((t) => t.id === technicien) ?? null
    : null;

  useEffect(() => {
    if (selectedTech && !formData.technicianId) {
      setFormData((prev) => ({
        ...prev,
        category: selectedTech.specialty,
        technicianId: selectedTech.id,
      }));
    }
  }, [selectedTech]);

  // ── Validation ──────────────────────────────────────────────────────────
  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!formData.category) errs.category = "Veuillez sélectionner un type de service.";
    }

    if (s === 2) {
      if (!formData.date) errs.date = "Veuillez choisir une date.";
      else if (new Date(formData.date + "T00:00:00") <= new Date(new Date().toISOString().split("T")[0] + "T00:00:00"))
        errs.date = "La date doit être dans le futur.";

      if (!formData.timeSlot) errs.timeSlot = "Veuillez choisir un créneau.";
      if (!formData.street || formData.street.trim().length < 3)
        errs.street = "Rue requise (min 3 caractères).";
      if (!formData.neighborhood || formData.neighborhood.trim().length < 2)
        errs.neighborhood = "Quartier requis.";
      if (!formData.city || formData.city.trim().length < 2)
        errs.city = "Ville requise.";
      if (!formData.description || formData.description.trim().length < 20)
        errs.description = "Description requise (min 20 caractères).";
    }

    if (s === 3) {
      if (!formData.acceptTerms) errs.acceptTerms = "Vous devez accepter les conditions.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error for field
    if (errors[key]) setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
  }

  // ── Photo handling ──────────────────────────────────────────────────────
  function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - formData.photos.length;
    const toAdd = files.slice(0, remaining);

    const previews: PhotoPreview[] = toAdd.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
    }));

    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos, ...previews],
    }));

    // Reset input so the same file can be re-added
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removePhoto(idx: number) {
    setFormData((prev) => {
      const updated = [...prev.photos];
      URL.revokeObjectURL(updated[idx].url);
      updated.splice(idx, 1);
      return { ...prev, photos: updated };
    });
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateStep(3)) return;
    if (!session) return;

    setSubmitting(true);
    try {
      const result = await submitRequest({
        data: {
          category: formData.category,
          date: formData.date,
          timeSlot: formData.timeSlot,
          urgency: formData.urgency,
          street: formData.street,
          neighborhood: formData.neighborhood,
          city: formData.city,
          description: formData.description,
          technicianId: selectedTech?.id || null,
          clientId: session.userId,
          clientName: userName || "Client",
        },
      });

      if (result.success) {
        setRequestRef(result.reference);
        setSubmittedRequestId(result.requestId);
        setSubmitted(true);
        setStep(4);
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

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back link */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-3" asChild>
          <Link to="/client">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-2">
        <Badge variant="secondary" className="mb-2">Nouvelle demande</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold">Demander une intervention</h1>
        <p className="text-muted-foreground mt-1">
          Remplissez le formulaire pour être mis en relation avec un technicien qualifié.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={step} />

      {/* Steps */}
      <Card>
        {step === 1 && (
          <Step1Service
            formData={formData}
            updateField={updateField}
            selectedTech={selectedTech}
            error={errors.category}
          />
        )}
        {step === 2 && (
          <Step2Details
            formData={formData}
            updateField={updateField}
            errors={errors}
            fileInputRef={fileInputRef}
            handlePhotos={handlePhotos}
            removePhoto={removePhoto}
          />
        )}
        {step === 3 && (
          <Step3Summary
            formData={formData}
            selectedTech={selectedTech}
            updateField={updateField}
            errors={errors}
            submitting={submitting}
            onSubmit={handleSubmit}
            onPrev={prevStep}
          />
        )}
        {step === 4 && (
          <Step4Confirmation reference={requestRef} requestId={submittedRequestId} selectedTech={selectedTech} />
        )}

        {/* Navigation buttons for steps 1-2 */}
        {step < 3 && (
          <CardContent className="flex items-center justify-between pt-2 pb-6">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Précédent
                </Button>
              )}
            </div>
            <Button onClick={nextStep}>
              Suivant
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 — Type de service
// ---------------------------------------------------------------------------

function Step1Service({
  formData,
  updateField,
  selectedTech,
  error,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  selectedTech: MockTechnician | null;
  error?: string;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          Étape 1 — Type de service
        </CardTitle>
        <CardDescription>
          {selectedTech
            ? `Technicien sélectionné : ${selectedTech.fullName} — ${selectedTech.specialty}`
            : "Choisissez le type d'intervention dont vous avez besoin."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        {selectedTech && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-primary/5 border border-primary/10">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                {selectedTech.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{selectedTech.fullName}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{selectedTech.specialty}</span>
                <span>•</span>
                <span>{selectedTech.tariff}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto text-muted-foreground"
              onClick={() => {
                updateField("category", "");
                updateField("technicianId", "");
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Changer
            </Button>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive mb-3 flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const isSelected =
              formData.category === cat.name ||
              (selectedTech && selectedTech.specialty === cat.name && !formData.technicianId);
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  updateField("category", cat.name);
                  // If selecting a different category than the pre-selected tech, clear tech
                  if (selectedTech && cat.name !== selectedTech.specialty) {
                    updateField("technicianId", "");
                  } else if (selectedTech && cat.name === selectedTech.specialty) {
                    updateField("technicianId", selectedTech.id);
                  }
                }}
                className={`relative flex flex-col items-center gap-2 p-3 sm:p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-center leading-tight">
                  {cat.name}
                </span>
                <span className="text-xs text-muted-foreground">{cat.techCount} techniciens</span>
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 2 — Détails de l'intervention
// ---------------------------------------------------------------------------

function Step2Details({
  formData,
  updateField,
  errors,
  fileInputRef,
  handlePhotos,
  removePhoto,
}: {
  formData: FormData;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  errors: Record<string, string>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handlePhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removePhoto: (idx: number) => void;
}) {
  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Étape 2 — Détails de l'intervention
        </CardTitle>
        <CardDescription>Précisez quand, où et ce dont vous avez besoin.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pb-6">
        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date d'intervention *</Label>
            <Input
              id="date"
              type="date"
              min={getTomorrow()}
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              aria-required="true"
              aria-invalid={!!errors.date}
              aria-describedby={errors.date ? "err-date" : undefined}
            />
            {errors.date && (
              <p id="err-date" className="text-xs text-destructive flex items-center gap-1" role="alert">
                <AlertTriangle className="h-3 w-3" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Time slot */}
          <div className="space-y-1.5">
            <Label>Créneau horaire *</Label>
            <div className="flex gap-2">
              {["morning", "afternoon"].map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => updateField("timeSlot", slot)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border text-sm transition-all ${
                    formData.timeSlot === slot
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-input hover:border-primary/40"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  {slot === "morning" ? "8h–12h" : "13h–18h"}
                </button>
              ))}
            </div>
            {errors.timeSlot && (
              <p id="err-timeSlot" className="text-xs text-destructive flex items-center gap-1" role="alert">
                <AlertTriangle className="h-3 w-3" />
                {errors.timeSlot}
              </p>
            )}
          </div>
        </div>

        {/* Urgency */}
        <div className="space-y-1.5">
          <Label>Niveau d'urgence *</Label>
          <div className="flex gap-3">
            <label
              className={`flex-1 flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.urgency === "normal"
                  ? "border-primary bg-primary/5"
                  : "border-input hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value="normal"
                checked={formData.urgency === "normal"}
                onChange={() => updateField("urgency", "normal")}
                className="mt-0.5 accent-primary"
              />
              <div>
                <p className="text-sm font-medium">Normal</p>
                <p className="text-xs text-muted-foreground">
                  Intervention planifiée dans les meilleurs délais.
                </p>
              </div>
            </label>
            <label
              className={`flex-1 flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                formData.urgency === "urgent"
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-input hover:border-destructive/30"
              }`}
            >
              <input
                type="radio"
                name="urgency"
                value="urgent"
                checked={formData.urgency === "urgent"}
                onChange={() => updateField("urgency", "urgent")}
                className="mt-0.5 accent-destructive"
              />
              <div>
                <p className="text-sm font-medium flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  Urgent
                </p>
                <p className="text-xs text-muted-foreground">
                  Intervention prioritaire sous 24h.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Adresse complète *
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="Rue / Avenue"
                value={formData.street}
                onChange={(e) => updateField("street", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.street}
                aria-describedby={errors.street ? "err-street" : undefined}
              />
              {errors.street && (
                <p id="err-street" className="text-xs text-destructive mt-1" role="alert">{errors.street}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Quartier"
                value={formData.neighborhood}
                onChange={(e) => updateField("neighborhood", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.neighborhood}
                aria-describedby={errors.neighborhood ? "err-neighborhood" : undefined}
              />
              {errors.neighborhood && (
                <p id="err-neighborhood" className="text-xs text-destructive mt-1" role="alert">{errors.neighborhood}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <Input
                placeholder="Ville"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                aria-required="true"
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "err-city" : undefined}
              />
              {errors.city && (
                <p id="err-city" className="text-xs text-destructive mt-1" role="alert">{errors.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Description du problème *</Label>
          <Textarea
            id="description"
            placeholder="Décrivez votre problème en détail (minimum 20 caractères)..."
            rows={4}
            value={formData.description}
            onChange={(e) => updateField("description", e.target.value)}
            aria-required="true"
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "err-description" : undefined}
          />
          <div className="flex justify-between">
            {errors.description ? (
              <p id="err-description" className="text-xs text-destructive flex items-center gap-1" role="alert">
                <AlertTriangle className="h-3 w-3" />
                {errors.description}
              </p>
            ) : (
              <span />
            )}
            <span
              className={`text-xs ${
                formData.description.length >= 20
                  ? "text-green-600"
                  : "text-muted-foreground"
              }`}
            >
              {formData.description.length}/20 min
            </span>
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <Label className="flex items-center gap-1">
            <Image className="h-3.5 w-3.5" />
            Photos du problème{" "}
            <span className="text-muted-foreground font-normal">(optionnel, max 5)</span>
          </Label>

          {/* Previews */}
          {formData.photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.photos.map((p, i) => (
                <div key={i} className="relative group">
                  <img
                    src={p.url}
                    alt={`Photo ${i + 1}`}
                    className="h-20 w-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {formData.photos.length < 5 && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png"
                multiple
                onChange={handlePhotos}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-1" />
                Ajouter des photos
              </Button>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Formats acceptés : JPG, PNG. {formData.photos.length}/5 photos.
          </p>
        </div>
      </CardContent>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 3 — Récapitulatif
// ---------------------------------------------------------------------------

function Step3Summary({
  formData,
  selectedTech,
  updateField,
  errors,
  submitting,
  onSubmit,
  onPrev,
}: {
  formData: FormData;
  selectedTech: MockTechnician | null;
  updateField: <K extends keyof FormData>(k: K, v: FormData[K]) => void;
  errors: Record<string, string>;
  submitting: boolean;
  onSubmit: (e: FormEvent) => void;
  onPrev: () => void;
}) {
  const cat = categories.find((c) => c.name === formData.category);

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Étape 3 — Récapitulatif
        </CardTitle>
        <CardDescription>Vérifiez les informations avant d'envoyer votre demande.</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Summary card */}
          <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
            {/* Service */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Service</span>
              <span className="text-sm font-medium flex items-center gap-1.5">
                {cat && <span>{cat.icon}</span>}
                {formData.category || "Non spécifié"}
              </span>
            </div>

            <hr className="border-border" />

            {/* Date & Time */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Date</span>
              <span className="text-sm font-medium">{formatDate(formData.date) || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Créneau</span>
              <span className="text-sm font-medium">
                {timeSlotLabels[formData.timeSlot] || "—"}
              </span>
            </div>

            <hr className="border-border" />

            {/* Urgency */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Urgence</span>
              <Badge variant={formData.urgency === "urgent" ? "destructive" : "secondary"}>
                {formData.urgency === "urgent" ? "Urgent" : "Normal"}
              </Badge>
            </div>

            <hr className="border-border" />

            {/* Address */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground shrink-0 mr-3">Adresse</span>
              <span className="text-sm font-medium text-right">
                {formData.street || "—"}
                {formData.neighborhood ? `, ${formData.neighborhood}` : ""}
                {formData.city ? `, ${formData.city}` : ""}
              </span>
            </div>

            <hr className="border-border" />

            {/* Description */}
            <div className="flex items-start justify-between">
              <span className="text-sm text-muted-foreground shrink-0 mr-3">Description</span>
              <span className="text-sm text-right line-clamp-4">
                {formData.description || "—"}
              </span>
            </div>

            {formData.photos.length > 0 && (
              <>
                <hr className="border-border" />
                <div className="flex items-start justify-between">
                  <span className="text-sm text-muted-foreground shrink-0 mr-3">Photos</span>
                  <div className="flex gap-1 flex-wrap justify-end">
                    {formData.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p.url}
                        alt={`Photo ${i + 1}`}
                        className="h-12 w-12 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Technician */}
            {selectedTech && (
              <>
                <hr className="border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Technicien</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                        {selectedTech.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{selectedTech.fullName}</span>
                  </div>
                </div>
              </>
            )}

            {/* Estimate */}
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimation</span>
              <span className="text-sm font-semibold text-primary">
                {selectedTech ? selectedTech.tariff : "Devis gratuit"}
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => updateField("acceptTerms", e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <span className="text-sm text-muted-foreground">
                J'accepte les{" "}
                <Link to="/" className="text-primary hover:underline">
                  conditions d'utilisation
                </Link>{" "}
                de KongoFix.
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.acceptTerms}
              </p>
            )}
          </div>

          {/* Submit error */}
          {errors.submit && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.submit}
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button type="button" variant="outline" onClick={onPrev}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                "Envoi en cours..."
              ) : (
                <>
                  Envoyer la demande
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — Confirmation
// ---------------------------------------------------------------------------

function Step4Confirmation({
  reference,
  requestId,
  selectedTech,
}: {
  reference: string;
  requestId: string;
  selectedTech: MockTechnician | null;
}) {
  return (
    <>
      <CardContent className="pt-8 pb-8 text-center">
        {/* Success animation */}
        <div className="mb-6">
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100"
            style={{ animation: "bounce-once 0.5s ease-out" }}
          >
            <Check className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h2 className="text-xl font-bold mb-2">Demande envoyée avec succès !</h2>
        <p className="text-muted-foreground mb-6">
          Votre demande a bien été enregistrée. Voici votre numéro de référence :
        </p>

        {/* Reference number */}
        <div className="inline-flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-5 py-3 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold text-primary tracking-wider">{reference}</span>
        </div>

        {/* What happens next */}
        <Card className="bg-muted/30 border-dashed mb-6 text-left">
          <CardContent className="pt-4 pb-4 space-y-2">
            <p className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Ce qui va se passer :
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                {selectedTech
                  ? `${selectedTech.fullName} examinera votre demande et vous contactera sous 24h.`
                  : "Un technicien qualifié examinera votre demande et vous contactera sous 24h."}
              </li>
              <li>Vous recevrez une confirmation par téléphone.</li>
              <li>Le technicien confirmera la date et l'heure avec vous.</li>
              <li>Vous pourrez suivre l'avancement depuis votre espace client.</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2">
            <Link to="/client/suivi/$requestId" params={{ requestId }}>
              <Eye className="h-4 w-4" />
              Suivre ma demande
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/client/account">
              <FileText className="h-4 w-4" />
              Mes demandes
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">
              <Home className="h-4 w-4" />
              Retour à l'accueil
            </Link>
          </Button>
        </div>
      </CardContent>
    </>
  );
}
