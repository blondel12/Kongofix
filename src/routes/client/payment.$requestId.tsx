import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  Clock,
  Shield,
  Smartphone,
  Banknote,
  CreditCard,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  createPayment,
  getPaymentByRequest,
  confirmPayment,
  type Payment,
} from "~/server/payments";
import { METHODS, KONGOFIX_NUMBERS, KONGOFIX_NAME } from "~/data/payment-config";
import { loadSession } from "~/lib/session";

export const Route = createFileRoute("/client/payment/$requestId")({
  component: PaymentPage,
});

// ── Status badge ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: {
      label: "En attente",
      className: "border-orange-300 text-orange-600 bg-orange-50",
    },
    confirmed: {
      label: "Confirmé",
      className: "border-blue-300 text-blue-600 bg-blue-50",
    },
    completed: {
      label: "Finalisé",
      className: "border-green-300 text-green-600 bg-green-50",
    },
  };
  const c = config[status] || { label: status, className: "" };

  return (
    <Badge variant="outline" className={`text-xs ${c.className}`}>
      {c.label}
    </Badge>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

type MethodKey = keyof typeof METHODS;

function PaymentPage() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();

  const [method, setMethod] = useState<MethodKey>("airtel_money");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("5000");
  const [existingPayment, setExistingPayment] = useState<Payment | null>(null);
  const [newPayment, setNewPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadExistingPayment();
  }, [requestId]);

  async function loadExistingPayment() {
    setLoading(true);
    try {
      const res = await getPaymentByRequest({ data: { requestId } });
      if (res.payment) {
        setExistingPayment(res.payment);
        setMethod(res.payment.method as MethodKey);
        setPhoneNumber(res.payment.phoneNumber || "");
        setAmount(res.payment.amount);
      }
    } catch (err: any) {
      console.error("Erreur chargement paiement:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePayment() {
    setError("");
    setActionLoading(true);
    try {
      const session = loadSession();
      if (!session) {
        setError("Vous devez être connecté.");
        setActionLoading(false);
        return;
      }

      const res = await createPayment({
        data: {
          requestId,
          amount,
          method,
          phoneNumber: method !== "cash" ? phoneNumber : undefined,
        },
      });

      if (res.payment) {
        setNewPayment(res.payment);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création du paiement.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirmPayment(paymentId: string) {
    setError("");
    setActionLoading(true);
    try {
      const res = await confirmPayment({ data: { paymentId } });
      if (res.payment) {
        setExistingPayment(res.payment);
        setNewPayment(res.payment);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la confirmation.");
    } finally {
      setActionLoading(false);
    }
  }

  function copyReference(ref: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(ref).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const activePayment = newPayment || existingPayment;
  const methodName = method === "airtel_money" ? "Airtel Money" : method === "mtn_money" ? "MTN Mobile Money" : "Espèces";
  const kongofixNumber = method === "airtel_money"
    ? KONGOFIX_NUMBERS.airtel_money
    : method === "mtn_money"
      ? KONGOFIX_NUMBERS.mtn_money
      : null;

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Breadcrumb */}
      <div>
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-3">
          <Link to="/client">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div>
        <Badge variant="secondary" className="mb-3">Paiement</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Paiement de l'intervention</h1>
        <p className="text-muted-foreground text-sm">
          Demande <span className="font-mono text-xs">{requestId}</span>
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Active payment state */}
      {activePayment ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                {activePayment.status === "completed" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : activePayment.status === "confirmed" ? (
                  <Clock className="h-5 w-5 text-blue-500" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-500" />
                )}
                Votre paiement
              </CardTitle>
              <StatusBadge status={activePayment.status} />
            </div>
            <CardDescription>
              {activePayment.status === "completed"
                ? "Paiement finalisé — merci !"
                : activePayment.status === "confirmed"
                  ? "Paiement confirmé — en attente de validation KongoFix"
                  : "En attente de votre paiement"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Reference */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Référence de paiement</p>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono tracking-wider">
                  {activePayment.reference}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => copyReference(activePayment.reference)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">Référence copiée !</p>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant</span>
                <span className="font-semibold">{activePayment.amount} FCFA</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Méthode</span>
                <span>{METHODS[activePayment.method]}</span>
              </div>
              {activePayment.phoneNumber && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Numéro</span>
                  <span>{activePayment.phoneNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span>
                  {new Date(activePayment.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>

            {/* Instructions (if not cash) */}
            {activePayment.method !== "cash" && activePayment.status === "pending" && kongofixNumber && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Instructions de paiement</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Ouvrez votre application {methodName}</li>
                  <li>
                    Envoyez <strong>{activePayment.amount} FCFA</strong> au numéro KongoFix :
                  </li>
                  <li className="font-bold mt-1">{kongofixNumber}</li>
                  <li>Nom du compte : <strong>{KONGOFIX_NAME}</strong></li>
                  <li>
                    Dans le motif, indiquez : <strong>{activePayment.reference}</strong>
                  </li>
                </ol>
              </div>
            )}

            {/* Action buttons */}
            {activePayment.status === "pending" && (
              <Button
                className="w-full"
                size="lg"
                disabled={actionLoading}
                onClick={() => handleConfirmPayment(activePayment.id)}
              >
                {actionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Check className="h-4 w-4 mr-2" />
                )}
                J'ai payé
              </Button>
            )}

            {activePayment.status === "completed" && (
              <Button className="w-full" variant="outline" asChild>
                <Link to="/client">Retour à l'accueil</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* New payment form */
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Effectuer un paiement</CardTitle>
            <CardDescription>
              Choisissez votre méthode de paiement pour cette intervention.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Amount */}
            <div>
              <Label htmlFor="amount">Montant (FCFA)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Ex: 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1.5"
              />
            </div>

            {/* Method selection */}
            <div>
              <Label className="mb-3 block">Méthode de paiement</Label>
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as MethodKey)}
                className="space-y-3"
              >
                {/* Airtel Money */}
                <label
                  htmlFor="airtel_money"
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    method === "airtel_money"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="airtel_money" id="airtel_money" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-red-500" />
                      <span className="font-medium">Airtel Money</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Paiement mobile via Airtel Money Congo
                    </p>
                  </div>
                </label>

                {/* MTN Money */}
                <label
                  htmlFor="mtn_money"
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    method === "mtn_money"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="mtn_money" id="mtn_money" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">MTN Mobile Money</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Paiement mobile via MTN Mobile Money Congo
                    </p>
                  </div>
                </label>

                {/* Cash */}
                <label
                  htmlFor="cash"
                  className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                    method === "cash"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="cash" id="cash" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Espèces</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Paiement en liquide après l'intervention
                    </p>
                  </div>
                </label>
              </RadioGroup>
            </div>

            {/* Phone number (only for Mobile Money) */}
            {method !== "cash" && (
              <div>
                <Label htmlFor="phone">Votre numéro {method === "airtel_money" ? "Airtel Money" : "MTN Money"}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+242 XX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Le numéro associé à votre compte Mobile Money
                </p>
              </div>
            )}

            {/* Info box */}
            <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Paiement sécurisé</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Votre paiement est traité par {KONGOFIX_NAME}. En cas de problème,
                  contactez le support avec votre référence de paiement.
                </p>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full"
              size="lg"
              disabled={actionLoading}
              onClick={handleCreatePayment}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4 mr-2" />
              )}
              Générer la référence de paiement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
