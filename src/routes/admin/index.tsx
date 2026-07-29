import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, Wrench, ClipboardList, TrendingUp,
  Star, Clock, CheckCircle, XCircle,
  Eye, FileText, AlertCircle, Download,
  CreditCard, Banknote, Smartphone,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  getAdminStats,
  getPendingTechnicians,
  getAllRequests,
  validateTechnician,
  rejectTechnician,
  suspendTechnician,
  type AdminStats,
  type AdminTechnician,
  type AdminRequest,
} from "~/server/admin";
import {
  getPendingPayments,
  completePayment,
  type Payment,
} from "~/server/payments";
import { METHODS } from "~/data/payment-config";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

// ── Status badges ──────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
    pending: { label: "En attente", variant: "outline", className: "border-orange-300 text-orange-600 bg-orange-50" },
    verified: { label: "Vérifié", variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" },
    rejected: { label: "Refusé", variant: "destructive", className: "bg-red-50 text-red-600 hover:bg-red-50 border-red-200" },
    suspended: { label: "Suspendu", variant: "secondary", className: "bg-yellow-50 text-yellow-700 hover:bg-yellow-50 border-yellow-200" },
    accepted: { label: "En cours", variant: "default", className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" },
    completed: { label: "Terminé", variant: "default", className: "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" },
    cancelled: { label: "Annulé", variant: "destructive", className: "bg-gray-50 text-gray-500 hover:bg-gray-50 border-gray-200" },
  };
  const c = config[status] || { label: status, variant: "outline" as const };

  return (
    <Badge variant={c.variant} className={`text-xs ${c.className || ""}`}>
      {c.label}
    </Badge>
  );
}

// ── Confirm dialog ─────────────────────────────────────────────────────────

function useConfirm() {
  const [dialog, setDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);

  function confirm(title: string, message: string, action: () => Promise<void>) {
    setDialog({ open: true, title, message, action });
  }

  async function handleConfirm() {
    if (dialog) {
      await dialog.action();
      setDialog(null);
    }
  }

  return { dialog, confirm, handleConfirm, closeDialog: () => setDialog(null) };
}

// ── Dashboard ──────────────────────────────────────────────────────────────

function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingTechs, setPendingTechs] = useState<AdminTechnician[]>([]);
  const [requests, setRequests] = useState<AdminRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [requestFilter, setRequestFilter] = useState("tous");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { dialog, confirm, handleConfirm, closeDialog } = useConfirm();

  async function loadData() {
    setLoading(true);
    try {
      const [statsRes, pendingRes, reqsRes, paymentsRes] = await Promise.all([
        getAdminStats(),
        getPendingTechnicians(),
        getAllRequests({ data: { status: "tous" } }),
        getPendingPayments(),
      ]);
      setStats(statsRes.stats);
      setPendingTechs(pendingRes.technicians);
      setRequests(reqsRes.requests);
      setPayments(paymentsRes.payments);
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  async function handleValidate(id: string) {
    setActionLoading(id);
    try {
      await validateTechnician({ data: { technicianId: id } });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la validation.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string, reason: string) {
    setActionLoading(id);
    try {
      await rejectTechnician({ data: { technicianId: id, reason } });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors du refus.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSuspend(id: string) {
    setActionLoading(id);
    try {
      await suspendTechnician({ data: { technicianId: id } });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la suspension.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleCompletePayment(id: string) {
    setActionLoading(id);
    try {
      await completePayment({ data: { paymentId: id } });
      await loadData();
    } catch (err: any) {
      alert(err.message || "Erreur lors de la finalisation du paiement.");
    } finally {
      setActionLoading(null);
    }
  }

  function filteredRequests() {
    if (requestFilter === "tous") return requests.slice(0, 10);
    return requests.filter((r) => r.status === requestFilter).slice(0, 10);
  }

  // ── Loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-28 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  // ── Stats cards ───────────────────────────────────────────────────
  const statCards = [
    { label: "Clients", value: stats?.totalClients ?? 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Techniciens vérifiés", value: stats?.totalTechnicians ?? 0, icon: Wrench, color: "text-green-500", bg: "bg-green-50" },
    { label: "Interventions du jour", value: stats?.interventionsToday ?? 0, icon: ClipboardList, color: "text-purple-500", bg: "bg-purple-50" },
    { label: "CA mensuel (FCFA)", value: stats ? `${(stats.monthlyRevenue / 1000000).toFixed(1)}M` : "0", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
    { label: "Satisfaction", value: stats ? `${stats.satisfactionRate}/5` : "—", icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "En attente", value: stats?.pendingRequests ?? 0, icon: Clock, color: "text-orange-500", bg: "bg-orange-50" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <div>
        <Badge variant="secondary" className="mb-3">Administration</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">
          Tableau de bord
        </h1>
        <p className="text-muted-foreground text-sm">
          Gérez la plateforme : validez les techniciens, suivez les demandes et consultez les statistiques.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="overflow-hidden">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {stat.label}
                </span>
                <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-xl sm:text-2xl font-bold tracking-tight">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activité récente — 5 dernières demandes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            Activité récente
          </h2>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <CardTitle className="text-base mb-1">Aucune demande pour le moment</CardTitle>
              <CardDescription>
                Les nouvelles demandes des clients apparaîtront ici.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {requests.slice(0, 5).map((r) => (
              <Card key={r.id} className="hover:bg-muted/20 transition-colors">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-muted-foreground">
                        {r.reference}
                      </span>
                      <StatusBadge status={r.status} />
                      {r.urgency === "urgent" && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm">
                      <span className="font-medium">{r.category}</span>
                      <span className="text-muted-foreground">— {r.clientName}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground mt-0.5">
                      <span>
                        {new Date(r.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {r.technicianName && (
                        <span>Technicien: {r.technicianName}</span>
                      )}
                    </div>
                  </div>

                  {/* Date d'intervention */}
                  <div className="text-xs text-muted-foreground shrink-0">
                    Intervention:{" "}
                    {new Date(r.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Techniciens en attente de validation */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Techniciens en attente de validation
            {pendingTechs.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{pendingTechs.length}</Badge>
            )}
          </h2>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/techniciens">
              <Eye className="h-4 w-4 mr-1" />
              Voir tous
            </Link>
          </Button>
        </div>

        {pendingTechs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <CheckCircle className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <CardTitle className="text-base mb-1">Aucune validation en attente</CardTitle>
              <CardDescription>
                Tous les techniciens ont été traités.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pendingTechs.map((tech) => (
              <Card key={tech.id}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold truncate">{tech.fullName}</span>
                        <StatusBadge status={tech.status} />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{tech.specialties.join(", ")}</span>
                        <span>•</span>
                        <span>{tech.city}, {tech.neighborhood}</span>
                        <span>•</span>
                        <span>
                          Inscrit le{" "}
                          {new Date(tech.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tech.identityDoc && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <FileText className="h-3 w-3" />
                            Pièce d'identité
                          </span>
                        )}
                        {tech.certifications.map((cert, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            <FileText className="h-3 w-3" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={actionLoading === tech.id}
                        onClick={() =>
                          confirm(
                            "Valider le technicien",
                            `Confirmez la validation de ${tech.fullName}. Il pourra recevoir des demandes.`,
                            () => handleValidate(tech.id),
                          )
                        }
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Valider
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        disabled={actionLoading === tech.id}
                        onClick={() => {
                          const reason = prompt(
                            `Raison du refus de ${tech.fullName} :`,
                            "Documents d'identité non conformes.",
                          );
                          if (reason) {
                            confirm(
                              "Refuser le technicien",
                              `Refuser ${tech.fullName} pour : "${reason}". Cette action est irréversible.`,
                              () => handleReject(tech.id, reason),
                            );
                          }
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Refuser
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Paiements en attente */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            Paiements en attente
            {payments.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{payments.length}</Badge>
            )}
          </h2>
        </div>

        {payments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <Banknote className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <CardTitle className="text-base mb-1">Aucun paiement en attente</CardTitle>
              <CardDescription>
                Tous les paiements ont été traités.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <Card key={payment.id}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm">{payment.reference}</span>
                        <StatusBadge status={payment.status === "confirmed" ? "accepted" : "pending"} />
                        {payment.method === "cash" ? (
                          <Banknote className="h-4 w-4 text-green-500" />
                        ) : (
                          <Smartphone className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="font-semibold">{payment.amount} FCFA</span>
                        <span>•</span>
                        <span>{METHODS[payment.method] || payment.method}</span>
                        {payment.phoneNumber && (
                          <>
                            <span>•</span>
                            <span>{payment.phoneNumber}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>
                          {new Date(payment.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 font-mono">
                        Demande: {payment.requestId || "—"}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {payment.status === "confirmed" ? (
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          disabled={actionLoading === payment.id}
                          onClick={() =>
                            confirm(
                              "Finaliser le paiement",
                              `Confirmer le paiement ${payment.reference} de ${payment.amount} FCFA ?`,
                              () => handleCompletePayment(payment.id),
                            )
                          }
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Finaliser
                        </Button>
                      ) : (
                        <Badge variant="outline" className="text-xs border-orange-300 text-orange-600 bg-orange-50">
                          <Clock className="h-3 w-3 mr-1" />
                          En attente client
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dernières interventions */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-blue-500" />
            Dernières interventions
          </h2>
          <div className="flex gap-1 flex-wrap">
            {["tous", "pending", "accepted", "completed", "cancelled"].map((s) => {
              const labels: Record<string, string> = {
                tous: "Tous",
                pending: "En attente",
                accepted: "En cours",
                completed: "Terminé",
                cancelled: "Annulé",
              };
              return (
                <Button
                  key={s}
                  size="sm"
                  variant={requestFilter === s ? "default" : "ghost"}
                  className="text-xs h-8"
                  onClick={() => setRequestFilter(s)}
                >
                  {labels[s]}
                </Button>
              );
            })}
          </div>
        </div>

        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Réf.</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Client</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Technicien</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Service</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests().length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      Aucune intervention trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredRequests().map((r) => (
                    <tr key={r.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{r.reference}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">{r.clientName}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                        {r.technicianName || "—"}
                      </td>
                      <td className="px-4 py-3">{r.category}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">
                        {new Date(r.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Actions rapides */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/admin/techniciens">
            <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-blue-500" />
                  Voir tous les techniciens
                </CardTitle>
                <CardDescription>
                  Gérer, valider ou suspendre les techniciens de la plateforme.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-green-500" />
                Voir tous les clients
              </CardTitle>
              <CardDescription>
                Consulter la liste des clients inscrits sur la plateforme.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:bg-muted/30 transition-colors cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Download className="h-4 w-4 text-purple-500" />
                Exporter les données
              </CardTitle>
              <CardDescription>
                Télécharger un rapport CSV des activités (bientôt disponible).
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* ── Confirm Dialog ──────────────────────────────────────────────── */}
      {dialog?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={closeDialog} />
          <div className="relative bg-background rounded-lg shadow-lg p-6 w-full max-w-md mx-4 z-10">
            <h3 className="text-lg font-semibold mb-2">{dialog.title}</h3>
            <p className="text-muted-foreground text-sm mb-6">{dialog.message}</p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={closeDialog}>
                Annuler
              </Button>
              <Button
                variant="default"
                onClick={handleConfirm}
                disabled={!!actionLoading}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
