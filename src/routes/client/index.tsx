import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState, useMemo } from "react";
import {
  Search,
  Star,
  CheckCircle,
  ChevronRight,
  MapPin,
  SlidersHorizontal,
  X,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { categories } from "~/data/categories";
import { mockTechnicians, type MockTechnician } from "~/data/mock-technicians";
import { LoadingSkeleton } from "~/components/LoadingSkeleton";

export const Route = createFileRoute("/client/")({
  pendingComponent: () => <LoadingSkeleton rows={4} />,
  head: () => ({
    meta: [
      { title: "Trouver un technicien — KongoFix" },
      { name: "description", content: "Parcourez les profils de techniciens qualifiés par spécialité, ville et note. Électriciens, plombiers, climatiseurs et plus au Congo." },
      { property: "og:title", content: "Trouver un technicien — KongoFix" },
      { property: "og:description", content: "Parcourez les profils de techniciens qualifiés par spécialité, ville et note. Électriciens, plombiers, climatiseurs et plus au Congo." },
      { property: "og:image", content: "/logo.svg" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ClientSearchResults,
  validateSearch: (search: Record<string, string>) => ({
    q: search.q || "",
    categorie: search.categorie || "",
  }),
});

function StarRating({ rating, size }: { rating: number; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "h-3 w-3" : "h-4 w-4";
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
      <span className={`ml-1 font-semibold ${size === "sm" ? "text-xs" : "text-sm"}`}>
        {rating}
      </span>
    </div>
  );
}

// Map category slug to display name
const categorySlugToName: Record<string, string> = {
  electricien: "Électricien",
  plombier: "Plombier",
  menuisier: "Menuisier",
  peintre: "Peintre",
  climatisation: "Climatisation",
  electromenager: "Électroménager",
  "mecanicien-mobile": "Mécanicien mobile",
  "cameras-surveillance": "Caméras de surveillance",
  "internet-wifi": "Internet / Wi-Fi",
  "systemes-solaires": "Systèmes solaires",
};

const ITEMS_PER_PAGE = 6;

function ClientSearchResults() {
  const { q, categorie } = Route.useSearch();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState(q || "");
  const [categoryFilter, setCategoryFilter] = useState(categorie || "");
  const [cityFilter, setCityFilter] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derive unique cities from data
  const cities = useMemo(() => {
    const set = new Set(mockTechnicians.map((t) => t.city));
    return Array.from(set).sort();
  }, []);

  // Filter technicians
  const filtered = useMemo(() => {
    let results = [...mockTechnicians];

    // Search query: match name, specialty, city, zone
    if (searchQuery.trim()) {
      const qLower = searchQuery.toLowerCase().trim();
      results = results.filter(
        (t) =>
          t.fullName.toLowerCase().includes(qLower) ||
          t.specialty.toLowerCase().includes(qLower) ||
          t.city.toLowerCase().includes(qLower) ||
          t.zone.toLowerCase().includes(qLower) ||
          t.description.toLowerCase().includes(qLower),
      );
    }

    // Category filter
    if (categoryFilter) {
      const catName = categorySlugToName[categoryFilter];
      if (catName) {
        results = results.filter((t) => t.specialty === catName);
      }
    }

    // City filter
    if (cityFilter) {
      results = results.filter((t) => t.city === cityFilter);
    }

    // Rating filter
    const minR = parseFloat(minRating);
    if (minR > 0) {
      results = results.filter((t) => t.rating >= minR);
    }

    return results;
  }, [searchQuery, categoryFilter, cityFilter, minRating]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (categoryFilter) params.set("categorie", categoryFilter);
    const qs = params.toString();
    navigate({ to: `/client${qs ? `?${qs}` : ""}`, replace: true });
  }

  function clearFilters() {
    setSearchQuery("");
    setCategoryFilter("");
    setCityFilter("");
    setMinRating("0");
    navigate({ to: "/client", replace: true });
  }

  function getCategoryIcon(specialty: string) {
    const cat = categories.find((c) => c.name === specialty);
    return cat?.icon || "🔧";
  }

  const hasActiveFilters = searchQuery || categoryFilter || cityFilter || parseFloat(minRating) > 0;

  // Filters component (reused in desktop sidebar and mobile sheet)
  const FiltersPanel = () => (
    <div className="space-y-5">
      {/* Category filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Catégorie</label>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full">
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
      </div>

      {/* City filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Ville</label>
        <Select value={cityFilter} onValueChange={setCityFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Toutes les villes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les villes</SelectItem>
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Min rating */}
      <div>
        <label className="text-sm font-medium mb-2 block">Note minimum</label>
        <Select value={minRating} onValueChange={setMinRating}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Toutes les notes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Toutes les notes</SelectItem>
            <SelectItem value="4.5">4.5+ ⭐</SelectItem>
            <SelectItem value="4">4.0+ ⭐</SelectItem>
            <SelectItem value="3.5">3.5+ ⭐</SelectItem>
            <SelectItem value="3">3.0+ ⭐</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
          <X className="h-3 w-3 mr-1" />
          Effacer les filtres
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Breadcrumb / back */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="text-muted-foreground -ml-3">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="mb-6">
        <Badge variant="secondary" className="mb-3">Recherche de techniciens</Badge>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          {categoryFilter
            ? `${categorySlugToName[categoryFilter] || "Techniciens"}`
            : "Tous les techniciens"}
        </h1>
        <p className="text-muted-foreground">
          {filtered.length} technicien{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Search bar */}
      <Card className="mb-6">
        <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
          <form onSubmit={handleSearch}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nom, spécialité, ville..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {/* Mobile filter button */}
                <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                  <SheetTrigger asChild className="sm:hidden">
                    <Button variant="outline" type="button">
                      <SlidersHorizontal className="h-4 w-4" />
                      <span className="sr-only">Filtres</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-72">
                    <SheetHeader className="mb-6">
                      <SheetTitle>Filtres</SheetTitle>
                    </SheetHeader>
                    <FiltersPanel />
                  </SheetContent>
                </Sheet>
                <Button type="submit">
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Rechercher</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Main content: sidebar + results */}
      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden sm:block w-56 shrink-0">
          <div className="sticky top-20">
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Filtres
            </h3>
            <FiltersPanel />
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun technicien trouvé</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Essayez d'élargir votre recherche en modifiant les filtres ou les mots-clés.
              </p>
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Effacer les filtres
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visible.map((tech) => (
                  <TechnicianCard key={tech.id} tech={tech} />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleCount((c) => c + ITEMS_PER_PAGE)}
                  >
                    Voir plus de techniciens
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Show count */}
              {filtered.length > ITEMS_PER_PAGE && (
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Affichage de {visible.length} sur {filtered.length} technicien{filtered.length !== 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function TechnicianCard({ tech }: { tech: MockTechnician }) {
  return (
    <Card className="hover:shadow-md transition-shadow group">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {tech.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-semibold truncate text-sm">{tech.fullName}</p>
              {tech.verified && (
                <Shield className="h-3.5 w-3.5 text-blue-500 shrink-0" title="Vérifié" />
              )}
            </div>
            <Badge variant="secondary" className="text-xs mt-0.5">
              {tech.specialty}
            </Badge>
          </div>
        </div>

        <StarRating rating={tech.rating} size="sm" />
        <p className="text-xs text-muted-foreground mt-0.5">
          {tech.reviewCount} avis
        </p>

        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{tech.zone}</span>
        </div>

        <p className="text-xs font-medium text-primary mt-2">{tech.tariff}</p>

        <Button asChild size="sm" className="w-full mt-3 group-hover:bg-primary/90">
          <Link to="/client/technicien/$id" params={{ id: tech.id }}>
            Voir le profil
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
