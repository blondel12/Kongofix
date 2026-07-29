import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Wrench, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { verifyOTP, resendOTP } from "~/server/auth";
import { saveSession } from "~/lib/session";

export const Route = createFileRoute("/client/verify-otp")({
  component: ClientVerifyOTPPage,
});

function ClientVerifyOTPPage() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null]);

  const userId =
    typeof window !== "undefined" ? sessionStorage.getItem("pendingVerification") : null;
  const phone =
    typeof window !== "undefined" ? sessionStorage.getItem("pendingPhone") || "votre téléphone" : "votre téléphone";

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Redirect if no userId in sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined" && !userId) {
      navigate({ to: "/client/register" });
    }
  }, [userId, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  function handleDigitChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setError("");

    // Auto-advance to next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newDigits = [...digits];
    for (let i = 0; i < Math.min(pasted.length, 4); i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);
    // Focus last filled or next empty
    const focusIndex = Math.min(pasted.length, 3);
    inputRefs.current[focusIndex]?.focus();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const code = digits.join("");
    if (code.length !== 4) {
      setError("Veuillez saisir les 4 chiffres du code.");
      return;
    }

    if (!userId) {
      setError("Session expirée. Veuillez vous réinscrire.");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOTP({ data: { userId, code } });
      if (result.success) {
        sessionStorage.removeItem("pendingVerification");
        sessionStorage.removeItem("pendingPhone");
        if (result.user) {
          saveSession(result.user.id, result.user.role);
        }
        navigate({ to: "/client" });
      }
    } catch (err: any) {
      setError(err.message || "Code incorrect.");
      // Clear digits on error
      setDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!userId || resendCooldown > 0) return;

    setResending(true);
    try {
      await resendOTP({ data: { userId } });
      setResendCooldown(30);
      setError("");
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi du code.");
    } finally {
      setResending(false);
    }
  }

  if (!userId) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Vérification du compte</CardTitle>
          <CardDescription>
            Un code de vérification à 4 chiffres a été envoyé au{" "}
            <span className="font-medium text-foreground">{phone}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* OTP digits */}
            <div className="flex justify-center gap-3" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
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
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Vérification...
                </>
              ) : (
                "Vérifier"
              )}
            </Button>
          </form>

          {/* Resend */}
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              Vous n'avez pas reçu le code ?{" "}
              <button
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {resending
                  ? "Envoi..."
                  : resendCooldown > 0
                    ? `Renvoyer (${resendCooldown}s)`
                    : "Renvoyer le code"}
              </button>
            </p>
          </div>

          {/* Back to register */}
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                sessionStorage.removeItem("pendingVerification");
                sessionStorage.removeItem("pendingPhone");
                navigate({ to: "/client/register" });
              }}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" />
              Retour à l'inscription
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
