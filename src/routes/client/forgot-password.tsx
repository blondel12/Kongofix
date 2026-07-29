import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Wrench, ArrowLeft, Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { forgotPassword, resetPassword } from "~/server/auth";

export const Route = createFileRoute("/client/forgot-password")({
  component: ForgotPasswordPage,
});

type Step = "email" | "otp" | "reset" | "success";

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Step 1: Submit email
  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Veuillez saisir une adresse email valide.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ data: { email: email.trim() } });
      setStep("otp");
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  // Resend code
  async function handleResend() {
    if (resendCooldown > 0) return;
    setResending(true);
    try {
      await forgotPassword({ data: { email } });
      setResendCooldown(30);
      setError("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi.");
    } finally {
      setResending(false);
    }
  }
  const [resending, setResending] = useState(false);

  // OTP digit handling
  function handleDigitChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError("");
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 3) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newDigits = [...digits];
    for (let i = 0; i < Math.min(pasted.length, 4); i++) newDigits[i] = pasted[i];
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 3)]?.focus();
  }

  // Step 2: Verify OTP
  async function handleVerifyOTP(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = digits.join("");
    if (code.length !== 4) {
      setError("Veuillez saisir les 4 chiffres du code.");
      return;
    }
    // Just go to reset step — the actual verification happens when resetting
    setStep("reset");
  }

  // Step 3: Reset password
  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    const code = digits.join("");
    setLoading(true);
    try {
      await resetPassword({ data: { email, code, newPassword } });
      setStep("success");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réinitialisation.");
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
          <CardTitle className="text-xl">
            {step === "success" ? "Mot de passe réinitialisé" : "Mot de passe oublié"}
          </CardTitle>
          <CardDescription>
            {step === "email" && "Saisissez votre email pour recevoir un code de réinitialisation."}
            {step === "otp" && `Un code à 4 chiffres a été envoyé à ${email}`}
            {step === "reset" && "Choisissez un nouveau mot de passe."}
            {step === "success" && "Votre mot de passe a été modifié avec succès."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {/* Step: Email */}
          {step === "email" && (
            <form onSubmit={handleSendCode} className="space-y-4">
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Envoi...</> : "Envoyer le code"}
              </Button>
            </form>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="flex justify-center gap-3" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={loading}
                    className="h-14 w-14 rounded-lg border border-input bg-background text-center text-xl font-semibold shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                Vérifier le code
              </Button>
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || resendCooldown > 0}
                  className="text-sm font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
                >
                  {resending ? "Envoi..." : resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : "Renvoyer le code"}
                </button>
              </div>
            </form>
          )}

          {/* Step: Reset */}
          {step === "reset" && (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
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
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réinitialisation...</> : "Réinitialiser"}
              </Button>
            </form>
          )}

          {/* Step: Success */}
          {step === "success" && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-muted-foreground">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <Button className="w-full" asChild>
                <Link to="/client/login">Se connecter</Link>
              </Button>
            </div>
          )}

          {/* Back link (not on success) */}
          {step !== "success" && (
            <div className="mt-4 text-center">
              <Link
                to="/client/login"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3 w-3" />
                Retour à la connexion
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
