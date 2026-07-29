export interface MockTechnicianReview {
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MockTechnician {
  id: string;
  fullName: string;
  specialty: string;
  description: string;
  yearsExperience: number;
  zone: string;
  city: string;
  tariff: string;
  rating: number;
  reviewCount: number;
  totalInterventions: number;
  satisfactionRate: number;
  verified: boolean;
  initials: string;
  avatarUrl: string;
  portfolio: string[];
  certifications: string[];
  reviews: MockTechnicianReview[];
}

const techs: MockTechnician[] = [
  {
    id: "1", fullName: "Jean Koumba", specialty: "Électricien",
    description: "Électricien certifié avec plus de 10 ans d'expérience en installations résidentielles et industrielles. Spécialiste des diagnostics de pannes, mises aux normes et installations neuves.",
    yearsExperience: 11, zone: "Brazzaville Centre", city: "Brazzaville",
    tariff: "15 000 FCFA / intervention de base", rating: 4.8, reviewCount: 47,
    totalInterventions: 312, satisfactionRate: 96, verified: true, initials: "JK", avatarUrl: "", portfolio: [],
    certifications: ["BT Électrotechnique", "Habilitation Électrique"],
    reviews: [
      { author: "Marc B.", rating: 5, comment: "Excellent travail, très professionnel. A refait entièrement mon tableau électrique en une journée.", date: "2026-06-15" },
      { author: "Alice M.", rating: 5, comment: "Intervention rapide pour une panne de courant. Diagnostic précis et réparation efficace.", date: "2026-05-28" },
      { author: "Paul K.", rating: 4, comment: "Bon électricien, ponctuel et travail soigné.", date: "2026-05-10" },
    ],
  },
  {
    id: "2", fullName: "Marie Ngakosso", specialty: "Plombier",
    description: "Plombière expérimentée intervenant sur tous types de travaux : plomberie sanitaire, chauffage, débouchage, détection de fuites. Équipée de matériel professionnel.",
    yearsExperience: 8, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "12 000 FCFA / intervention de base", rating: 4.9, reviewCount: 63,
    totalInterventions: 458, satisfactionRate: 98, verified: true, initials: "MN", avatarUrl: "", portfolio: [],
    certifications: ["CAP Installateur Sanitaire", "Certification Qualiplomb"],
    reviews: [
      { author: "Sophie L.", rating: 5, comment: "Incroyable ! Marie a résolu une fuite que deux autres plombiers n'avaient pas réussi à trouver.", date: "2026-07-02" },
      { author: "David T.", rating: 5, comment: "Installation complète de ma salle de bain, résultat impeccable.", date: "2026-06-20" },
      { author: "Christine F.", rating: 4, comment: "Très bon travail. Un petit retard mais le résultat compense largement.", date: "2026-05-15" },
    ],
  },
  {
    id: "3", fullName: "Pascal Mabiala", specialty: "Climatisation",
    description: "Technicien frigoriste spécialisé en climatisation et ventilation. Installation, maintenance et réparation de tous types de climatiseurs. Dépannage rapide.",
    yearsExperience: 7, zone: "Brazzaville Nord", city: "Brazzaville",
    tariff: "20 000 FCFA / intervention de base", rating: 4.7, reviewCount: 35,
    totalInterventions: 198, satisfactionRate: 94, verified: true, initials: "PM", avatarUrl: "", portfolio: [],
    certifications: ["BP Fluides Énergies Domotique", "Attestation manipulation fluides frigorigènes"],
    reviews: [
      { author: "Roger N.", rating: 5, comment: "Installation de 3 splits en une journée. Travail soigné.", date: "2026-06-10" },
      { author: "Fatima D.", rating: 4, comment: "Bonne réparation de ma clim. Prix un peu élevé mais intervention rapide.", date: "2026-05-22" },
      { author: "Jean-Claude M.", rating: 5, comment: "Entretien annuel fait avec soin, je fais appel à lui depuis 3 ans.", date: "2026-04-30" },
    ],
  },
  {
    id: "4", fullName: "Grace Taty", specialty: "Menuisier",
    description: "Menuisière créative, spécialisée en mobilier sur mesure, agencement intérieur et menuiserie bois. Réalisation de meubles, placards, cuisines équipées.",
    yearsExperience: 6, zone: "Dolisie", city: "Dolisie",
    tariff: "18 000 FCFA / intervention de base", rating: 4.6, reviewCount: 28,
    totalInterventions: 156, satisfactionRate: 92, verified: true, initials: "GT", avatarUrl: "", portfolio: [],
    certifications: ["CAP Menuiserie", "Formation Mobilier Design"],
    reviews: [
      { author: "Laure K.", rating: 5, comment: "Grace a réalisé ma bibliothèque sur mesure, le résultat est magnifique.", date: "2026-06-05" },
      { author: "Henri P.", rating: 4, comment: "Très bon travail de menuiserie, finitions propres.", date: "2026-05-12" },
      { author: "Mireille B.", rating: 5, comment: "Placards de cuisine parfaitement réalisés. Propre, précise et à l'écoute.", date: "2026-04-18" },
    ],
  },
  {
    id: "5", fullName: "Armand Ngoma", specialty: "Électricien",
    description: "Électricien spécialisé en énergie solaire et systèmes photovoltaïques. Installation de panneaux solaires, onduleurs, batteries et systèmes hybrides.",
    yearsExperience: 9, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "18 000 FCFA / intervention de base", rating: 4.5, reviewCount: 31,
    totalInterventions: 205, satisfactionRate: 90, verified: true, initials: "AN", avatarUrl: "", portfolio: [],
    certifications: ["Formation Énergie Solaire", "Habilitation Électrique"],
    reviews: [
      { author: "Guy S.", rating: 5, comment: "Installation solaire complète pour ma maison. Économie de 60% sur ma facture !", date: "2026-07-01" },
      { author: "Nathalie R.", rating: 4, comment: "Bon diagnostic de mon installation existante. A optimisé le rendement.", date: "2026-06-12" },
    ],
  },
  {
    id: "6", fullName: "Chantal Bouesso", specialty: "Peintre",
    description: "Peintre professionnelle en bâtiment. Travaux de peinture intérieure et extérieure, pose de revêtements muraux, enduits décoratifs et finitions.",
    yearsExperience: 5, zone: "Brazzaville Centre", city: "Brazzaville",
    tariff: "10 000 FCFA / intervention de base", rating: 4.4, reviewCount: 22,
    totalInterventions: 134, satisfactionRate: 89, verified: true, initials: "CB", avatarUrl: "", portfolio: [],
    certifications: ["CAP Peinture en Bâtiment"],
    reviews: [
      { author: "Franck M.", rating: 5, comment: "Peinture complète de mon appartement. Résultat parfait, très propre et rapide.", date: "2026-06-18" },
      { author: "Diane K.", rating: 4, comment: "Bons conseils sur les couleurs, travail appliqué. Tarifs raisonnables.", date: "2026-05-30" },
    ],
  },
  {
    id: "7", fullName: "Félix Mboungou", specialty: "Électroménager",
    description: "Réparateur d'électroménager toutes marques. Lave-linge, réfrigérateurs, congélateurs, cuisinières, micro-ondes. Diagnostic gratuit.",
    yearsExperience: 12, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "8 000 FCFA / diagnostic", rating: 4.7, reviewCount: 39,
    totalInterventions: 520, satisfactionRate: 94, verified: true, initials: "FM", avatarUrl: "", portfolio: [],
    certifications: ["Formation Électroménager", "Agréé LG & Samsung"],
    reviews: [
      { author: "Bernard L.", rating: 5, comment: "A réparé mon congélateur qui ne faisait plus de froid. Diagnostic rapide et prix honnête.", date: "2026-07-05" },
      { author: "Paulette M.", rating: 5, comment: "Très compétent ! Mon lave-linge fonctionne comme neuf.", date: "2026-06-25" },
      { author: "Olivier S.", rating: 4, comment: "Bon réparateur mais délai pour trouver la pièce un peu long.", date: "2026-06-01" },
    ],
  },
  {
    id: "8", fullName: "Serge Bitsindou", specialty: "Mécanicien mobile",
    description: "Mécanicien automobile intervenant à domicile. Entretien, réparation, diagnostic électronique. Spécialiste Toyota, Nissan et Renault.",
    yearsExperience: 15, zone: "Brazzaville Nord", city: "Brazzaville",
    tariff: "25 000 FCFA / intervention de base", rating: 4.3, reviewCount: 56,
    totalInterventions: 890, satisfactionRate: 87, verified: true, initials: "SB", avatarUrl: "", portfolio: [],
    certifications: ["CAP Mécanique Auto", "VAL Diagnostic Électronique"],
    reviews: [
      { author: "Thomas D.", rating: 4, comment: "Dépannage à domicile pour ma Toyota. A résolu le problème sur place.", date: "2026-07-08" },
      { author: "Carole N.", rating: 5, comment: "Super mécanicien, honnête et ne fait pas de travail inutile.", date: "2026-06-14" },
      { author: "Michel Y.", rating: 3, comment: "Compétent mais le tarif est élevé pour une intervention simple.", date: "2026-05-20" },
      { author: "Sandrine T.", rating: 5, comment: "Intervention d'urgence à 20h, vraiment réactif. Merci !", date: "2026-04-28" },
    ],
  },
  {
    id: "9", fullName: "Brigitte Makosso", specialty: "Caméras de surveillance",
    description: "Technicienne en systèmes de sécurité. Installation de caméras de surveillance IP, systèmes d'alarme, visiophones et contrôle d'accès.",
    yearsExperience: 6, zone: "Brazzaville Centre", city: "Brazzaville",
    tariff: "22 000 FCFA / installation de base", rating: 4.8, reviewCount: 19,
    totalInterventions: 87, satisfactionRate: 95, verified: true, initials: "BM", avatarUrl: "", portfolio: [],
    certifications: ["Certification Hikvision", "Réseaux IP"],
    reviews: [
      { author: "Patrice E.", rating: 5, comment: "Installation de 4 caméras autour de ma maison. Image impeccable sur mon téléphone.", date: "2026-06-22" },
      { author: "Julie M.", rating: 5, comment: "Très professionnelle, a pris le temps d'expliquer le système.", date: "2026-05-05" },
    ],
  },
  {
    id: "10", fullName: "Hervé Nzaba", specialty: "Internet / Wi-Fi",
    description: "Technicien réseaux spécialisé en installation internet et Wi-Fi. Configuration de box, répéteurs Wi-Fi, réseaux mesh. Optimisation de couverture.",
    yearsExperience: 4, zone: "Dolisie", city: "Dolisie",
    tariff: "10 000 FCFA / intervention", rating: 4.2, reviewCount: 15,
    totalInterventions: 92, satisfactionRate: 85, verified: true, initials: "HN", avatarUrl: "", portfolio: [],
    certifications: ["CCNA", "Formation Réseaux Fibre Optique"],
    reviews: [
      { author: "Kevin M.", rating: 4, comment: "A bien amélioré la couverture Wi-Fi chez moi. Installation propre.", date: "2026-07-10" },
      { author: "Rose B.", rating: 4, comment: "Service correct. Le Wi-Fi fonctionne bien dans toute la maison maintenant.", date: "2026-06-05" },
    ],
  },
  {
    id: "11", fullName: "Thérèse Okana", specialty: "Systèmes solaires",
    description: "Experte en systèmes solaires photovoltaïques et thermiques. Dimensionnement, installation et maintenance de centrales solaires.",
    yearsExperience: 10, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "25 000 FCFA / diagnostic", rating: 4.9, reviewCount: 41,
    totalInterventions: 175, satisfactionRate: 97, verified: true, initials: "TO", avatarUrl: "", portfolio: [],
    certifications: ["Master Énergies Renouvelables", "Certification SMA", "Formation Batteries Lithium"],
    reviews: [
      { author: "Luc P.", rating: 5, comment: "Installation d'une centrale de 5kW chez moi. Thérèse est une experte.", date: "2026-06-30" },
      { author: "Marceline K.", rating: 5, comment: "Excellente étude de dimensionnement, installation impeccable.", date: "2026-06-10" },
      { author: "André F.", rating: 5, comment: "Maintenance régulière de mon installation. Professionnelle et réactive.", date: "2026-05-15" },
    ],
  },
  {
    id: "12", fullName: "Junior Kimbembe", specialty: "Plombier",
    description: "Plombier polyvalent : sanitaire, évacuation, raccordement, robinetterie. Expert en recherche de fuites avec caméra thermique.",
    yearsExperience: 7, zone: "Brazzaville Sud", city: "Brazzaville",
    tariff: "12 000 FCFA / intervention de base", rating: 4.5, reviewCount: 33,
    totalInterventions: 240, satisfactionRate: 91, verified: false, initials: "JK2", avatarUrl: "", portfolio: [],
    certifications: ["CAP Plomberie"],
    reviews: [
      { author: "Noël M.", rating: 5, comment: "Super plombier, m'a dépanné un dimanche pour une canalisation bouchée.", date: "2026-07-12" },
      { author: "Adèle P.", rating: 4, comment: "Bonne intervention. A trouvé la fuite rapidement avec sa caméra.", date: "2026-06-08" },
    ],
  },
];

export const mockTechnicians: MockTechnician[] = techs;
