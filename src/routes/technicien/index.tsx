import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  DollarSign, TrendingUp, Star, ClipboardList,
  Clock, MapPin, AlertTriangle, CheckCircle, XCircle,
  ChevronDown, History, MessageCircle,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { loadSession } from "~/lib/session";
import {
  getTechnicianRequests,
  getTechnicianStats,
  acceptRequest,
  declineRequest,
  type TechnicianRequest,
  type TechnicianStats,
} from "~/server/technician";
import { LoadingSkeleton } from "~/components/LoadingSkeleton";

export const Route = createFileRoute("/technicien/")({
  pendingComponent: () => <LoadingSkeleton rows={5} />,
  component: TechnicienDashboard,
});

function TechnicienDashboard() {
  const [techId, setTechId] = useState("");
  const [requests, setRequests] = useState<TechnicianRequest[]>([]);
  const [stats, setStats] = useState<TechnicianStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmDeclineId, setConfirmDeclineId] = useState<string | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (session && session.role === "technicien") {
      const id = session.userId;
      setTechId(id);
      loadData(id);
    }
  }, []);

  async function loadData(id: string) {
    setLoading(true);
    try {
      const [reqResult, statsResult] = await Promise.all([
        getTechnicianRequests({ data: { technicianId: id } }),
        getTechnicianStats({ data: { technicianId: id } }),
      ]);
      setRequests(reqResult.requests);
      setStats(statsResult.stats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept(requestId: string) {
    try {
      await acceptRequest({ data: { technicianId: techId, requestId } });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "accepted" as const } : r))
      );
    } catch {
      // ignore
    }
  }

  async function handleDecline(requestId: string) {
    try {
      await declineRequest({ data: { technicianId: techId, requestId } });
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" as const } : r))
      );
    } catch {
      // ignore
    }
    setConfirmDeclineId(null);
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const todayStr = new Date().toISOString().split("T")[0];
  const todayInterventions = requests.filter(
    (r) => r.status === "accepted" && r.date === todayStr
  );
  const history = requests.filter((r) => r.status === "completed");

  if (loading) {
    return <LoadingSkeleton rows={5} />;
  }

  const statsCards = [
    {
      label: "Revenus du mois",
      value: `${(stats?.monthlyRevenue || 0).toLocaleString("fr-FR")} FCFA`,
      icon: DollarSign,
      color: "text-purple-500",
    },
    {
      label: "Missions complétées",
      value: String(stats?.completedMissions || 0),
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      label: "Note moyenne",
      value: stats?.averageRating ? stats.averageRating.toFixed(1) : "—",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      label: "Demandes en attente",
      value: String(stats?.pendingRequests || 0),
      icon: ClipboardList,
      color: "text-blue-500",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Badge variant="secondary" className="mb-3">Tableau de bord</Badge>
        <h1 className="text-3xl font-bold mb-1">
          Bonjour, {sessionStorage.getItem("kongofix_username") || "Technicien"}
        </h1>
        <p className="text-muted-foreground">
          Voici un aperçu de votre activité sur KongoFix.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Requests */}
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-blue-500" />
        Demandes en attente
        {pendingRequests.length > 0 && (
          <Badge variant="secondary" className="ml-2">{pendingRequests.length}</Badge>
        )}
      </h2>

      {pendingRequests.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="pt-6 text-center py-10">
            <ClipboardList className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <CardTitle className="text-lg mb-1">Aucune demande en attente</CardTitle>
            <CardDescription>
              Les nouvelles demandes d'intervention apparaîtront ici.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-8">
          {pendingRequests.map((req) => (
            <Card key={req.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{req.clientName}</span>
                        <Badge variant="outline" className="text-xs">{req.category}</Badge>
                        {req.urgency === "urgent" && (
                          <Badge variant="destructive" className="gap-1 text-xs font-bold">
                            <AlertTriangle className="h-3 w-3" />
                            URGENT
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{req.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(req.date).toLocaleDateString("fr-FR", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })} — {req.timeSlot}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {req.address.length > 40 ? req.address.slice(0, 40) + "..." : req.address}
                    </span>
                  </div>
                </div>
                <div className="flex sm:flex-col justify-end gap-2 p-4 sm:border-l bg-muted/10">
                  <Button
                    size="sm"
                    onClick={() => handleAccept(req.id)}
                    className="gap-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Accepter
                  </Button>
                  {confirmDeclineId === req.id ? (
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-center text-muted-foreground">Confirmer ?</span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDecline(req.id)}
                        >
                          Oui
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setConfirmDeclineId(null)}
                        >
                          Non
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setConfirmDeclineId(req.id)}
                      className="gap-1"
                    >
                      <XCircle className="h-4 w-4" />
                      Refuser
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Today's Interventions */}
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <MapPin className="h-5 w-5 text-green-500" />
        Interventions du jour
        {todayInterventions.length > 0 && (
          <Badge variant="secondary" className="ml-2">{todayInterventions.length}</Badge>
        )}
      </h2>

      {todayInterventions.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="pt-6 text-center py-8">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <CardTitle className="text-base mb-1">Aucune intervention aujourd'hui</CardTitle>
            <CardDescription>
              Acceptez des demandes pour remplir votre planning.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mb-8">
          {todayInterventions.map((intv) => (
            <Card key={intv.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{intv.clientName}</span>
                    <Badge variant="outline" className="text-xs">{intv.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {intv.timeSlot}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {intv.address}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="gap-1">
                    <Link to="/technicien/messages/$requestId" params={{ requestId: intv.id }}>
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Link>
                  </Button>
                  <Badge variant="default" className="text-xs">Acceptée</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent History */}
      <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
        <History className="h-5 w-5 text-muted-foreground" />
        Historique récent
        {history.length > 0 && (
          <Badge variant="secondary" className="ml-2">{history.length}</Badge>
        )}
      </h2>

      {history.length === 0 ? (
        <Card className="mb-8">
          <CardContent className="pt-6 text-center py-8">
            <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <CardTitle className="text-base mb-1">Pas encore d'historique</CardTitle>
            <CardDescription>
              Les interventions terminées apparaîtront ici.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2 mb-8">
          {history.map((h) => (
            <div
              key={h.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-muted/10"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium">
                    {h.clientName} — {h.category}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(h.date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                    })} — {h.reference}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-300 bg-green-50 text-xs">
                Terminée
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
