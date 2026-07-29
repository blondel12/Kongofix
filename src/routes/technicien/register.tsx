import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback } from "react";
import {
  Wrench, User, Briefcase, FileText, CheckCircle,
  Camera, Upload, X, ChevronLeft, ChevronRight, Image,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { categories } from "~/data/categories";
import { registerTechnician } from "~/server/technician";

export const Route = createFileRoute("/technicien/register")({
  head: () => ({
    meta: [
      { title: "Devenir technicien — KongoFix" },
      { name: "description", content: "Rejoignez KongoFix et développez votre clientèle. Inscrivez-vous comme technicien qualifié et recevez des demandes d'intervention." },
      { property: "og:title", content: "Devenir technicien — KongoFix" },
      { property: "og:description", content: "Rejoignez KongoFix et développez votre clientèle. Inscrivez-vous comme technicien qualifié et recevez des demandes d'intervention." },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TechnicianRegisterPage,
});

const YEARS_OPTIONS = [
  "< 1 an", "1 an", "2 ans", "3 ans", "4 ans", "5 ans",
  "6 ans", "7 ans", "8 ans", "9 ans", "10 ans",
  "11-15 ans", "16-20 ans", "21-25 ans", "26-30 ans", "> 30 ans",
];

const STEPS = [
  { label: "Infos personnelles", icon: User },
  { label: "Infos professionnelles", icon: Briefcase },
  { label: "Documents", icon: FileText },
  { label: "Confirmation", icon: CheckCircle },
];

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  photoUrl: string;
  city: string;
  neighborhood: string;
  specialties: string[];
  yearsExperience: number;
  description: string;
  tariff: string;
  languages: string;
  identityDoc: string;
  certifications: string[];
  portfolio: string[];
  acceptedTerms: boolean;
}

const INITIAL_DATA: FormData = {
  fullName: "", phone: "", email: "", password: "",
  photoUrl: "", city: "", neighborhood: "",
  specialties: [], yearsExperience: 0, description: "",
  tariff: "", languages: "",
  identityDoc: "", certifications: [], portfolio: [],
  acceptedTerms: false,
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function TechnicianRegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>({ ...INITIAL_DATA });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  function toggleSpecialty(slug: string) {
    setForm((prev) => {
      const exists = prev.specialties.includes(slug);
      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter((s) => s !== slug)
          : [...prev.specialties, slug],
      };
    });
  }

  function validateStep(s: number): string | null {
    switch (s) {
      case 0:
        if (!form.fullName || form.fullName.trim().length < 3) return "Le nom complet est requis (min 3 caractères).";
        if (!form.phone || form.phone.replace(/\s/g, "").length < 9) return "Numéro de téléphone invalide.";
        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Adresse email invalide.";
        if (!form.password || form.password.length < 6) return "Le mot de passe doit contenir au moins 6 caractères.";
        if (!form.city || form.city.trim().length < 2) return "La ville est requise.";
        if (!form.neighborhood || form.neighborhood.trim().length < 2) return "Le quartier est requis.";
        return null;
      case 1:
        if (form.specialties.length === 0) return "Veuillez sélectionner au moins une spécialité.";
        if (!form.yearsExperience) return "Veuillez indiquer vos années d'expérience.";
        if (!form.description || form.description.trim().length < 20) return "La description doit contenir au moins 20 caractères.";
        if (!form.tariff || form.tariff.trim().length < 2) return "Veuillez indiquer votre tarif indicatif.";
        return null;
      case 2:
        if (!form.identityDoc) return "La pièce d'identité est obligatoire.";
        if (!form.acceptedTerms) return "Vous devez accepter les conditions et la charte des techniciens.";
        return null;
      default:
        return null;
    }
  }

  function handleNext() {
    const err = validateStep(step);
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handlePrev() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleSubmit() {
    const err = validateStep(2);
    if (err) { setError(err); return; }
    setError("");
    setLoading(true);

    try {
      // Convert yearsExperience string to number
      const yearsStr = YEARS_OPTIONS[form.yearsExperience];
      const yearsNum = yearsStr.includes("<") ? 0
        : yearsStr.includes(">") ? 31
        : yearsStr.includes("-") ? parseInt(yearsStr.split("-")[0])
        : parseInt(yearsStr);

      const result = await registerTechnician({
        data: {
          ...form,
          yearsExperience: yearsNum,
        },
      });
      if (result.success) {
        setSuccess(true);
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  // ---------- Step renders ----------

  function Step1() {
    return (
      <div className="space-y-4">
        {/* Photo */}
        <div>
          <Label>Photo de profil</Label>
          <div className="mt-2 flex items-center gap-4">
            <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="Preview" className="h-full w-full object-cover"  loading="lazy" decoding="async" />
              ) : (
                <Camera className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <label className="cursor-pointer">
              <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                <Upload className="h-4 w-4" />
                {form.photoUrl ? "Changer la photo" : "Ajouter une photo"}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const b64 = await fileToBase64(file);
                      update("photoUrl", b64);
                    } catch { /* ignore */ }
                  }
                }}
              />
            </label>
            {form.photoUrl && (
              <button
                type="button"
                onClick={() => update("photoUrl", "")}
                className="text-xs text-destructive hover:underline"
              >
                Supprimer
              </button>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet *</Label>
            <Input
              id="fullName"
              placeholder="Ex: Jean Koumba"
              value={form.fullName}
              onChange={(e) => update("fullName", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              placeholder="+242 XX XXX XXXX"
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min 6 caractères"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">Ville *</Label>
            <Input
              id="city"
              placeholder="Ex: Brazzaville"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Quartier *</Label>
            <Input
              id="neighborhood"
              placeholder="Ex: Poto-Poto"
              value={form.neighborhood}
              onChange={(e) => update("neighborhood", e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  }

  function Step2() {
    return (
      <div className="space-y-4">
        {/* Specialties */}
        <div>
          <Label className="mb-2 block">Spécialités *</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categories.map((cat) => {
              const checked = form.specialties.includes(cat.slug);
              return (
                <label
                  key={cat.slug}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors text-sm ${
                    checked
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border hover:border-muted-foreground/30"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleSpecialty(cat.slug)}
                    className="sr-only"
                  />
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="experience">Années d'expérience *</Label>
            <select
              id="experience"
              value={form.yearsExperience}
              onChange={(e) => update("yearsExperience", parseInt(e.target.value))}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value={0}>Sélectionnez...</option>
              {YEARS_OPTIONS.map((y, i) => (
                <option key={y} value={i}>{y}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tariff">Tarif indicatif *</Label>
            <Input
              id="tariff"
              placeholder="Ex: 15 000 FCFA / intervention"
              value={form.tariff}
              onChange={(e) => update("tariff", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Présentation / Description *</Label>
          <textarea
            id="description"
            rows={3}
            placeholder="Décrivez votre expérience, vos compétences, votre approche du travail..."
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {form.description.length} / min 20 caractères
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="languages">Langues parlées</Label>
          <Input
            id="languages"
            placeholder="Ex: Français, Lingala, Anglais"
            value={form.languages}
            onChange={(e) => update("languages", e.target.value)}
          />
        </div>
      </div>
    );
  }

  function Step3() {
    const portfolioRef = useRef<HTMLInputElement>(null);
    const certRef = useRef<HTMLInputElement>(null);

    return (
      <div className="space-y-5">
        {/* Identity document */}
        <div>
          <Label className="mb-2 block">Pièce d'identité (obligatoire) *</Label>
          {form.identityDoc ? (
            <div className="relative inline-block">
              <img
                src={form.identityDoc}
                alt="Pièce d'identité"
                className="h-32 rounded-lg border object-cover"
               loading="lazy" decoding="async" />
              <button
                type="button"
                onClick={() => update("identityDoc", "")}
                className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <label className="flex items-center gap-3 p-4 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Cliquez pour scanner votre pièce d'identité (CNI, passeport)
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const b64 = await fileToBase64(file);
                      update("identityDoc", b64);
                    } catch { /* ignore */ }
                  }
                }}
              />
            </label>
          )}
        </div>

        {/* Certifications */}
        <div>
          <Label className="mb-2 block">Certifications / Diplômes (optionnel)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.certifications.map((cert, i) => (
              <div key={i} className="relative">
                <img
                  src={cert}
                  alt={`Certification ${i + 1}`}
                  className="h-20 w-20 rounded-lg border object-cover"
                 loading="lazy" decoding="async" />
                <button
                  type="button"
                  onClick={() => update("certifications", form.certifications.filter((_, j) => j !== i))}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
            <Upload className="h-4 w-4" />
            Ajouter un diplôme/certification
            <input
              ref={certRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  try {
                    const b64 = await fileToBase64(file);
                    update("certifications", [...form.certifications, b64]);
                  } catch { /* ignore */ }
                }
              }}
            />
          </label>
        </div>

        {/* Portfolio */}
        <div>
          <Label className="mb-2 block">Photos de réalisations (optionnel, max 10)</Label>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.portfolio.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img}
                  alt={`Réalisation ${i + 1}`}
                  className="h-20 w-20 rounded-lg border object-cover"
                 loading="lazy" decoding="async" />
                <button
                  type="button"
                  onClick={() => update("portfolio", form.portfolio.filter((_, j) => j !== i))}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {form.portfolio.length < 10 && (
            <label className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
              <Image className="h-4 w-4" />
              Ajouter une photo de réalisation
              <input
                ref={portfolioRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    try {
                      const b64 = await fileToBase64(file);
                      update("portfolio", [...form.portfolio, b64]);
                    } catch { /* ignore */ }
                  }
                }}
              />
            </label>
          )}
        </div>

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={(e) => update("acceptedTerms", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input accent-primary"
          />
          <span className="text-sm">
            J'accepte les{" "}
            <a href="/cgu" target="_blank" rel="noopener noreferrer" className="text-primary underline">conditions d'utilisation</a> et la{" "}
            <a href="/charte-techniciens" target="_blank" rel="noopener noreferrer" className="text-primary underline">charte des techniciens</a> KongoFix.
            Je certifie que les informations fournies sont exactes.
          </span>
        </label>
      </div>
    );
  }

  function Step4() {
    return (
      <div className="text-center py-6 space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2">
            Votre inscription a été soumise pour vérification
          </h3>
          <p className="text-muted-foreground">
            Notre équipe examine votre dossier. Vous recevrez une réponse sous 48h par email et SMS.
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-4 text-sm text-left space-y-2">
          <p><strong>Prochaines étapes :</strong></p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Vérification de vos documents d'identité</li>
            <li>Validation de vos certifications</li>
            <li>Activation de votre compte technicien</li>
            <li>Accès à votre tableau de bord</li>
          </ul>
        </div>
        <Button asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    );
  }

  // If already submitted successfully, show confirmation
  if (success) {
    return (
      <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6">
            <Step4 />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-start justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Inscription Technicien</CardTitle>
          <CardDescription>
            Rejoignez KongoFix et développez votre clientèle
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8 px-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <div key={s.label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                        isDone
                          ? "bg-primary border-primary text-primary-foreground"
                          : isActive
                          ? "border-primary text-primary"
                          : "border-muted-foreground/30 text-muted-foreground"
                      }`}
                    >
                      {isDone ? <CheckCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] leading-tight text-center max-w-[68px] hidden sm:block ${
                      isActive ? "text-primary font-medium" : isDone ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 sm:mx-3 mt-[-20px] ${
                      i < step ? "bg-primary" : "bg-muted-foreground/20"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Error banner */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {/* Step content */}
          <div className="min-h-[280px]">
            {step === 0 && <Step1 />}
            {step === 1 && <Step2 />}
            {step === 2 && <Step3 />}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={step === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>

            <span className="text-xs text-muted-foreground">
              Étape {step + 1} / {STEPS.length - 1}
            </span>

            {step < 2 ? (
              <Button onClick={handleNext}>
                Suivant
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Envoi en cours..." : "Soumettre mon inscription"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
