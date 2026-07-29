import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { cn } from "~/lib/utils";

const faqBreadcrumbJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://kongofix.com/" },
    { "@type": "ListItem", "position": 2, "name": "FAQ", "item": "https://kongofix.com/faq" },
  ],
});

const faqJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Comment ça marche ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "C'est très simple ! Vous décrivez votre besoin en choisissant un service (plomberie, électricité, climatisation, menuiserie, etc.), vous indiquez votre adresse et la date souhaitée. Un technicien qualifié et vérifié accepte votre demande, puis intervient chez vous. Une fois l'intervention terminée, vous pouvez noter le technicien pour aider la communauté.",
      },
    },
    {
      "@type": "Question",
      "name": "Combien ça coûte ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "KongoFix est gratuit pour les clients — l'utilisation de la plateforme ne vous coûte rien. Le prix de l'intervention est convenu directement entre vous et le technicien. Chaque technicien affiche ses tarifs indicatifs sur son profil pour vous aider à choisir en toute transparence.",
      },
    },
    {
      "@type": "Question",
      "name": "Comment payer ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vous pouvez payer directement le technicien après l'intervention, en espèces ou par Mobile Money (Airtel Money, MTN Mobile Money). KongoFix ne prélève aucun frais sur les clients.",
      },
    },
    {
      "@type": "Question",
      "name": "Quel est le délai d'intervention ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le délai dépend de la disponibilité des techniciens dans votre zone. En général, une demande standard est acceptée sous 24 à 48 heures. Pour les urgences (fuite d'eau, panne électrique), utilisez notre bouton « Urgence 24/24 » pour une intervention prioritaire.",
      },
    },
    {
      "@type": "Question",
      "name": "Et si je ne suis pas satisfait ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Votre satisfaction est notre priorité. Si l'intervention ne vous convient pas, vous pouvez contacter notre service client via le formulaire de contact ou WhatsApp. Nous intervenons pour trouver une solution. Vous pouvez également laisser un avis honnête sur le profil du technicien pour informer les autres clients.",
      },
    },
    {
      "@type": "Question",
      "name": "Comment s'inscrire comme technicien ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rendez-vous sur la page « Espace Technicien » et cliquez sur « S'inscrire ». Remplissez le formulaire avec vos informations personnelles et professionnelles. Votre compte sera examiné par notre équipe sous 48 heures.",
      },
    },
    {
      "@type": "Question",
      "name": "Quels documents fournir ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pour valider votre inscription, vous devez fournir : une pièce d'identité (CNI ou passeport), une photo professionnelle, et toute certification ou diplôme attestant de vos compétences (facultatif mais recommandé pour augmenter votre crédibilité).",
      },
    },
    {
      "@type": "Question",
      "name": "Comment sont attribuées les demandes ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lorsqu'un client soumet une demande, celle-ci est visible par les techniciens de la spécialité concernée dans la zone géographique. Le premier technicien disponible peut accepter la demande. Il n'y a pas d'attribution automatique : vous restez maître de votre planning.",
      },
    },
    {
      "@type": "Question",
      "name": "Combien ça coûte pour un technicien ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "L'inscription et l'utilisation de base de KongoFix sont gratuites pour les techniciens. À l'avenir, des options premium (mise en avant du profil, accès prioritaire aux demandes) pourront être proposées, mais la plateforme restera toujours accessible gratuitement.",
      },
    },
    {
      "@type": "Question",
      "name": "Quelles zones sont couvertes ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "KongoFix est disponible dans toute la République du Congo, avec une concentration de techniciens à Brazzaville et Pointe-Noire. Nous étendons continuellement notre couverture — si votre zone n'est pas encore bien desservie, n'hésitez pas à nous contacter.",
      },
    },
    {
      "@type": "Question",
      "name": "Comment fonctionnent les urgences 24/24 ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le service d'urgence est accessible via le bouton « Urgence 24/24 » sur la page d'accueil. Il vous permet de soumettre une demande prioritaire qui sera traitée en priorité par les techniciens disponibles, même en dehors des heures normales (soirées, week-ends). Un supplément peut s'appliquer selon le technicien.",
      },
    },
    {
      "@type": "Question",
      "name": "Comment contacter KongoFix ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Vous pouvez nous contacter par plusieurs canaux : via notre page Contact (formulaire en ligne), par WhatsApp au +242 06 543 18 06, par email à contact@kongofix.com, ou via nos réseaux sociaux Facebook. Nous répondons sous 24 heures ouvrées.",
      },
    },
  ],
});

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Foire Aux Questions — KongoFix" },
      {
        name: "description",
        content:
          "Questions fréquentes sur KongoFix : fonctionnement, tarifs, inscription technicien, zones couvertes, urgences et plus. Retrouvez toutes les réponses à vos questions.",
      },
      { property: "og:title", content: "Foire Aux Questions — KongoFix" },
      {
        property: "og:description",
        content:
          "Questions fréquentes sur KongoFix : fonctionnement, tarifs, inscription technicien, zones couvertes, urgences et plus.",
      },
      { property: "og:image", content: "/logo.svg" },
      { property: "og:url", content: "https://kongofix.com/faq" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [
      { children: faqBreadcrumbJsonLd, type: "application/ld+json" },
      {
        children: faqJsonLd,
        type: "application/ld+json",
      },
    ],
  }),
  component: FaqPage,
});

interface FaqItem {
  question: string;
  answer: string;
}

const clientFaqs: FaqItem[] = [
  {
    question: "Comment ça marche ?",
    answer:
      "C'est très simple ! Vous décrivez votre besoin en choisissant un service (plomberie, électricité, climatisation, menuiserie, etc.), vous indiquez votre adresse et la date souhaitée. Un technicien qualifié et vérifié accepte votre demande, puis intervient chez vous. Une fois l'intervention terminée, vous pouvez noter le technicien pour aider la communauté.",
  },
  {
    question: "Combien ça coûte ?",
    answer:
      "KongoFix est gratuit pour les clients — l'utilisation de la plateforme ne vous coûte rien. Le prix de l'intervention est convenu directement entre vous et le technicien. Chaque technicien affiche ses tarifs indicatifs sur son profil pour vous aider à choisir en toute transparence.",
  },
  {
    question: "Comment payer ?",
    answer:
      "Vous pouvez payer directement le technicien après l'intervention, en espèces ou par Mobile Money (Airtel Money, MTN Mobile Money). KongoFix ne prélève aucun frais sur les clients.",
  },
  {
    question: "Quel est le délai d'intervention ?",
    answer:
      "Le délai dépend de la disponibilité des techniciens dans votre zone. En général, une demande standard est acceptée sous 24 à 48 heures. Pour les urgences (fuite d'eau, panne électrique), utilisez notre bouton « Urgence 24/24 » pour une intervention prioritaire.",
  },
  {
    question: "Et si je ne suis pas satisfait ?",
    answer:
      "Votre satisfaction est notre priorité. Si l'intervention ne vous convient pas, vous pouvez contacter notre service client via le formulaire de contact ou WhatsApp. Nous intervenons pour trouver une solution. Vous pouvez également laisser un avis honnête sur le profil du technicien pour informer les autres clients.",
  },
];

const technicienFaqs: FaqItem[] = [
  {
    question: "Comment s'inscrire comme technicien ?",
    answer:
      "Rendez-vous sur la page « Espace Technicien » et cliquez sur « S'inscrire ». Remplissez le formulaire avec vos informations personnelles et professionnelles. Votre compte sera examiné par notre équipe sous 48 heures.",
  },
  {
    question: "Quels documents fournir ?",
    answer:
      "Pour valider votre inscription, vous devez fournir : une pièce d'identité (CNI ou passeport), une photo professionnelle, et toute certification ou diplôme attestant de vos compétences (facultatif mais recommandé pour augmenter votre crédibilité).",
  },
  {
    question: "Comment sont attribuées les demandes ?",
    answer:
      "Lorsqu'un client soumet une demande, celle-ci est visible par les techniciens de la spécialité concernée dans la zone géographique. Le premier technicien disponible peut accepter la demande. Il n'y a pas d'attribution automatique : vous restez maître de votre planning.",
  },
  {
    question: "Combien ça coûte pour un technicien ?",
    answer:
      "L'inscription et l'utilisation de base de KongoFix sont gratuites pour les techniciens. À l'avenir, des options premium (mise en avant du profil, accès prioritaire aux demandes) pourront être proposées, mais la plateforme restera toujours accessible gratuitement.",
  },
];

const generalFaqs: FaqItem[] = [
  {
    question: "Quelles zones sont couvertes ?",
    answer:
      "KongoFix est disponible dans toute la République du Congo, avec une concentration de techniciens à Brazzaville et Pointe-Noire. Nous étendons continuellement notre couverture — si votre zone n'est pas encore bien desservie, n'hésitez pas à nous contacter.",
  },
  {
    question: "Comment fonctionnent les urgences 24/24 ?",
    answer:
      "Le service d'urgence est accessible via le bouton « Urgence 24/24 » sur la page d'accueil. Il vous permet de soumettre une demande prioritaire qui sera traitée en priorité par les techniciens disponibles, même en dehors des heures normales (soirées, week-ends). Un supplément peut s'appliquer selon le technicien.",
  },
  {
    question: "Comment contacter KongoFix ?",
    answer:
      "Vous pouvez nous contacter par plusieurs canaux : via notre page Contact (formulaire en ligne), par WhatsApp au +242 06 543 18 06, par email à contact@kongofix.com, ou via nos réseaux sociaux Facebook. Nous répondons sous 24 heures ouvrées.",
  },
];

function AccordionItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-5 py-4 text-left transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isOpen ? "bg-muted/30" : "bg-card",
        )}
        aria-expanded={isOpen}
      >
        <span className="font-medium text-sm sm:text-base pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
        )}
      </button>
      <div
        className={cn(
          "grid transition-all duration-200 ease-in-out",
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-4 pt-1 text-sm text-muted-foreground leading-relaxed">
            {answer}
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqSection({
  title,
  icon,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  items: FaqItem[];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <AccordionItem
            key={index}
            question={item.question}
            answer={item.answer}
            isOpen={openIndex === index}
            onToggle={() => handleToggle(index)}
          />
        ))}
      </div>
    </section>
  );
}

function FaqPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <section className="bg-gradient-to-b from-primary/5 to-background px-6 pt-16 pb-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
          Foire Aux Questions
        </h1>
        <p className="mt-3 text-muted-foreground max-w-lg mx-auto">
          Tout ce que vous devez savoir sur KongoFix — pour les clients, les
          techniciens, et plus encore.
        </p>
      </section>

      {/* FAQ Content */}
      <div className="max-w-3xl mx-auto px-6 py-10 w-full">
        <FaqSection
          title="Pour les clients"
          icon={<HelpCircle className="h-5 w-5" />}
          items={clientFaqs}
        />
        <FaqSection
          title="Pour les techniciens"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          items={technicienFaqs}
        />
        <FaqSection
          title="Général"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
          }
          items={generalFaqs}
        />

        {/* CTA */}
        <div className="text-center mt-12 pt-8 border-t">
          <p className="text-muted-foreground mb-4">
            Vous n'avez pas trouvé la réponse à votre question ?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Contactez-nous
          </a>
        </div>
      </div>
    </div>
  );
}
