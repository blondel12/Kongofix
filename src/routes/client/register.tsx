import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench, Eye, EyeOff } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { registerUser } from "~/server/auth";

export const Route = createFileRoute("/client/register")({
  head: () => ({
    meta: [
      { title: "Créer un compte — KongoFix" },
      { property: "og:title", content: "Créer un compte — KongoFix" },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientRegisterPage,
});

function ClientRegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) errors.fullName = "Le nom complet est requis.";
    if (!phone.trim()) {
      errors.phone = "Le téléphone est requis.";
    } else if (!/^\+?\d{9,15}$/.test(phone.replace(/\s/g, ""))) {
      errors.phone = "Format de téléphone invalide.";
    }
    if (!email.trim()) {
      errors.email = "L'email est requis.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Adresse email invalide.";
    }
    if (!password) {
      errors.password = "Le mot de passe est requis.";
    } else if (password.length < 6) {
      errors.password = "Minimum 6 caractères.";
    }
    if (!confirmPassword) {
      errors.confirmPassword = "Veuillez confirmer le mot de passe.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    try {
      const result = await registerUser({
        data: { fullName: fullName.trim(), phone: phone.trim(), email: email.trim(), password },
      });
      if (result.success) {
        // Store userId temporarily for OTP verification page
        sessionStorage.setItem("pendingVerification", result.userId);
        sessionStorage.setItem("pendingPhone", result.phone || phone);
        navigate({ to: "/client/verify-otp" });
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez KongoFix et trouvez des techniciens qualifiés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {error && (
              <div id="register-error" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">Nom complet</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jean Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={loading}
                aria-required="true"
                aria-invalid={!!fieldErrors.fullName}
                aria-describedby={fieldErrors.fullName ? "err-fullName" : undefined}
              />
              {fieldErrors.fullName && (
                <p id="err-fullName" className="text-xs text-destructive" role="alert">{fieldErrors.fullName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+242 06 123 45 67"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                aria-required="true"
                aria-invalid={!!fieldErrors.phone}
                aria-describedby={fieldErrors.phone ? "err-phone" : undefined}
              />
              {fieldErrors.phone && (
                <p id="err-phone" className="text-xs text-destructive" role="alert">{fieldErrors.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="vous@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                aria-required="true"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "err-email" : undefined}
              />
              {fieldErrors.email && (
                <p id="err-email" className="text-xs text-destructive" role="alert">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  className="pr-10"
                  aria-required="true"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "err-password" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-destructive">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
                aria-required="true"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "err-confirmPassword" : undefined}
              />
              {fieldErrors.confirmPassword && (
                <p id="err-confirmPassword" className="text-xs text-destructive" role="alert">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Création en cours..." : "Créer mon compte"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center text-sm">
          <p className="text-muted-foreground">
            Déjà un compte ?{" "}
            <Link to="/client/login" className="font-medium text-primary hover:underline">
              Se connecter
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
