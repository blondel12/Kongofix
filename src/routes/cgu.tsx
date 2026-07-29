import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cgu")({
  head: () => ({
    meta: [
      { title: "Conditions Générales d'Utilisation — KongoFix" },
      { name: "description", content: "Conditions Générales d'Utilisation de KongoFix — plateforme de mise en relation entre clients et techniciens qualifiés en République du Congo." },
      { property: "og:title", content: "Conditions Générales d'Utilisation — KongoFix" },
      { property: "og:description", content: "Conditions Générales d'Utilisation de KongoFix — plateforme de mise en relation entre clients et techniciens qualifiés en République du Congo." },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CguPage,
});

function CguPage() {
  return (
    <div className="px-6 py-16">
        <div className="max-w-3xl mx-auto prose prose-gray prose-lg">
          <h1>Conditions Générales d'Utilisation</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : 28 juillet 2026
          </p>

          <h2>1. Définitions</h2>
          <p>
            <strong>KongoFix</strong> (« la Plateforme ») est un service de mise en relation entre
            des particuliers ou entreprises (« Clients ») et des prestataires techniques indépendants
            (« Techniciens ») en République du Congo.
          </p>
          <p>
            Les présentes Conditions Générales d'Utilisation (« CGU ») régissent l'accès et
            l'utilisation de la Plateforme accessible via le site web <strong>kongofix.com</strong>.
          </p>

          <h2>2. Acceptation des conditions</h2>
          <p>
            En accédant à la Plateforme et en créant un compte, vous reconnaissez avoir lu, compris
            et accepté sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, vous
            ne devez pas utiliser la Plateforme.
          </p>

          <h2>3. Inscription</h2>
          <h3>3.1. Inscription Client</h3>
          <p>
            Pour utiliser la Plateforme en tant que Client, vous devez créer un compte en fournissant
            des informations exactes et complètes (nom, email, numéro de téléphone). Vous êtes
            responsable de la confidentialité de vos identifiants.
          </p>
          <h3>3.2. Inscription Technicien</h3>
          <p>
            Pour vous inscrire en tant que Technicien, vous devez fournir des documents justificatifs
            (pièce d'identité, certifications professionnelles). KongoFix se réserve le droit de
            valider ou refuser toute inscription après vérification des documents.
          </p>

          <h2>4. Obligations des utilisateurs</h2>
          <h3>4.1. Obligations du Client</h3>
          <ul>
            <li>Fournir une description précise du service demandé.</li>
            <li>Indiquer une adresse correcte pour l'intervention.</li>
            <li>Être présent ou joignable au moment de l'intervention.</li>
            <li>Payer le technicien selon les modalités convenues (espèces ou Mobile Money).</li>
            <li>Ne pas solliciter le technicien en dehors de la Plateforme pour contourner le service.</li>
          </ul>
          <h3>4.2. Obligations du Technicien</h3>
          <ul>
            <li>Fournir des informations exactes sur ses qualifications et son expérience.</li>
            <li>Se présenter à l'intervention à la date et heure convenues.</li>
            <li>Réaliser la prestation dans les règles de l'art.</li>
            <li>Respecter les tarifs annoncés ou convenus avant l'intervention.</li>
            <li>Ne pas proposer de services non sollicités sans accord préalable du Client.</li>
          </ul>

          <h2>5. Responsabilités</h2>
          <p>
            KongoFix agit exclusivement en tant qu'intermédiaire de mise en relation. La Plateforme
            ne réalise aucune prestation technique et n'est pas partie au contrat entre le Client et
            le Technicien.
          </p>
          <p>
            KongoFix ne saurait être tenue responsable :
          </p>
          <ul>
            <li>De la qualité ou de la non-exécution des prestations par le Technicien.</li>
            <li>Des dommages causés lors de l'intervention du Technicien.</li>
            <li>Des litiges financiers entre Client et Technicien.</li>
            <li>Des fausses déclarations faites par l'une ou l'autre partie.</li>
          </ul>
          <p>
            En cas de litige, KongoFix s'engage à faciliter la communication entre les parties mais
            ne garantit pas la résolution du différend.
          </p>

          <h2>6. Tarifs</h2>
          <p>
            L'utilisation de la Plateforme est gratuite pour les Clients. Les Techniciens
            bénéficient d'un accès gratuit pendant la phase de lancement. Des frais de commission
            pourront être introduits ultérieurement, avec un préavis minimum de 30 jours.
          </p>

          <h2>7. Résiliation</h2>
          <p>
            KongoFix se réserve le droit de suspendre ou résilier un compte utilisateur en cas de :
          </p>
          <ul>
            <li>Non-respect des présentes CGU.</li>
            <li>Fourniture de fausses informations.</li>
            <li>Comportement inapproprié signalé par d'autres utilisateurs.</li>
            <li>Inactivité prolongée du compte Technicien (supérieure à 12 mois).</li>
          </ul>
          <p>
            L'utilisateur peut demander la suppression de son compte à tout moment en contactant
            KongoFix via la page <Link to="/contact" className="text-primary hover:underline">Contact</Link>.
          </p>

          <h2>8. Données personnelles</h2>
          <p>
            La collecte et le traitement des données personnelles sont régis par notre{" "}
            <Link to="/confidentialite" className="text-primary hover:underline">
              Politique de confidentialité
            </Link>.
          </p>

          <h2>9. Modification des CGU</h2>
          <p>
            KongoFix se réserve le droit de modifier les présentes CGU à tout moment. Les
            utilisateurs seront informés des modifications par email ou via une notification sur
            la Plateforme. L'utilisation continue de la Plateforme après modification vaut
            acceptation des nouvelles conditions.
          </p>

          <h2>10. Loi applicable et juridiction</h2>
          <p>
            Les présentes CGU sont régies par le droit congolais. Tout litige relatif à
            l'interprétation ou l'exécution des présentes sera soumis aux juridictions compétentes
            de Brazzaville, République du Congo.
          </p>

          <h2>11. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU, veuillez nous contacter :
          </p>
          <ul>
            <li>Email : <a href="mailto:contact@kongofix.com" className="text-primary hover:underline">contact@kongofix.com</a></li>
            <li>Téléphone : +242 06 543 18 06</li>
            <li>Adresse : Brazzaville, République du Congo</li>
          </ul>
        </div>
    </div>
  );
}
