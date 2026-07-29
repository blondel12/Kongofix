import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

const contactBreadcrumbJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://kongofix.com/" },
    { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://kongofix.com/contact" },
  ],
});

// WhatsApp SVG icon component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — KongoFix" },
      { name: "description", content: "Contactez KongoFix — services techniques à domicile en République du Congo. Téléphone, email et formulaire de contact disponibles." },
      { property: "og:title", content: "Contact — KongoFix" },
      { property: "og:description", content: "Contactez KongoFix — services techniques à domicile en République du Congo. Téléphone, email et formulaire de contact disponibles." },
      { property: "og:image", content: "/logo.svg" },
      { name: "twitter:card", content: "summary" },
    ],
    scripts: [
      { children: contactBreadcrumbJsonLd, type: "application/ld+json" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // MVP: log to console — backend à venir
    console.log("Message envoyé :", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  }

  return (
    <div className="px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-3">Contactez-nous</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Une question, une suggestion ou besoin d'aide ? L'équipe KongoFix est à votre écoute.
            </p>
          </div>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {[
              {
                icon: <Phone className="h-5 w-5" />,
                title: "Téléphone",
                content: "+242 06 543 18 06",
                href: "tel:+242065431806",
              },
              {
                icon: <Mail className="h-5 w-5" />,
                title: "Email",
                content: "contact@kongofix.com",
                href: "mailto:contact@kongofix.com",
              },
              {
                icon: <MapPin className="h-5 w-5" />,
                title: "Adresse",
                content: "Brazzaville, République du Congo",
                href: null,
              },
              {
                icon: <WhatsAppIcon className="h-5 w-5" />,
                title: "WhatsApp",
                content: "+242 06 543 18 06",
                href: "https://wa.me/242065431806?text=Bonjour%20KongoFix%20!",
                isExternal: true,
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="pt-6 text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full mx-auto mb-3 ${item.title === "WhatsApp" ? "bg-[#25D366]/10 text-[#25D366]" : "bg-primary/10 text-primary"}`}>
                    {item.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  {item.href ? (
                    <a
                      href={item.href}
                      {...(item.isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {item.content}
                    </a>
                  ) : (
                    <p className="text-sm text-muted-foreground">{item.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Contact Form */}
          <Card>
            <CardContent className="pt-6">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <CheckCircle className="h-16 w-16 text-emerald-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Message envoyé !</h3>
                  <p className="text-muted-foreground mb-6">
                    Merci de nous avoir contacté. Nous vous répondrons dans les plus brefs délais.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => setSubmitted(false)}
                  >
                    Envoyer un autre message
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-1">Envoyez-nous un message</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <Label htmlFor="contact-name">Nom complet</Label>
                        <Input
                          id="contact-name"
                          placeholder="Votre nom"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-email">Email</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          placeholder="votre@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-message">Message</Label>
                      <Textarea
                        id="contact-message"
                        placeholder="Décrivez votre demande..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        required
                      />
                    </div>
                    <Button type="submit" size="lg">
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer le message
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
