import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Search, Wrench, CheckCircle, XCircle,
  Pause, Trash2, Eye, Star, MapPin, FileText,
  Phone, Mail, Calendar, ChevronLeft,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import {
  getAllTechnicians,
  validateTechnician,
  rejectTechnician,
  suspendTechnician,
  deleteTechnician,
  getTechnicianById,
  type AdminTechnician,
} from "~/server/admin";

export const Route = createFileRoute("/admin/techniciens")({
  component: AdminTechniciens,
});

// ── Status badge ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "En attente", className: "border-orange-300 text-orange-600 bg-orange-50" },
    verified: { label: "Vérifié", className: "bg-green-100 text-green-700 border-green-200" },
    rejected: { label: "Refusé", className: "bg-red-50 text-red-600 border-red-200" },
    suspended: { label: "Suspendu", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  };
  const c = config[status] || { label: status, className: "" };

  return (
    <Badge variant="outline" className={`text-xs ${c.className}`}>
      {c.label}
    </Badge>
  );
}

// ── Star rating ────────────────────────────────────────────────────────────

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      <Star className="h-3.5 w-3.5 fill-current" />
      <span className="text-xs font-medium text-foreground">{rating}</span>
    </span>
  );
}

// ── Detail modal ───────────────────────────────────────────────────────────

function TechnicianDetail({
  tech,
  onClose,
}: {
  tech: AdminTechnician;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-background rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto z-10">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b px-6 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-lg font-semibold">{tech.fullName}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <StatusBadge status={tech.status} />
              {tech.status === "verified" && <Stars rating={tech.rating} />}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{tech.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{tech.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>{tech.neighborhood}, {tech.city}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
              <span>
                Inscrit le{" "}
                {new Date(tech.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Spécialités */}
          <div>
            <h4 className="text-sm font-medium mb-2">Spécialités</h4>
            <div className="flex flex-wrap gap-2">
              {tech.specialties.map((s, i) => (
                <Badge key={i} variant="secondary">{s}</Badge>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{tech.totalInterventions}</p>
                <p className="text-xs text-muted-foreground">Interventions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{tech.yearsExperience}</p>
                <p className="text-xs text-muted-foreground">Années d'exp.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold">{tech.tariff}</p>
                <p className="text-xs text-muted-foreground">Tarif indicatif</p>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-medium mb-1">Description</h4>
            <p className="text-sm text-muted-foreground">{tech.description}</p>
          </div>

          {/* Documents */}
          <div>
            <h4 className="text-sm font-medium mb-2">Documents</h4>
            <div className="space-y-2">
              {tech.identityDoc && (
                <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="flex-1">{tech.identityDoc.replace("/docs/", "")}</span>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                </div>
              )}
              {tech.certifications.map((cert, i) => (
                <div key={i} className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg p-3">
                  <FileText className="h-4 w-4 text-green-500" />
                  <span className="flex-1">{cert}</span>
                  <Button variant="ghost" size="sm" className="text-xs">
                    <Eye className="h-3 w-3 mr-1" />
                    Voir
                  </Button>
                </div>
              ))}
              {!tech.identityDoc && tech.certifications.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun document fourni.</p>
              )}
            </div>
          </div>

          {/* Raison de refus */}
          {tech.status === "rejected" && tech.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-red-700 mb-1">Motif du refus</h4>
              <p className="text-sm text-red-600">{tech.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────

function AdminTechniciens() {
  const [technicians, setTechnicians] = useState<AdminTechnician[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [specialtyFilter, setSpecialtyFilter] = useState("tous");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [detailTech, setDetailTech] = useState<AdminTechnician | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAllTechnicians({
        data: {
          search: search || undefined,
          status: statusFilter !== "tous" ? statusFilter : undefined,
          specialty: specialtyFilter !== "tous" ? specialtyFilter : undefined,
        },
      });
      setTechnicians(res.technicians);
    } catch (err) {
      console.error("Erreur chargement techniciens:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(loadData, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, specialtyFilter]);

  async function handleValidate(id: string) {
    if (!confirm("Valider ce technicien ? Il pourra recevoir des demandes d'intervention.")) return;
    setActionLoading(id);
    try {
      await validateTechnician({ data: { technicianId: id } });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleSuspend(id: string) {
    if (!confirm("Suspendre ce technicien ? Il ne pourra plus recevoir de demandes.")) return;
    setActionLoading(id);
    try {
      await suspendTechnician({ data: { technicianId: id } });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer définitivement ce technicien ? Cette action est irréversible.")) return;
    setActionLoading(id);
    try {
      await deleteTechnician({ data: { technicianId: id } });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: string) {
    const reason = prompt("Raison du refus :", "Documents non conformes.");
    if (!reason) return;
    setActionLoading(id);
    try {
      await rejectTechnician({ data: { technicianId: id, reason } });
      await loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleViewDetail(id: string) {
    try {
      const res = await getTechnicianById({ data: { technicianId: id } });
      setDetailTech(res.technician);
    } catch (err: any) {
      alert(err.message);
    }
  }

  // Get unique specialties for filter
  const allSpecialties = Array.from(
    new Set(technicians.flatMap((t) => t.specialties)),
  ).sort();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Badge variant="secondary" className="mb-2">Gestion</Badge>
          <h1 className="text-2xl sm:text-3xl font-bold">Techniciens</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {technicians.length} technicien{technicians.length !== 1 ? "s" : ""} trouvé{technicians.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, ville..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* Status filter buttons */}
              {["tous", "pending", "verified", "suspended", "rejected"].map((s) => {
                const labels: Record<string, string> = {
                  tous: "Tous",
                  pending: "En attente",
                  verified: "Vérifiés",
                  suspended: "Suspendus",
                  rejected: "Refusés",
                };
                return (
                  <Button
                    key={s}
                    size="sm"
                    variant={statusFilter === s ? "default" : "ghost"}
                    className="text-xs h-8"
                    onClick={() => setStatusFilter(s)}
                  >
                    {labels[s]}
                  </Button>
                );
              })}
            </div>
            <select
              className="h-9 rounded-md border bg-transparent px-3 text-sm"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="tous">Toutes spécialités</option>
              {allSpecialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Technicians list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : technicians.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Wrench className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <CardTitle className="text-base mb-1">Aucun technicien trouvé</CardTitle>
            <CardDescription>
              Essayez de modifier vos critères de recherche.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {technicians.map((tech) => (
            <Card key={tech.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold truncate">{tech.fullName}</span>
                      <StatusBadge status={tech.status} />
                      {tech.status === "verified" && <Stars rating={tech.rating} />}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                      <span>{tech.specialties.join(", ")}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="hidden sm:inline">{tech.city}</span>
                      <span>•</span>
                      <span>{tech.totalInterventions} interventions</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(tech.id)}
                    >
                      <Eye className="h-4 w-4" />
                      <span className="sr-only sm:not-sr-only sm:ml-1">Détails</span>
                    </Button>

                    {tech.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white h-8"
                          disabled={actionLoading === tech.id}
                          onClick={() => handleValidate(tech.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 h-8"
                          disabled={actionLoading === tech.id}
                          onClick={() => handleReject(tech.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Refuser
                        </Button>
                      </>
                    )}

                    {tech.status === "verified" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 h-8"
                        disabled={actionLoading === tech.id}
                        onClick={() => handleSuspend(tech.id)}
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Suspendre
                      </Button>
                    )}

                    {tech.status === "suspended" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        disabled={actionLoading === tech.id}
                        onClick={() => handleValidate(tech.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Réactiver
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive h-8"
                      disabled={actionLoading === tech.id}
                      onClick={() => handleDelete(tech.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {detailTech && (
        <TechnicianDetail
          tech={detailTech}
          onClose={() => setDetailTech(null)}
        />
      )}
    </div>
  );
}
