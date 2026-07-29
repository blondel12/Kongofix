import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  LogOut,
  Camera,
  Clock,
  Pencil,
  Check,
  X,
  MessageCircle,
  ClipboardList,
  Eye,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { getCurrentUser, updateProfile, logout } from "~/server/auth";
import { getClientRequests, type ServiceRequest } from "~/server/requests";
import { loadSession, clearSession } from "~/lib/session";
import type { UserData } from "~/server/auth";

export const Route = createFileRoute("/client/account")({
  component: ClientAccountPage,
});

function ClientAccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable fields
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const session = loadSession();
    if (!session) {
      navigate({ to: "/client/login" });
      return;
    }

    Promise.all([
      getCurrentUser({ data: { userId: session.userId } }),
      getClientRequests({ data: { clientId: session.userId } }),
    ])
      .then(([userResult, reqResult]) => {
        if (userResult.user) {
          setUser(userResult.user);
          setEditFullName(userResult.user.fullName);
          setEditPhone(userResult.user.phone);
          setEditEmail(userResult.user.email);
          setEditAddress(userResult.user.address || "");
        }
        setRequests(reqResult.requests);
      })
      .catch(() => {
        // Silently fail
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleStartEdit() {
    if (user) {
      setEditFullName(user.fullName);
      setEditPhone(user.phone);
      setEditEmail(user.email);
      setEditAddress(user.address || "");
    }
    setEditing(true);
    setMessage("");
  }

  function handleCancelEdit() {
    setEditing(false);
    setMessage("");
  }

  async function handleSave() {
    if (!user) return;

    if (!editFullName.trim()) {
      setMessage("Le nom complet est requis.");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const result = await updateProfile({
        data: {
          userId: user.id,
          fullName: editFullName.trim(),
          phone: editPhone.trim(),
          email: editEmail.trim(),
          address: editAddress.trim() || undefined,
        },
      });
      if (result.success) {
        setUser({ ...user, fullName: editFullName, phone: editPhone, email: editEmail, address: editAddress });
        setEditing(false);
        setMessage("Profil mis à jour avec succès.");
      }
    } catch (err: any) {
      setMessage(err.message || "Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Ignore
    }
    clearSession();
    navigate({ to: "/client/login" });
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground">Utilisateur introuvable.</p>
        <Button className="mt-4" onClick={() => navigate({ to: "/client/login" })}>
          Se connecter
        </Button>
      </div>
    );
  }

  const initials = user.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Mon compte</h1>

      {message && (
        <div
          className={`mb-6 rounded-md p-3 text-sm ${
            message.includes("succès")
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {message}
        </div>
      )}

      {/* Profile Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Profil</CardTitle>
          <CardDescription>Vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          {!editing ? (
            /* Display mode */
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{user.fullName}</p>
                  <Badge variant="secondary" className="mt-1">
                    {user.role === "client" ? "Client" : user.role}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{user.address || "Aucune adresse enregistrée"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}</span>
                </div>
              </div>

              <Button variant="outline" onClick={handleStartEdit} className="gap-2">
                <Pencil className="h-4 w-4" />
                Modifier le profil
              </Button>
            </div>
          ) : (
            /* Edit mode */
            <div className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.photoUrl} />
                  <AvatarFallback className="bg-primary/10 text-primary text-lg relative">
                    {initials}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="h-5 w-5 text-white" />
                    </div>
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Photo de profil (bientôt disponible)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editName">Nom complet</Label>
                <Input
                  id="editName"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone">Téléphone</Label>
                <Input
                  id="editPhone"
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editEmail">Email</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editAddress">Adresse</Label>
                <Input
                  id="editAddress"
                  placeholder="Ex: 123 Avenue de l'Indépendance, Brazzaville"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? "Enregistrement..." : <><Check className="h-4 w-4" /> Enregistrer</>}
                </Button>
                <Button variant="ghost" onClick={handleCancelEdit} disabled={saving} className="gap-2">
                  <X className="h-4 w-4" /> Annuler
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History / Mes demandes */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Mes demandes
          </CardTitle>
          <CardDescription>Suivez vos demandes d'intervention</CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="h-10 w-10 text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                Aucune demande pour le moment.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <Link to="/client/demander" className="text-primary hover:underline">
                  Faire une demande
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((req) => {
                const statusConfig: Record<string, { label: string; colorClass: string }> = {
                  pending: { label: "En attente", colorClass: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800" },
                  accepted: { label: "Acceptée", colorClass: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800" },
                  rejected: { label: "Refusée", colorClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
                  completed: { label: "Terminée", colorClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" },
                  cancelled: { label: "Annulée", colorClass: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800" },
                };
                const cfg = statusConfig[req.status] || statusConfig.pending;

                return (
                  <div
                    key={req.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/5 hover:bg-muted/10 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm">{req.category}</span>
                        <Badge className={`text-xs border ${cfg.colorClass}`} variant="outline">
                          {cfg.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {req.reference} — {new Date(req.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })} — {req.timeSlot}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {req.street}, {req.neighborhood}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2 shrink-0">
                      <Button variant="ghost" size="sm" asChild className="gap-1 text-xs h-8">
                        <Link to="/client/suivi/$requestId" params={{ requestId: req.id }}>
                          <Eye className="h-3.5 w-3.5" />
                          Suivre
                        </Link>
                      </Button>
                      {req.status === "accepted" && (
                        <Button variant="outline" size="sm" asChild className="gap-1 text-xs h-8">
                          <Link to="/client/messages/$requestId" params={{ requestId: req.id }}>
                            <MessageCircle className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="destructive" onClick={handleLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Se déconnecter
      </Button>
    </div>
  );
}
