import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Clock,
  Eye,
  Users,
  FileCheck,
  Calendar,
  Star,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

const charteBreadcrumbJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://kongofix.com/" },
    { "@type": "ListItem", "position": 2, "name": "Charte des techniciens", "item": "https://kongofix.com/charte-techniciens" },
  ],
});

export const Route = createFileRoute("/charte-techniciens")({
  head: () => ({
    meta: [
      { title: "Charte des techniciens — KongoFix" },
      { name: "description", content: "Engagements et règles pour les techniciens KongoFix : qualité de service, ponctualité, tarifs transparents, respect du client, documents valides et sanctions." },
      { property: "og:title", content: "Charte des techniciens — KongoFix" },
      { property: "og:description", content: "Engagements et règles pour les techniciens KongoFix : qualité de service, ponctualité, tarifs transparents, respect du client, documents valides et sanctions." },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [
      { children: charteBreadcrumbJsonLd, type: "application/ld+json" },
    ],
  }),
  component: CharteTechniciensPage,
});

function CharteTechniciensPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="px-6 py-16 bg-gradient-to-b from-primary/5 to-background text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Charte des techniciens
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Les engagements et règles que chaque technicien KongoFix s'engage à respecter pour offrir un service de qualité.
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-6 py-12 max-w-3xl mx-auto">
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground leading-relaxed">
            La présente charte définit les droits et obligations des techniciens inscrits sur la plateforme{" "}
            <strong>KongoFix</strong>. En rejoignant KongoFix, chaque technicien s'engage à respecter
            l'ensemble des règles énoncées ci-dessous. Le non-respect de cette charte peut entraîner
            des sanctions allant de l'avertissement à la suspension définitive du compte.
          </p>
        </div>
      </section>

      {/* Engagements */}
      <section className="px-6 py-12 bg-muted/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Nos 8 engagements</h2>
            <p className="text-muted-foreground text-lg">
              Ce que nous attendons de chaque technicien
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "1. Qualité de service",
                desc: "Le technicien s'engage à réaliser chaque intervention avec professionnalisme, en respectant les règles de l'art et les normes en vigueur dans son métier. Toute prestation doit être exécutée avec soin et compétence.",
              },
              {
                icon: <Clock className="h-6 w-6" />,
                title: "2. Ponctualité",
                desc: "Le technicien doit honorer les rendez-vous à l'heure convenue. En cas de retard ou d'imprévu, il doit impérativement prévenir le client dans les plus brefs délais via la messagerie KongoFix ou par téléphone.",
              },
              {
                icon: <Eye className="h-6 w-6" />,
                title: "3. Tarifs transparents",
                desc: "Les tarifs doivent être communiqués clairement au client avant le début de l'intervention. Aucun frais caché n'est toléré. Le technicien s'engage à fournir un devis détaillé pour les travaux importants.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "4. Respect du client",
                desc: "Le technicien traite chaque client avec courtoisie et respect. Il respecte le domicile ou les locaux du client, adopte une tenue adaptée et fait preuve de discrétion. Tout comportement irrespectueux est passible de sanctions.",
              },
              {
                icon: <FileCheck className="h-6 w-6" />,
                title: "5. Documents valides",
                desc: "Le technicien doit fournir des documents d'identité et certifications professionnelles valides lors de son inscription. Ces documents doivent être renouvelés avant leur expiration. KongoFix se réserve le droit de vérifier l'authenticité des documents à tout moment.",
              },
              {
                icon: <Calendar className="h-6 w-6" />,
                title: "6. Disponibilité",
                desc: "Le technicien s'engage à maintenir son calendrier de disponibilité à jour sur la plateforme. Il doit répondre aux demandes d'intervention dans un délai maximal de 24 heures (ou 2 heures pour les demandes urgentes).",
              },
              {
                icon: <Star className="h-6 w-6" />,
                title: "7. Évaluation",
                desc: "Le technicien accepte d'être évalué par les clients après chaque intervention. Les notes et avis contribuent à la réputation du technicien sur la plateforme. Le technicien s'engage à ne pas solliciter frauduleusement des avis positifs.",
              },
              {
                icon: <AlertTriangle className="h-6 w-6" />,
                title: "8. Sanctions",
                desc: "En cas de manquement à la présente charte, KongoFix peut appliquer les sanctions suivantes : avertissement, suspension temporaire du compte (7 à 30 jours), ou radiation définitive de la plateforme. Les décisions sont notifiées par écrit au technicien concerné.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-none shadow-sm">
                <CardContent className="pt-6 pb-5 flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sanctions détaillées */}
      <section className="px-6 py-16 max-w-3xl mx-auto">
        <div className="prose prose-gray max-w-none">
          <h2 className="text-2xl font-bold mb-6">Procédure de sanction</h2>

          <div className="space-y-6">
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Avertissement</h3>
                <p className="text-sm text-muted-foreground">
                  Un premier manquement mineur entraîne un avertissement écrit. Le technicien dispose
                  de 7 jours pour corriger la situation.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                2
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Suspension temporaire</h3>
                <p className="text-sm text-muted-foreground">
                  En cas de récidive ou de manquement grave, le compte du technicien est suspendu pour
                  une durée de 7 à 30 jours. Pendant cette période, le technicien n'apparaît plus dans
                  les résultats de recherche et ne reçoit plus de demandes.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="font-semibold text-base mb-1">Radiation définitive</h3>
                <p className="text-sm text-muted-foreground">
                  Les manquements graves (fraude, usurpation d'identité, comportement dangereux ou
                  abusif, absence répétée) entraînent la radiation définitive de la plateforme.
                  Le technicien radié ne peut plus se réinscrire sur KongoFix.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-6 bg-muted/40 rounded-xl">
            <h3 className="text-lg font-semibold mb-3">Droit de recours</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tout technicien faisant l'objet d'une sanction dispose d'un droit de recours. Il peut
              contester la décision en envoyant un email à <strong>support@kongofix.com</strong> dans
              un délai de 14 jours suivant la notification. KongoFix s'engage à réexaminer le dossier
              et à répondre sous 30 jours.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center bg-primary/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-3">Prêt à rejoindre KongoFix ?</h2>
          <p className="text-muted-foreground text-lg leading-relaxed mb-8">
            Inscrivez-vous en tant que technicien et commencez à recevoir des demandes d'intervention.
          </p>
          <Button asChild size="lg" className="text-base">
            <Link to="/technicien/register">
              Devenir technicien
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
