import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Heart,
  ShieldCheck,
  Zap,
  Eye,
  Search,
  UserCheck,
  CheckCircle,
  Users,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

const aProposBreadcrumbJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://kongofix.com/" },
    { "@type": "ListItem", "position": 2, "name": "À propos", "item": "https://kongofix.com/a-propos" },
  ],
});

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — KongoFix" },
      { name: "description", content: "Découvrez la mission, les valeurs et l'équipe derrière KongoFix — la plateforme de mise en relation avec les meilleurs techniciens en République du Congo." },
      { property: "og:title", content: "À propos — KongoFix" },
      { property: "og:description", content: "Découvrez la mission, les valeurs et l'équipe derrière KongoFix — la plateforme de mise en relation avec les meilleurs techniciens en République du Congo." },
      { property: "og:image", content: "/logo.svg" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [
      { children: aProposBreadcrumbJsonLd, type: "application/ld+json" },
    ],
  }),
  component: AProposPage,
});

function AProposPage() {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <section className="px-6 py-16 bg-gradient-to-b from-primary/5 to-background text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            À propos de KongoFix
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            La plateforme qui connecte les Congolais avec les meilleurs techniciens qualifiés.
          </p>
        </div>
      </section>

      {/* Notre mission */}
      <section className="px-6 py-16 max-w-4xl mx-auto">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
            <Heart className="h-7 w-7" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Notre mission</h2>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
            KongoFix a été créé pour résoudre un problème simple mais crucial :{" "}
            <strong>trouver rapidement un technicien de confiance</strong> en République du Congo.
            Nous connectons les particuliers et les entreprises avec des professionnels vérifiés —
            électriciens, plombiers, climatiseurs, menuisiers et bien plus — pour des interventions
            rapides, transparentes et de qualité.
          </p>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="px-6 py-16 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3">Comment ça marche ?</h2>
            <p className="text-muted-foreground text-lg">
              Trois étapes simples pour obtenir de l'aide
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Décrivez votre besoin",
                desc: "Choisissez un service parmi nos catégories, décrivez le problème, indiquez votre adresse et la date souhaitée. Tout se fait en quelques clics depuis votre téléphone ou ordinateur.",
                icon: <Search className="h-7 w-7" />,
              },
              {
                step: "2",
                title: "Un technicien vérifié accepte",
                desc: "Consultez les profils, avis et notes des techniciens disponibles. Le professionnel le mieux adapté accepte votre demande et vous confirme l'intervention.",
                icon: <UserCheck className="h-7 w-7" />,
              },
              {
                step: "3",
                title: "Intervention réalisée, vous notez",
                desc: "Le technicien intervient chez vous à la date convenue. Une fois le travail terminé, vous notez la prestation pour aider la communauté à faire les meilleurs choix.",
                icon: <CheckCircle className="h-7 w-7" />,
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-5">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos valeurs */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Nos valeurs</h2>
          <p className="text-muted-foreground text-lg">
            Les principes qui guident chacune de nos décisions
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Confiance",
              desc: "Chaque technicien est vérifié : pièce d'identité, certifications et antécédents contrôlés avant validation.",
              icon: <ShieldCheck className="h-6 w-6" />,
            },
            {
              title: "Qualité",
              desc: "Nous sélectionnons des professionnels qualifiés et le système d'avis garantit un haut niveau de service.",
              icon: <UserCheck className="h-6 w-6" />,
            },
            {
              title: "Rapidité",
              desc: "Trouvez un technicien disponible sous 24 à 48h. En cas d'urgence, notre service est disponible 24h/24.",
              icon: <Zap className="h-6 w-6" />,
            },
            {
              title: "Transparence",
              desc: "Profils complets, avis vérifiés, tarifs indicatifs : vous savez à qui vous faites appel avant de confirmer.",
              icon: <Eye className="h-6 w-6" />,
            },
          ].map((value) => (
            <Card key={value.title} className="text-center border-none shadow-sm">
              <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {value.icon}
                </div>
                <h3 className="text-base font-semibold">{value.title}</h3>
                <p className="text-sm text-muted-foreground">{value.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Notre équipe */}
      <section className="px-6 py-16 bg-muted/40">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center mb-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Notre équipe</h2>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Derrière KongoFix se trouve une équipe passionnée de développeurs, designers et
              entrepreneurs congolais, unis par la volonté de{" "}
              <strong>digitaliser et simplifier l'accès aux services techniques</strong> en
              République du Congo. Nous croyons que la technologie peut transformer le quotidien
              des Congolais en rendant les services essentiels plus accessibles, plus rapides
              et plus fiables.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col items-center mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
              <Mail className="h-7 w-7" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Une question ?</h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Nous serions ravis d'échanger avec vous. N'hésitez pas à nous contacter pour toute
              question, suggestion ou collaboration.
            </p>
            <Button asChild size="lg" className="text-base">
              <Link to="/contact">
                Contactez-nous
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
