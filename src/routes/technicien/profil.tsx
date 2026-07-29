import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  User, Camera, Upload, X, Image, MapPin, Clock,
  Star, Briefcase, CheckCircle, Shield, Save,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { categories } from "~/data/categories";
import {
  getTechnicianProfile,
  updateTechnicianProfile,
  type TechnicianProfile,
} from "~/server/technician";
import { loadSession } from "~/lib/session";

export const Route = createFileRoute("/technicien/profil")({
  component: TechnicianProfilPage,
});

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Disponible", color: "bg-green-500" },
  { value: "busy", label: "Occupé", color: "bg-yellow-500" },
  { value: "offline", label: "Hors ligne", color: "bg-gray-400" },
] as const;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function TechnicianProfilPage() {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [techId, setTechId] = useState("");

  useEffect(() => {
    const session = loadSession();
    if (session && session.role === "technicien") {
      setTechId(session.userId);
      loadProfile(session.userId);
    }
  }, []);

  async function loadProfile(id: string) {
    setLoading(true);
    try {
      const result = await getTechnicianProfile({ data: { technicianId: id } });
      setProfile(result.profile as TechnicianProfile);
    } catch (err: any) {
      setError(err.message || "Erreur de chargement du profil.");
    } finally {
      setLoading(false);
    }
  }

  function update<K extends keyof TechnicianProfile>(key: K, value: TechnicianProfile[K]) {
    setProfile((prev) => prev ? { ...prev, [key]: value } : prev);
    setSuccessMsg("");
  }

  function toggleSpecialty(slug: string) {
    setProfile((prev) => {
      if (!prev) return prev;
      const exists = prev.specialties.includes(slug);
      return {
        ...prev,
        specialties: exists
          ? prev.specialties.filter((s) => s !== slug)
          : [...prev.specialties, slug],
      };
    });
  }

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const result = await updateTechnicianProfile({
        data: { technicianId: techId, ...profile },
      });
      if (result.success) {
        setProfile(result.profile as TechnicianProfile);
        setSuccessMsg("Profil mis à jour avec succès !");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  }

  async function addPortfolioImage(file: File) {
    if (!profile || profile.portfolio.length >= 10) return;
    try {
      const b64 = await fileToBase64(file);
      update("portfolio", [...profile.portfolio, b64]);
    } catch { /* ignore */ }
  }

  function removePortfolioImage(index: number) {
    if (!profile) return;
    update("portfolio", profile.portfolio.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10 text-center">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Profil introuvable</h2>
        <p className="text-muted-foreground">
          {error || "Impossible de charger votre profil."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Badge variant="secondary" className="mb-2">Profil Technicien</Badge>
          <h1 className="text-2xl font-bold">Modifier mon profil</h1>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">{error}</div>
      )}
      {successMsg && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 mb-4">{successMsg}</div>
      )}

      {/* Status badges */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Badge variant={profile.status === "verified" ? "default" : "secondary"}>
          {profile.status === "verified" ? (
            <><CheckCircle className="h-3 w-3 mr-1" /> Vérifié</>
          ) : profile.status === "pending" ? (
            "En attente de vérification"
          ) : (
            "Rejeté"
          )}
        </Badge>
        <Badge variant="outline" className="gap-1">
          <Star className="h-3 w-3 text-yellow-500" />
          {profile.rating ? profile.rating.toFixed(1) : "—"} ({profile.reviewCount} avis)
        </Badge>
        <Badge variant="outline">
          <Briefcase className="h-3 w-3 mr-1" />
          {profile.totalInterventions} interventions
        </Badge>
      </div>

      {/* Photo & Availability */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* Photo */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative h-24 w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-muted-foreground/30">
                {profile.photoUrl ? (
                  <img src={profile.photoUrl} alt="Photo" className="h-full w-full object-cover" />
                ) : (
                  <Camera className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <label className="cursor-pointer text-xs text-primary hover:underline">
                <Upload className="h-3 w-3 inline mr-1" />
                Changer
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
            </div>

            {/* Availability */}
            <div className="flex-1 space-y-3">
              <div>
                <Label className="mb-2 block">Statut de disponibilité</Label>
                <div className="flex gap-2">
                  {AVAILABILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update("availability", opt.value as TechnicianProfile["availability"])}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        profile.availability === opt.value
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border hover:border-muted-foreground/30"
                      }`}
                    >
                      <span className={`h-2 w-2 rounded-full ${opt.color}`} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Horaires de travail</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={profile.workingHours?.start || "08:00"}
                    onChange={(e) =>
                      update("workingHours", { ...profile.workingHours, start: e.target.value })
                    }
                    className="w-32"
                  />
                  <span className="text-muted-foreground">à</span>
                  <Input
                    type="time"
                    value={profile.workingHours?.end || "18:00"}
                    onChange={(e) =>
                      update("workingHours", { ...profile.workingHours, end: e.target.value })
                    }
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Informations personnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                value={profile.fullName}
                onChange={(e) => update("fullName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">
                <MapPin className="h-3 w-3 inline mr-1" />
                Ville
              </Label>
              <Input
                id="city"
                value={profile.city}
                onChange={(e) => update("city", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Quartier</Label>
              <Input
                id="neighborhood"
                value={profile.neighborhood}
                onChange={(e) => update("neighborhood", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Informations professionnelles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="mb-2 block">Spécialités</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => {
                const checked = profile.specialties.includes(cat.slug);
                return (
                  <label
                    key={cat.slug}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm ${
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
              <Label htmlFor="yoe">Années d'expérience</Label>
              <Input
                id="yoe"
                type="number"
                min={0}
                max={50}
                value={profile.yearsExperience}
                onChange={(e) => update("yearsExperience", parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tariff">Tarif indicatif</Label>
              <Input
                id="tariff"
                value={profile.tariff}
                onChange={(e) => update("tariff", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Présentation</Label>
            <textarea
              id="desc"
              rows={3}
              value={profile.description}
              onChange={(e) => update("description", e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lang">Langues parlées</Label>
            <Input
              id="lang"
              value={profile.languages}
              onChange={(e) => update("languages", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Portfolio */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Portfolio ({profile.portfolio.length}/10)</CardTitle>
          <CardDescription>Ajoutez des photos de vos réalisations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-3">
            {profile.portfolio.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img}
                  alt={`Réalisation ${i + 1}`}
                  className="h-24 w-24 rounded-lg border object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePortfolioImage(i)}
                  className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          {profile.portfolio.length < 10 && (
            <label className="inline-flex items-center gap-2 text-sm text-primary hover:underline cursor-pointer">
              <Image className="h-4 w-4" />
              Ajouter une photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addPortfolioImage(file);
                }}
              />
            </label>
          )}
        </CardContent>
      </Card>

      {/* Certifications (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            <Shield className="h-4 w-4 inline mr-2" />
            Documents & Certifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label className="mb-1 block text-xs text-muted-foreground">
                Pièce d'identité (vérifiée par KongoFix)
              </Label>
              {profile.identityDoc ? (
                <img
                  src={profile.identityDoc}
                  alt="Pièce d'identité"
                  className="h-24 rounded-lg border object-cover"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Non fournie</p>
              )}
            </div>
            <div>
              <Label className="mb-1 block text-xs text-muted-foreground">
                Certifications ({profile.certifications.length})
              </Label>
              {profile.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, i) => (
                    <img
                      key={i}
                      src={cert}
                      alt={`Certification ${i + 1}`}
                      className="h-20 w-20 rounded-lg border object-cover"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Aucune certification</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
