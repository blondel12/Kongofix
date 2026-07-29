import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title: "Politique de confidentialité — KongoFix" },
      { name: "description", content: "Politique de confidentialité de KongoFix — découvrez comment nous collectons, utilisons et protégeons vos données personnelles en République du Congo." },
      { property: "og:title", content: "Politique de confidentialité — KongoFix" },
      { property: "og:description", content: "Politique de confidentialité de KongoFix — découvrez comment nous collectons, utilisons et protégeons vos données personnelles." },
      { property: "og:image", content: "/og-image.svg" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return (
    <div className="px-6 py-16">
        <div className="max-w-3xl mx-auto prose prose-gray prose-lg">
          <h1>Politique de confidentialité</h1>
          <p className="text-muted-foreground">
            Dernière mise à jour : 28 juillet 2026
          </p>

          <h2>1. Introduction</h2>
          <p>
            La protection de vos données personnelles est une priorité pour KongoFix. Cette
            politique de confidentialité explique comment nous collectons, utilisons, stockons et
            protégeons vos informations lorsque vous utilisez notre Plateforme.
          </p>

          <h2>2. Données collectées</h2>
          <h3>2.1. Données fournies par l'utilisateur</h3>
          <p>Lors de votre inscription et utilisation de KongoFix, nous collectons :</p>
          <ul>
            <li><strong>Nom et prénom</strong> — pour identifier votre compte.</li>
            <li><strong>Adresse email</strong> — pour la connexion et les notifications.</li>
            <li><strong>Numéro de téléphone</strong> — pour la vérification du compte et la mise en relation.</li>
            <li><strong>Adresse postale</strong> — pour les interventions à domicile (Clients).</li>
          </ul>

          <h3>2.2. Données spécifiques aux Techniciens</h3>
          <ul>
            <li>Pièce d'identité (numérisée) — pour la vérification.</li>
            <li>Certifications professionnelles — pour valider les qualifications.</li>
            <li>Photo de profil — affichée publiquement sur le profil.</li>
            <li>Spécialité et zone d'intervention.</li>
          </ul>

          <h3>2.3. Données collectées automatiquement</h3>
          <ul>
            <li><strong>Données de navigation :</strong> pages visitées, durée de visite, type de navigateur.</li>
            <li><strong>Cookies techniques :</strong> nécessaires au fonctionnement de la Plateforme (session utilisateur).</li>
            <li><strong>Cookies de performance :</strong> mesures d'audience anonymisées.</li>
          </ul>

          <h2>3. Utilisation des données</h2>
          <p>Vos données sont utilisées pour les finalités suivantes :</p>
          <ul>
            <li>Création et gestion de votre compte.</li>
            <li>Mise en relation entre Clients et Techniciens.</li>
            <li>Envoi de notifications liées aux demandes d'intervention.</li>
            <li>Amélioration de la Plateforme (analyse d'usage anonymisée).</li>
            <li>Respect des obligations légales.</li>
          </ul>
          <p>
            KongoFix ne vend, ne loue ni ne partage vos données personnelles avec des tiers à des
            fins commerciales sans votre consentement explicite.
          </p>

          <h2>4. Stockage et sécurité</h2>
          <p>
            Vos données sont stockées sur des serveurs sécurisés. Nous mettons en œuvre des mesures
            techniques et organisationnelles appropriées pour protéger vos données contre tout accès
            non autorisé, modification, divulgation ou destruction :
          </p>
          <ul>
            <li>Chiffrement des mots de passe (bcrypt).</li>
            <li>Communications sécurisées (HTTPS).</li>
            <li>Accès restreint aux données personnelles au personnel autorisé.</li>
            <li>Sauvegardes régulières.</li>
          </ul>

          <h2>5. Durée de conservation</h2>
          <p>
            Vos données personnelles sont conservées pendant toute la durée de votre compte actif.
            En cas de suppression de votre compte, vos données sont supprimées dans un délai de 90
            jours, sauf obligation légale de conservation plus longue.
          </p>
          <p>
            Les documents d'identité des Techniciens sont supprimés après validation de
            l'inscription. Seule une confirmation de vérification est conservée.
          </p>

          <h2>6. Vos droits</h2>
          <p>
            Conformément à la législation en vigueur, vous disposez des droits suivants sur vos
            données personnelles :
          </p>
          <ul>
            <li><strong>Droit d'accès :</strong> consulter les données que nous détenons sur vous.</li>
            <li><strong>Droit de rectification :</strong> corriger des informations inexactes.</li>
            <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données.</li>
            <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format lisible.</li>
            <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données.</li>
          </ul>
          <p>
            Pour exercer ces droits, contactez-nous à{" "}
            <a href="mailto:contact@kongofix.com" className="text-primary hover:underline">
              contact@kongofix.com
            </a>.
          </p>

          <h2>7. Cookies</h2>
          <p>
            La Plateforme utilise des cookies essentiels au fonctionnement (session de connexion,
            préférences). Aucun cookie publicitaire ou de tracking tiers n'est utilisé.
          </p>
          <p>
            Vous pouvez configurer votre navigateur pour bloquer les cookies, mais certaines
            fonctionnalités de la Plateforme pourraient ne pas fonctionner correctement.
          </p>

          <h2>8. Modification de la politique</h2>
          <p>
            KongoFix se réserve le droit de modifier cette politique de confidentialité. Toute
            modification sera publiée sur cette page avec la date de mise à jour. Nous vous
            informerons des changements significatifs par email ou notification sur la Plateforme.
          </p>

          <h2>9. Contact</h2>
          <p>
            Pour toute question relative à cette politique ou à vos données personnelles :
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
