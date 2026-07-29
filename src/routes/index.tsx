import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import {
  Search,
  Star,
  CheckCircle,
  Shield,
  Zap,
  DollarSign,
  Wrench,
  UserCheck,
  ChevronRight,
  Mail,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { categories } from "~/data/categories";
import { mockTechnicians } from "~/data/mock-technicians";
import { subscribeToWaitlist } from "~/server/waitlist";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KongoFix — Services techniques à domicile en République du Congo" },
      { name: "description", content: "Trouvez rapidement un électricien, plombier, menuisier ou climatiseur qualifié au Congo. Intervention rapide, techniciens vérifiés, prix transparents." },
      { property: "og:title", content: "KongoFix — Services techniques à domicile en République du Congo" },
      { property: "og:description", content: "Trouvez rapidement un électricien, plombier, menuisier ou climatiseur qualifié au Congo. Intervention rapide, techniciens vérifiés, prix transparents." },
      { property: "og:image", content: "/logo.svg" },
      { property: "og:url", content: "https://kongofix.com" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Home,
});

function StarRating({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= Math.round(rating)
              ? "fill-yellow-500 text-yellow-500"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-semibold">{rating}</span>
      {reviews !== undefined && (
        <span className="text-xs text-muted-foreground ml-0.5">({reviews})</span>
      )}
    </div>
  );
}

function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (selectedCategory) params.set("categorie", selectedCategory);
    const qs = params.toString();
    router.navigate({ to: `/client${qs ? `?${qs}` : ""}` });
  };

  const handleCategoryClick = (slug: string) => {
    router.navigate({ to: `/client?categorie=${slug}` });
  };

  const handleNewsletterSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const email = newsletterEmail.trim();
    // Validation email côté client
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setNewsletterStatus("error");
      setNewsletterMessage("Veuillez entrer une adresse email valide.");
      return;
    }

    setNewsletterStatus("loading");
    setNewsletterMessage("");

    try {
      const result = await subscribeToWaitlist({ data: { email } });
      if (result.success) {
        setNewsletterStatus("success");
        setNewsletterMessage(result.message);
        setNewsletterEmail("");
      } else {
        setNewsletterStatus("error");
        setNewsletterMessage(result.message);
      }
    } catch {
      setNewsletterStatus("error");
      setNewsletterMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="flex flex-col min-h-dvh">
      {/* ========== 1. HERO SECTION ========== */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-24 text-center bg-gradient-to-b from-primary/5 via-primary/5 to-background">
        <Badge variant="secondary" className="mb-6 text-sm px-4 py-1">
          🇨🇬 Disponible en République du Congo
        </Badge>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Trouvez un technicien qualifié près de chez vous
        </h1>
        <p className="mt-5 max-w-xl text-lg text-muted-foreground leading-relaxed">
          Électriciens, plombiers, climatiseurs et plus — disponibles en quelques clics
        </p>

        {/* Search Bar */}
        <form
          onSubmit={handleSearch}
          className="mt-10 w-full max-w-2xl flex flex-col sm:flex-row gap-3"
        >
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Quel service recherchez-vous ?"
              className="pl-10 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] h-12 text-base">
              <SelectValue placeholder="Toutes catégories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.slug} value={cat.slug}>
                  {cat.icon} {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" size="lg" className="h-12 px-8 text-base">
            <Search className="h-5 w-5 mr-2" />
            Rechercher
          </Button>
        </form>

        {/* Urgency quick-access button */}
        <a
          href="/client/urgence"
          className="mt-4 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white font-semibold text-base hover:bg-red-700 transition-colors"
        >
          ⚠️ Urgence 24/24
        </a>
      </section>

      {/* ========== 2. CATEGORIES DE SERVICES ========== */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Catégories de services</h2>
          <p className="mt-2 text-muted-foreground">
            Choisissez le métier dont vous avez besoin
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Card
              key={category.slug}
              className="group text-center hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => handleCategoryClick(category.slug)}
            >
              <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3">
                <span className="text-4xl group-hover:scale-110 transition-transform">
                  {category.icon}
                </span>
                <CardTitle className="text-sm font-semibold leading-tight">
                  {category.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs font-normal">
                  {category.techCount} technicien{category.techCount > 1 ? "s" : ""}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ========== 3. COMMENT ÇA MARCHE ========== */}
      <section className="px-6 py-16 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Comment ça marche ?</h2>
            <p className="mt-2 text-muted-foreground">
              Trois étapes simples pour obtenir de l'aide
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Décrivez votre besoin",
                desc: "Choisissez un service, décrivez le problème, indiquez votre adresse et la date souhaitée.",
                icon: <Search className="h-7 w-7" />,
              },
              {
                step: "2",
                title: "Choisissez un technicien vérifié",
                desc: "Consultez les profils, avis et notes. Le technicien accepte votre demande.",
                icon: <UserCheck className="h-7 w-7" />,
              },
              {
                step: "3",
                title: "Intervention réalisée, notez le service",
                desc: "Le professionnel intervient chez vous. Vous notez la prestation pour la communauté.",
                icon: <CheckCircle className="h-7 w-7" />,
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg mb-5">
                  {item.icon}
                </div>
                <div className="absolute top-2 left-[calc(50%+2.5rem)] hidden md:flex items-center text-muted-foreground/40">
                  {parseInt(item.step) < 3 && <ChevronRight className="h-8 w-8" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 4. TECHNICIENS LES MIEUX NOTÉS ========== */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold">Techniciens les mieux notés</h2>
            <p className="mt-2 text-muted-foreground">
              Découvrez nos professionnels plébiscités par la communauté
            </p>
          </div>
          <Button asChild variant="outline" className="mt-4 sm:mt-0">
            <Link to="/client">
              Voir tous les techniciens
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {mockTechnicians.map((tech) => (
            <Card key={tech.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                      {tech.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{tech.fullName}</p>
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      {tech.specialty}
                    </Badge>
                  </div>
                </div>
                <StarRating rating={tech.rating} reviews={tech.reviewCount} />
                <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  📍 {tech.zone}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ========== 5. TÉMOIGNAGES ========== */}
      <section className="px-6 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Ce que disent nos clients</h2>
          <p className="mt-2 text-muted-foreground">
            La satisfaction de nos utilisateurs est notre priorité
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Marie K.",
              city: "Brazzaville",
              initials: "MK",
              color: "bg-blue-100 text-blue-700",
              text: "KongoFix m'a trouvé un électricien en moins d'une heure. Service impeccable !",
            },
            {
              name: "Jean M.",
              city: "Pointe-Noire",
              initials: "JM",
              color: "bg-emerald-100 text-emerald-700",
              text: "En tant que plombier, KongoFix m'apporte des clients réguliers. Je recommande !",
            },
            {
              name: "Paul B.",
              city: "Brazzaville",
              initials: "PB",
              color: "bg-amber-100 text-amber-700",
              text: "Intervention urgente à 22h pour une fuite d'eau. Le technicien était là en 30 minutes.",
            },
          ].map((testimonial) => (
            <Card key={testimonial.name} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-bold text-lg ${testimonial.color}`}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-yellow-500 text-yellow-500"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  « {testimonial.text} »
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ========== 6. POURQUOI KONGOFIX ========== */}
      <section className="px-6 py-16 bg-muted/40">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold">Pourquoi KongoFix ?</h2>
            <p className="mt-2 text-muted-foreground">
              La confiance au cœur de chaque intervention
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Techniciens vérifiés",
                desc: "Pièce d'identité et certifications contrôlées pour chaque professionnel.",
                icon: <Shield className="h-6 w-6" />,
              },
              {
                title: "Intervention rapide",
                desc: "Trouvez un technicien disponible sous 24 à 48h près de chez vous.",
                icon: <Zap className="h-6 w-6" />,
              },
              {
                title: "Prix transparents",
                desc: "Consultez les tarifs indicatifs avant de confirmer l'intervention.",
                icon: <DollarSign className="h-6 w-6" />,
              },
              {
                title: "Service garanti",
                desc: "Un travail bien fait ou nous intervenons pour trouver une solution.",
                icon: <Wrench className="h-6 w-6" />,
              },
            ].map((benefit) => (
              <Card key={benefit.title} className="text-center border-none shadow-sm">
                <CardContent className="pt-6 pb-5 flex flex-col items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {benefit.icon}
                  </div>
                  <CardTitle className="text-base">{benefit.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {benefit.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="px-6 py-16 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">Prêt à démarrer ?</h2>
          <p className="text-primary-foreground/80 mb-8 text-lg">
            Rejoignez la communauté KongoFix et trouvez le bon technicien pour votre besoin.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild variant="secondary" size="lg" className="text-base">
              <Link to="/client">Trouver un technicien</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base"
            >
              <Link to="/technicien">Je suis technicien</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ========== 7. NEWSLETTER / WAITLIST ========== */}
      <section className="px-6 py-16 bg-primary/5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Mail className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">Restez informé !</h2>
          </div>
          <p className="text-muted-foreground text-lg mb-8">
            Lancement imminent — Inscrivez-vous pour recevoir les actualités et offres de lancement KongoFix.
          </p>

          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <Input
              type="email"
              placeholder="votre@email.com"
              className="h-12 text-base flex-1"
              value={newsletterEmail}
              onChange={(e) => {
                setNewsletterEmail(e.target.value);
                if (newsletterStatus !== "idle") setNewsletterStatus("idle");
              }}
              disabled={newsletterStatus === "loading"}
              aria-label="Adresse email pour la newsletter"
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 px-8 text-base"
              disabled={newsletterStatus === "loading"}
            >
              {newsletterStatus === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Inscription...
                </>
              ) : (
                "S'inscrire"
              )}
            </Button>
          </form>

          {/* Message inline (toast-like) */}
          {newsletterStatus !== "idle" && (
            <div
              className={`mt-4 mx-auto max-w-lg rounded-lg px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                newsletterStatus === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : newsletterStatus === "error"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {newsletterStatus === "success" && <CheckCircle2 className="h-4 w-4" />}
              {newsletterMessage}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            🔒 Nous respectons votre vie privée. Pas de spam, désabonnement facile à tout moment.
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="mt-auto border-t bg-background px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Logo + name */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
            <img src="/logo.svg" alt="KongoFix" class="h-8" />
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
              Accueil
            </Link>
            <Link to="/a-propos" className="text-muted-foreground hover:text-foreground transition-colors">
              À propos
            </Link>
            <Link to="/faq" className="text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link to="/client" className="text-muted-foreground hover:text-foreground transition-colors">
              Services
            </Link>
            <Link to="/technicien" className="text-muted-foreground hover:text-foreground transition-colors">
              Devenir technicien
            </Link>
            <Link to="/cgu" className="text-muted-foreground hover:text-foreground transition-colors">
              CGU
            </Link>
            <Link to="/confidentialite" className="text-muted-foreground hover:text-foreground transition-colors">
              Confidentialité
            </Link>
            <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} KongoFix — Services techniques à domicile
          </p>
        </div>

        {/* Social Links */}
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t flex items-center justify-center gap-5">
          {/* WhatsApp */}
          <a
            href="https://wa.me/242065431806"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-[#25D366] transition-colors"
            aria-label="WhatsApp KongoFix"
            title="WhatsApp"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/kongofix"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-[#1877F2] transition-colors"
            aria-label="Facebook KongoFix"
            title="Facebook"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* Email */}
          <a
            href="mailto:contact@kongofix.com"
            className="text-muted-foreground hover:text-[#EA4335] transition-colors"
            aria-label="Email KongoFix"
            title="Email"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
