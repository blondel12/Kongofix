import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Star,
  CheckCircle,
  MapPin,
  Shield,
  Calendar,
  Clock,
  Award,
  ChevronRight,
  ArrowLeft,
  Phone,
  ThumbsUp,
  Wrench,
  Camera,
  MessageCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { mockTechnicians, type MockTechnician } from "~/data/mock-technicians";

export const Route = createFileRoute("/client/technicien/$id")({
  head: ({ params }) => {
    const tech = mockTechnicians.find((t) => t.id === params.id);
    const title = tech
      ? `${tech.fullName} (${tech.specialty}) — KongoFix`
      : "Technicien — KongoFix";
    const description = tech
      ? `${tech.specialty} à ${tech.city} — Note ${tech.rating}/5 (${tech.reviewCount} avis) — ${tech.tariff}`
      : "Trouvez un technicien qualifié près de chez vous avec KongoFix.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: "/og-image.svg" },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: "/og-image.svg" },
      ],
    };
  },
  component: TechnicianProfile,
});

function StarRating({
  rating,
  size = "md",
  showValue = true,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}) {
  const cls = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${
            star <= Math.round(rating)
              ? "fill-yellow-500 text-yellow-500"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      {showValue && (
        <span
          className={`ml-1 font-semibold ${
            size === "sm" ? "text-xs" : size === "lg" ? "text-lg" : "text-sm"
          }`}
        >
          {rating}
        </span>
      )}
    </div>
  );
}

function TechnicianProfile() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const tech: MockTechnician | undefined = mockTechnicians.find((t) => t.id === id);

  if (!tech) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Technicien introuvable</h1>
        <p className="text-muted-foreground mb-6">
          Le technicien que vous recherchez n'existe pas ou n'est plus disponible.
        </p>
        <Button asChild>
          <Link to="/client">Voir tous les techniciens</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Back button */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-3" asChild>
          <Link to="/client">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour aux résultats
          </Link>
        </Button>
      </div>

      {/* ====== HEADER ====== */}
      <Card className="mb-6">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Avatar */}
            <div className="shrink-0 flex flex-col items-center">
              <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-3xl">
                  {tech.initials}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{tech.fullName}</h1>
                {tech.verified && (
                  <Badge
                    variant="secondary"
                    className="gap-1 text-xs bg-blue-50 text-blue-700 border-blue-200"
                  >
                    <Shield className="h-3 w-3" />
                    Vérifié
                  </Badge>
                )}
              </div>

              <Badge variant="secondary" className="text-sm mb-3">
                {tech.specialty}
              </Badge>

              {/* Quick stats */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <div>
                  <StarRating rating={tech.rating} size="md" />
                  <span className="text-xs text-muted-foreground ml-1">
                    ({tech.reviewCount} avis)
                  </span>
                </div>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{tech.totalInterventions}</span>{" "}
                  interventions
                </span>
                <span className="text-muted-foreground">
                  <span className="font-semibold text-green-600">
                    {tech.satisfactionRate}%
                  </span>{" "}
                  satisfaction
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 mt-3 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>
                  {tech.zone}, {tech.city}
                </span>
              </div>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-2 mt-5 pt-5 border-t">
            <Button asChild size="lg" className="flex-1">
              <Link to="/client/demander" search={{ technicien: tech.id }}>
                <Calendar className="h-4 w-4 mr-2" />
                Demander une intervention
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              <Phone className="h-4 w-4 mr-2" />
              Contacter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ====== DETAILS GRID ====== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wrench className="h-5 w-5 text-primary" />
                Présentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{tech.description}</p>
            </CardContent>
          </Card>

          {/* Portfolio */}
          {tech.portfolio.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Réalisations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {tech.portfolio.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg bg-muted overflow-hidden"
                    >
                      <img
                        src={url}
                        alt={`Réalisation ${i + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty portfolio placeholder */}
          {tech.portfolio.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary" />
                  Réalisations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center"
                    >
                      <Camera className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Avis clients
              </CardTitle>
              <Badge variant="secondary">{tech.reviewCount} avis</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rating summary */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="text-center">
                  <p className="text-3xl font-bold">{tech.rating}</p>
                  <StarRating rating={tech.rating} size="sm" showValue={false} />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    <span className="font-semibold text-foreground">{tech.reviewCount}</span> avis
                  </p>
                  <p>
                    <span className="font-semibold text-green-600">{tech.satisfactionRate}%</span>{" "}
                    de satisfaction
                  </p>
                </div>
              </div>

              {/* Individual reviews */}
              {tech.reviews.map((review, i) => (
                <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{review.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} size="sm" showValue={false} />
                  <p className="text-sm text-muted-foreground mt-1">{review.comment}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column: sidebar info */}
        <div className="space-y-6">
          {/* Experience & Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">En chiffres</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{tech.yearsExperience} ans</p>
                  <p className="text-xs text-muted-foreground">d'expérience</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{tech.totalInterventions}</p>
                  <p className="text-xs text-muted-foreground">interventions réalisées</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{tech.satisfactionRate}%</p>
                  <p className="text-xs text-muted-foreground">taux de satisfaction</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tariffs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tarifs indicatifs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-primary">{tech.tariff}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Les tarifs peuvent varier selon la complexité de l'intervention. Un devis
                précis sera établi après description de votre besoin.
              </p>
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tech.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tech.certifications.map((cert, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Aucune certification renseignée.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
