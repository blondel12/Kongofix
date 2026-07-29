import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  AlertTriangle,
  Phone,
  Star,
  MessageCircle,
  FileText,
  XCircle,
  Loader2,
  Send,
  Camera,
  ChevronRight,
  Wrench,
  CreditCard,
  User,
  Download,
  Shield,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { loadSession } from "~/lib/session";
import {
  getRequestDetail,
  cancelRequest,
  submitReview,
  type RequestDetail,
  type ReviewInfo,
} from "~/server/requests";

export const Route = createFileRoute("/client/suivi/$requestId")({
  head: ({ params }) => ({
    meta: [
      { title: `Suivi de votre demande — KongoFix` },
      { name: "description", content: "Suivez l'avancement de votre demande d'intervention en temps réel — statut, technicien assigné et détails." },
      { property: "og:title", content: "Suivi de votre demande — KongoFix" },
      { property: "og:description", content: "Suivez l'avancement de votre demande d'intervention en temps réel." },
      { property: "og:image", content: "/og-image.svg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Suivi de votre demande — KongoFix" },
      { name: "twitter:description", content: "Suivez l'avancement de votre demande d'intervention en temps réel." },
      { name: "twitter:image", content: "/og-image.svg" },
    ],
  }),
  component: SuiviDemandePage,
});

// ---------------------------------------------------------------------------
// Status timeline configuration
// ---------------------------------------------------------------------------

interface TimelineStep {
  key: string;
  label: string;
  icon: React.ReactNode;
  description: (detail: RequestDetail) => string;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "pending",
    label: "En attente",
    icon: <Clock className="h-5 w-5" />,
    description: (d) =>
      `Demande envoyée le ${new Date(d.request.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })}`,
  },
  {
    key: "accepted",
    label: "Acceptée",
    icon: <CheckCircle2 className="h-5 w-5" />,
    description: (d) => {
      const name = d.technician?.fullName || "Un technicien";
      const date = new Date(d.request.date + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      return `${name} a accepté la demande — intervention prévue le ${date} (${d.request.timeSlot})`;
    },
  },
  {
    key: "in_progress",
    label: "En cours",
    icon: <Wrench className="h-5 w-5" />,
    description: (d) =>
      `Le technicien est intervenu le ${new Date(d.request.date + "T00:00:00").toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })}`,
  },
  {
    key: "completed",
    label: "Terminée",
    icon: <Shield className="h-5 w-5" />,
    description: (d) =>
      `Intervention terminée le ${new Date(d.request.date + "T00:00:00").toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`,
  },
];

function getCompletedSteps(status: string): number {
  switch (status) {
    case "pending":
      return 0;
    case "accepted":
      return 1;
    case "completed":
      return 4;
    case "cancelled":
      return -1;
    case "rejected":
      return -1;
    default:
      return 0;
  }
}

// ---------------------------------------------------------------------------
// Status badge config
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; color: string }> = {
  pending: { label: "En attente", variant: "secondary", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  accepted: { label: "Acceptée", variant: "default", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  completed: { label: "Terminée", variant: "outline", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
  cancelled: { label: "Annulée", variant: "destructive", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  rejected: { label: "Refusée", variant: "destructive", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

// ---------------------------------------------------------------------------
// Helper: method label
// ---------------------------------------------------------------------------

function methodLabel(method: string): string {
  switch (method) {
    case "airtel_money":
      return "Airtel Money";
    case "mtn_money":
      return "MTN Mobile Money";
    case "cash":
      return "Espèces";
    default:
      return method;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

function SuiviDemandePage() {
  const { requestId } = Route.useParams();
  const navigate = useNavigate();

  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");

  // Rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState<ReviewInfo | null>(null);

  // Cancel confirmation
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const loadDetail = useCallback(async () => {
    try {
      const result = await getRequestDetail({ data: { requestId } });
      setDetail(result);
      // If already reviewed, populate review state
      if (result.review) {
        setReviewSubmitted(result.review);
        setRating(result.review.rating);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      navigate({ to: "/client/login" });
      return;
    }
    loadDetail();
  }, [loadDetail, navigate]);

  // ── Cancel handler ──
  async function handleCancel() {
    setActionLoading("cancel");
    try {
      await cancelRequest({ data: { requestId } });
      await loadDetail();
      setShowCancelConfirm(false);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'annulation.");
    } finally {
      setActionLoading("");
    }
  }

  // ── Review submit ──
  async function handleSubmitReview() {
    if (rating < 1) {
      setError("Veuillez sélectionner une note.");
      return;
    }
    setReviewSubmitting(true);
    setError("");
    try {
      const result = await submitReview({
        data: { requestId, rating, comment: comment.trim() },
      });
      setReviewSubmitted(result.review);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'envoi de l'avis.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  // ── Loading state ──
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-48 bg-muted rounded-lg" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 text-center">
        <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">Erreur</h1>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link to="/client/account">Retour à mes demandes</Link>
        </Button>
      </div>
    );
  }

  if (!detail) return null;

  const { request, technician, payment, review } = detail;
  const currentReview = reviewSubmitted || review;
  const statusCfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
  const completedSteps = getCompletedSteps(request.status);
  const isCancelled = request.status === "cancelled" || request.status === "rejected";

  const initials = technician
    ? technician.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "";

  let specialties: string[] = [];
  try {
    specialties = technician ? JSON.parse(technician.specialties) : [];
  } catch {
    specialties = technician ? [technician.specialties] : [];
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back link */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-3" asChild>
          <Link to="/client/account">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Mes demandes
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Badge className={statusCfg.color + " mb-2 border-0"}>{statusCfg.label}</Badge>
          <h1 className="text-xl sm:text-2xl font-bold">Suivi de la demande</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Référence : <span className="font-mono font-semibold text-foreground">{request.reference}</span>
          </p>
        </div>
        <div className="text-3xl">{request.category === "Électricien" ? "⚡" : request.category === "Plombier" ? "🔧" : request.category === "Climatisation" ? "❄️" : request.category === "Menuisier" ? "🪚" : request.category === "Peintre" ? "🎨" : "🔧"}</div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto">
            <XCircle className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Timeline ── */}
      {!isCancelled && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Avancement</CardTitle>
            <CardDescription>Suivez l'évolution de votre demande étape par étape</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8 space-y-0">
              {TIMELINE_STEPS.map((step, idx) => {
                const stepIdx = idx;
                const isCompleted = completedSteps > stepIdx;
                const isCurrent = completedSteps === stepIdx;
                const isLast = idx === TIMELINE_STEPS.length - 1;

                return (
                  <div key={step.key} className="relative pb-8 last:pb-0">
                    {/* Vertical line */}
                    {!isLast && (
                      <div
                        className={`absolute left-[-1.625rem] top-9 bottom-0 w-0.5 ${
                          isCompleted ? "bg-primary" : "bg-border"
                        }`}
                        style={{ transform: "translateX(-50%)" }}
                      />
                    )}

                    <div className="flex items-start gap-4">
                      {/* Icon circle */}
                      <div
                        className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full border-2 shrink-0 ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground"
                            : isCurrent
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-muted border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : isCurrent ? step.icon : <Circle className="h-5 w-5" />}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1 pt-1.5">
                        <p
                          className={`text-sm font-semibold ${
                            isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {step.label}
                        </p>
                        {(isCompleted || isCurrent) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {step.description(detail)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled banner */}
      {isCancelled && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 pb-6 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
            <h2 className="text-lg font-bold text-destructive mb-1">
              {request.status === "cancelled" ? "Demande annulée" : "Demande refusée"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {request.status === "cancelled"
                ? "Cette demande a été annulée. Vous pouvez en faire une nouvelle à tout moment."
                : "Le technicien n'a pas pu prendre en charge cette demande."}
            </p>
            <Button asChild className="mt-4">
              <Link to="/client/demander">Nouvelle demande</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Request details ── */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Détails de la demande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Service */}
          <DetailRow icon={<Wrench className="h-4 w-4" />} label="Service" value={request.category} />

          {/* Date & Time */}
          <DetailRow
            icon={<Clock className="h-4 w-4" />}
            label="Date et heure"
            value={`${new Date(request.date + "T00:00:00").toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })} — ${request.timeSlot}`}
          />

          {/* Address */}
          <DetailRow
            icon={<MapPin className="h-4 w-4" />}
            label="Adresse"
            value={`${request.street}, ${request.neighborhood}, ${request.city}`}
          />

          {/* Urgency */}
          <DetailRow
            icon={<AlertTriangle className="h-4 w-4" />}
            label="Niveau d'urgence"
            value={
              <Badge variant={request.urgency === "urgent" ? "destructive" : "secondary"}>
                {request.urgency === "urgent" ? "Urgent" : "Normal"}
              </Badge>
            }
          />

          {/* Description */}
          <div className="flex items-start gap-3">
            <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-0.5">Description</p>
              <p className="text-sm">{request.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Technician info ── */}
      {technician && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Technicien assigné</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={technician.photoUrl} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-base">{technician.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {specialties.join(", ")} • {technician.yearsExperience} ans d'expérience
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-medium">{technician.rating.toFixed(1)}</span>
                  <span className="text-xs text-muted-foreground">({technician.reviewCount} avis)</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={`tel:${technician.phone}`}>
                      <Phone className="h-3.5 w-3.5" />
                      {technician.phone}
                    </a>
                  </Button>
                  {request.status === "accepted" && (
                    <Button variant="outline" size="sm" className="gap-1" asChild>
                      <Link to="/client/messages/$requestId" params={{ requestId }}>
                        <MessageCircle className="h-3.5 w-3.5" />
                        Message
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Payment info ── */}
      {payment && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Paiement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow
              icon={<CreditCard className="h-4 w-4" />}
              label="Montant"
              value={<span className="font-semibold">{payment.amount} FCFA</span>}
            />
            <DetailRow
              icon={<CreditCard className="h-4 w-4" />}
              label="Mode de paiement"
              value={methodLabel(payment.method)}
            />
            <DetailRow
              icon={<FileText className="h-4 w-4" />}
              label="Référence"
              value={<span className="font-mono text-sm">{payment.reference}</span>}
            />
            <DetailRow
              icon={<Shield className="h-4 w-4" />}
              label="Statut"
              value={
                <Badge
                  variant={payment.status === "completed" ? "default" : payment.status === "confirmed" ? "secondary" : "outline"}
                >
                  {payment.status === "completed" ? "Complété" : payment.status === "confirmed" ? "Confirmé" : "En attente"}
                </Badge>
              }
            />
          </CardContent>
        </Card>
      )}

      {/* ── Action buttons ── */}
      {!isCancelled && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Pending: cancel */}
            {request.status === "pending" && (
              <>
                {!showCancelConfirm ? (
                  <Button
                    variant="outline"
                    className="w-full border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={actionLoading === "cancel"}
                  >
                    <XCircle className="h-4 w-4" />
                    Annuler la demande
                  </Button>
                ) : (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <p className="text-sm font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Confirmer l'annulation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancel}
                        disabled={actionLoading === "cancel"}
                      >
                        {actionLoading === "cancel" ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : null}
                        Oui, annuler
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelConfirm(false)}
                      >
                        Non, garder
                      </Button>
                    </div>
                  </div>
                )}
                {!payment && (
                  <Button asChild className="w-full gap-2">
                    <Link to="/client/payment/$requestId" params={{ requestId }}>
                      <CreditCard className="h-4 w-4" />
                      Payer la prestation
                    </Link>
                  </Button>
                )}
              </>
            )}

            {/* Accepted: contact + cancel + pay */}
            {request.status === "accepted" && (
              <>
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 gap-2">
                    <Link to="/client/messages/$requestId" params={{ requestId }}>
                      <MessageCircle className="h-4 w-4" />
                      Contacter le technicien
                    </Link>
                  </Button>
                  {!showCancelConfirm ? (
                    <Button
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 gap-2"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      <XCircle className="h-4 w-4" />
                      Annuler
                    </Button>
                  ) : null}
                </div>
                {showCancelConfirm && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                    <p className="text-sm font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Confirmer l'annulation
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Êtes-vous sûr de vouloir annuler cette demande ? Cette action est irréversible.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancel}
                        disabled={actionLoading === "cancel"}
                      >
                        {actionLoading === "cancel" ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : null}
                        Oui, annuler
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowCancelConfirm(false)}
                      >
                        Non, garder
                      </Button>
                    </div>
                  </div>
                )}
                {!payment && (
                  <Button asChild className="w-full gap-2">
                    <Link to="/client/payment/$requestId" params={{ requestId }}>
                      <CreditCard className="h-4 w-4" />
                      Payer la prestation
                    </Link>
                  </Button>
                )}
              </>
            )}

            {/* Completed: rating, download invoice, new request */}
            {request.status === "completed" && (
              <div className="space-y-3">
                {/* Download invoice (placeholder) */}
                <Button variant="outline" className="w-full gap-2" disabled>
                  <Download className="h-4 w-4" />
                  Télécharger la facture
                </Button>

                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to="/client/demander">
                    <ChevronRight className="h-4 w-4" />
                    Nouvelle demande
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Review section (completed + no review yet) ── */}
      {request.status === "completed" && !currentReview && (
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Noter le technicien
            </CardTitle>
            <CardDescription>
              Votre avis aide la communauté et encourage les techniciens de qualité.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Star rating */}
            <div className="space-y-1.5">
              <Label>Votre note</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-0.5 transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        (hoverRating || rating) >= star
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm text-muted-foreground ml-2">
                    {rating}/5 — {rating === 5 ? "Excellent !" : rating === 4 ? "Très bien" : rating === 3 ? "Bien" : rating === 2 ? "Passable" : "Médiocre"}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <Label htmlFor="reviewComment">Commentaire (optionnel)</Label>
              <Textarea
                id="reviewComment"
                placeholder="Partagez votre expérience avec ce technicien..."
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">{comment.length}/500</p>
            </div>

            {/* Photo upload (placeholder) */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1">
                <Camera className="h-3.5 w-3.5" />
                Photo du travail réalisé <span className="text-muted-foreground font-normal">(optionnel)</span>
              </Label>
              <Button variant="outline" size="sm" disabled className="gap-1">
                <Camera className="h-4 w-4" />
                Ajouter une photo
              </Button>
              <p className="text-xs text-muted-foreground">Fonctionnalité bientôt disponible</p>
            </div>

            {/* Submit */}
            <Button
              onClick={handleSubmitReview}
              disabled={reviewSubmitting || rating < 1}
              className="w-full gap-2"
            >
              {reviewSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Envoyer mon avis
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── Review submitted ── */}
      {currentReview && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
              Votre avis a été envoyé
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= currentReview.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">{currentReview.rating}/5</span>
            </div>
            {currentReview.comment && (
              <p className="text-sm italic">"{currentReview.comment}"</p>
            )}
            <p className="text-xs text-muted-foreground">
              Merci pour votre retour ! Il aide la communauté KongoFix.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Detail row helper
// ---------------------------------------------------------------------------

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground shrink-0">{icon}</span>
      <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-right">{value}</span>
      </div>
    </div>
  );
}
