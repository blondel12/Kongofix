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
  {
    id: "13", fullName: "Guy Mpassi", specialty: "Serrurier",
    description: "Serrurier métallier avec 14 ans de métier. Ouverture de portes, remplacement de serrures, blindage, dépannage urgent. Agréé par les assurances.",
    yearsExperience: 14, zone: "Brazzaville Centre", city: "Brazzaville",
    tariff: "15 000 FCFA / intervention de base", rating: 4.7, reviewCount: 52,
    totalInterventions: 380, satisfactionRate: 93, verified: true, initials: "GM",
    avatarUrl: "https://ui-avatars.com/api/?name=Guy+Mpassi&background=059669&color=fff&size=128", portfolio: [],
    certifications: ["CAP Serrurerie Métallerie", "Agrément Assurance"],
    reviews: [
      { author: "Robert K.", rating: 5, comment: "Ouverture de porte en 10 minutes. Propre, rapide, sans dégât.", date: "2026-07-15" },
      { author: "Florence M.", rating: 5, comment: "Remplacement de toutes les serrures après un cambriolage. Très rassurant.", date: "2026-06-28" },
      { author: "Didier T.", rating: 4, comment: "Bon serrurier, tarif correct pour un dimanche.", date: "2026-05-20" },
    ],
  },
  {
    id: "14", fullName: "Nadine Bouka", specialty: "Vitrier",
    description: "Vitrière spécialisée en vitrage résidentiel et commercial. Remplacement de vitres, doubles vitrages, miroiterie sur mesure, réparation de baies vitrées.",
    yearsExperience: 9, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "12 000 FCFA / déplacement inclus", rating: 4.8, reviewCount: 36,
    totalInterventions: 210, satisfactionRate: 95, verified: true, initials: "NB",
    avatarUrl: "https://ui-avatars.com/api/?name=Nadine+Bouka&background=d97706&color=fff&size=128", portfolio: [],
    certifications: ["CAP Vitrerie Miroiterie", "Certification Double Vitrage"],
    reviews: [
      { author: "Claude N.", rating: 5, comment: "Remplacement de la baie vitrée du salon. Parfait, mesures impeccables.", date: "2026-07-08" },
      { author: "Alice D.", rating: 5, comment: "Vitrerie sur mesure pour ma véranda. Délais respectés, travail soigné.", date: "2026-06-15" },
      { author: "Yves M.", rating: 4, comment: "Bonne prestation, un peu de retard à la livraison mais résultat impeccable.", date: "2026-05-22" },
    ],
  },
  {
    id: "15", fullName: "Christian Tsoumou", specialty: "Carreleur",
    description: "Carreleur professionnel spécialisé en pose de carrelage, faïence et pierre naturelle. Rénovation de salles de bain, cuisines, terrasses. Finitions soignées.",
    yearsExperience: 11, zone: "Brazzaville Nord", city: "Brazzaville",
    tariff: "20 000 FCFA / m²", rating: 4.6, reviewCount: 43,
    totalInterventions: 275, satisfactionRate: 92, verified: true, initials: "CT",
    avatarUrl: "https://ui-avatars.com/api/?name=Christian+Tsoumou&background=7c3aed&color=fff&size=128", portfolio: [],
    certifications: ["CAP Carrelage", "Formation Pose Pierre Naturelle"],
    reviews: [
      { author: "Simone B.", rating: 5, comment: "Carrelage de tout le salon, coupe parfaite et joints impeccables.", date: "2026-07-01" },
      { author: "Patrick L.", rating: 5, comment: "Rénovation complète de la salle de bain. Un travail d'artisan.", date: "2026-06-10" },
      { author: "Hélène F.", rating: 4, comment: "Très bon carreleur, propre et respectueux des délais.", date: "2026-05-18" },
    ],
  },
  {
    id: "16", fullName: "Raymond Kaya", specialty: "Électricien",
    description: "Électricien bâtiment spécialisé en rénovation électrique complète. Mise aux normes, installation de tableaux, prises connectées et éclairage LED.",
    yearsExperience: 16, zone: "Brazzaville Sud", city: "Brazzaville",
    tariff: "18 000 FCFA / intervention de base", rating: 4.9, reviewCount: 68,
    totalInterventions: 520, satisfactionRate: 98, verified: true, initials: "RK",
    avatarUrl: "https://ui-avatars.com/api/?name=Raymond+Kaya&background=dc2626&color=fff&size=128", portfolio: [],
    certifications: ["BTS Électrotechnique", "Habilitation Électrique HT", "Certification KNX"],
    reviews: [
      { author: "Éric V.", rating: 5, comment: "30 ans de métier et une compétence rare. Rénovation électrique totale de ma maison.", date: "2026-07-20" },
      { author: "Josiane M.", rating: 5, comment: "Installation domotique de base. Raymond maîtrise son sujet.", date: "2026-06-22" },
      { author: "Louis P.", rating: 5, comment: "Le meilleur électricien que j'aie jamais vu. Méticuleux et pédagogue.", date: "2026-05-30" },
      { author: "Caroline R.", rating: 4, comment: "Excellent travail mais planning chargé, il faut s'y prendre à l'avance.", date: "2026-05-10" },
    ],
  },
  {
    id: "17", fullName: "Sylvie Itoua", specialty: "Plombier",
    description: "Plombière qualifiée intervenant en urgence et sur travaux programmés. Spécialiste du débouchage haute pression et de l'installation de chauffe-eaux.",
    yearsExperience: 6, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "15 000 FCFA / intervention de base", rating: 4.6, reviewCount: 24,
    totalInterventions: 160, satisfactionRate: 91, verified: true, initials: "SI",
    avatarUrl: "https://ui-avatars.com/api/?name=Sylvie+Itoua&background=0891b2&color=fff&size=128", portfolio: [],
    certifications: ["CAP Plomberie", "Formation Chauffe-Eaux Solaires"],
    reviews: [
      { author: "Jean-Pierre K.", rating: 5, comment: "Débouchage express, elle a résolu le problème en 30 minutes.", date: "2026-07-14" },
      { author: "Marianne S.", rating: 4, comment: "Installation de chauffe-eau efficace. Bon rapport qualité-prix.", date: "2026-06-18" },
      { author: "Georges N.", rating: 5, comment: "Intervention d'urgence à 23h pour une fuite. Réactive et efficace.", date: "2026-05-25" },
    ],
  },
  {
    id: "18", fullName: "Albert Bakala", specialty: "Menuisier",
    description: "Menuisier ébéniste, fabricant de meubles en bois massif. Spécialisé en portes, fenêtres, escaliers, et mobilier traditionnel congolais.",
    yearsExperience: 20, zone: "Brazzaville Centre", city: "Brazzaville",
    tariff: "25 000 FCFA / intervention de base", rating: 4.9, reviewCount: 85,
    totalInterventions: 620, satisfactionRate: 97, verified: true, initials: "AB",
    avatarUrl: "https://ui-avatars.com/api/?name=Albert+Bakala&background=4f46e5&color=fff&size=128", portfolio: [],
    certifications: ["CAP Menuiserie", "BTM Ébénisterie", "Meilleur Ouvrier Congo 2018"],
    reviews: [
      { author: "Daniel M.", rating: 5, comment: "Albert a fabriqué mes portes en bois massif. Un vrai maître ébéniste.", date: "2026-07-22" },
      { author: "Geneviève K.", rating: 5, comment: "Escalier sur mesure magnifique. 20 ans d'expérience ça se voit.", date: "2026-06-25" },
      { author: "Raoul T.", rating: 5, comment: "Meubles de salon traditionnels sublimes. Une pointure.", date: "2026-06-01" },
      { author: "Suzanne P.", rating: 5, comment: "Très cher mais la qualité est incomparable. Du sur-mesure d'exception.", date: "2026-05-12" },
    ],
  },
  {
    id: "19", fullName: "Dorothée Mounguengue", specialty: "Climatiseur",
    description: "Technicienne climatisation et froid commercial. Spécialiste des climatiseurs gainables et des chambres froides. Maintenance préventive et curative.",
    yearsExperience: 8, zone: "Brazzaville Nord", city: "Brazzaville",
    tariff: "22 000 FCFA / intervention de base", rating: 4.5, reviewCount: 29,
    totalInterventions: 178, satisfactionRate: 90, verified: true, initials: "DM",
    avatarUrl: "https://ui-avatars.com/api/?name=Dorothee+Mounguengue&background=be185d&color=fff&size=128", portfolio: [],
    certifications: ["BTS Fluides Énergies", "Attestation Froid Commercial", "Agrément Daikin"],
    reviews: [
      { author: "Philippe B.", rating: 4, comment: "Installation de clim gainable au bureau. Travail technique maîtrisé.", date: "2026-07-11" },
      { author: "Léa N.", rating: 5, comment: "Maintenance de la chambre froide du restaurant. Rapide et efficace.", date: "2026-06-20" },
      { author: "Armand S.", rating: 4, comment: "Bon dépannage, légèrement en retard mais le travail est bon.", date: "2026-05-15" },
    ],
  },
  {
    id: "20", fullName: "Jacques Poaty", specialty: "Peintre",
    description: "Peintre décorateur professionnel. Peinture intérieure et extérieure, enduits décoratifs, effets de matière. Conseils en décoration et harmonie des couleurs.",
    yearsExperience: 7, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "12 000 FCFA / intervention de base", rating: 4.4, reviewCount: 18,
    totalInterventions: 98, satisfactionRate: 88, verified: false, initials: "JP",
    avatarUrl: "https://ui-avatars.com/api/?name=Jacques+Poaty&background=65a30d&color=fff&size=128", portfolio: [],
    certifications: ["CAP Peinture Revêtement", "Formation Enduits Décoratifs"],
    reviews: [
      { author: "Viviane L.", rating: 5, comment: "Enduit décoratif dans le salon, effet béton ciré magnifique.", date: "2026-07-18" },
      { author: "Cédric M.", rating: 4, comment: "Peinture complète de l'appartement. Bon travail, prix raisonnable.", date: "2026-06-12" },
      { author: "Amandine R.", rating: 4, comment: "Bon peintre, encore un peu jeune mais prometteur.", date: "2026-05-05" },
    ],
  },
  {
    id: "21", fullName: "Pauline Ndengue", specialty: "Serrurier",
    description: "Serrurière spécialiste en dépannage urgent et sécurisation de domicile. Installation de portes blindées, volets roulants, rideaux métalliques et alarmes.",
    yearsExperience: 12, zone: "Pointe-Noire", city: "Pointe-Noire",
    tariff: "18 000 FCFA / intervention de base", rating: 4.8, reviewCount: 47,
    totalInterventions: 410, satisfactionRate: 96, verified: true, initials: "PN",
    avatarUrl: "https://ui-avatars.com/api/?name=Pauline+Ndengue&background=c026d3&color=fff&size=128", portfolio: [],
    certifications: ["CAP Serrurerie", "Certification Portes Blindées", "Agrément Volets Roulants"],
    reviews: [
      { author: "Thierry H.", rating: 5, comment: "Installation de porte blindée. Pauline connaît parfaitement son métier.", date: "2026-07-25" },
      { author: "Marlène K.", rating: 5, comment: "Intervention nocturne pour une serrure cassée, en 20 minutes c'était réglé.", date: "2026-06-30" },
      { author: "Fabrice D.", rating: 4, comment: "Bon travail de sécurisation sur ma boutique.", date: "2026-05-28" },
    ],
  },
  {
    id: "22", fullName: "Marcel Loubaki", specialty: "Carreleur",
    description: "Carreleur faïencier, spécialiste des finitions de luxe. Pose de mosaïque, zellige, terre cuite et grès cérame. Rénovation haut de gamme.",
    yearsExperience: 15, zone: "Brazzaville Centre", city: "Brazzaville",
    tariff: "25 000 FCFA / m²", rating: 5.0, reviewCount: 72,
    totalInterventions: 340, satisfactionRate: 99, verified: true, initials: "ML",
    avatarUrl: "https://ui-avatars.com/api/?name=Marcel+Loubaki&background=ea580c&color=fff&size=128", portfolio: [],
    certifications: ["CAP Carrelage", "Formation Zellige Marocain", "Certification Mosaïque"],
    reviews: [
      { author: "Béatrice F.", rating: 5, comment: "Mosaïque artisanale dans la salle de bain. Une œuvre d'art !", date: "2026-07-30" },
      { author: "Sébastien G.", rating: 5, comment: "Marcel est le meilleur carreleur de Brazzaville, sans aucune hésitation.", date: "2026-07-10" },
      { author: "Nathalie Z.", rating: 5, comment: "Pose de zellige dans la cuisine. Perfectionniste, un régal.", date: "2026-06-18" },
      { author: "Richard J.", rating: 5, comment: "15 ans d'expérience et ça se voit. Tarif élevé mais qualité exceptionnelle.", date: "2026-05-22" },
    ],
  },
  {
    id: "23", fullName: "Esther Goma", specialty: "Vitrier",
    description: "Vitrière miroitière, experte en vitrage de sécurité et verre feuilleté. Remplacement de pare-brise, vitrines de magasin, garde-corps en verre.",
    yearsExperience: 10, zone: "Brazzaville Sud", city: "Brazzaville",
    tariff: "15 000 FCFA / déplacement inclus", rating: 4.6, reviewCount: 28,
    totalInterventions: 195, satisfactionRate: 91, verified: true, initials: "EG",
    avatarUrl: "https://ui-avatars.com/api/?name=Esther+Goma&background=0d9488&color=fff&size=128", portfolio: [],
    certifications: ["CAP Vitrerie", "Certification Verre Trempé", "Agrément Sécurité Incendie"],
    reviews: [
      { author: "Charles L.", rating: 5, comment: "Remplacement du pare-brise de ma vitrine en 2h. Propre et rapide.", date: "2026-07-19" },
      { author: "Dorine M.", rating: 4, comment: "Garde-corps en verre installé. Bon travail, mesures précises.", date: "2026-06-25" },
      { author: "Emmanuel T.", rating: 5, comment: "Vitrage de sécurité pour mon commerce. Esther connaît les normes.", date: "2026-05-15" },
    ],
  },
  {
    id: "24", fullName: "Franck Yoka", specialty: "Climatiseur",
    description: "Technicien climatisation résidentielle et tertiaire. Installation de splits, multisplits et VRV. Contrats de maintenance pour entreprises et particuliers.",
    yearsExperience: 5, zone: "Brazzaville Nord", city: "Brazzaville",
    tariff: "18 000 FCFA / intervention de base", rating: 4.3, reviewCount: 16,
    totalInterventions: 85, satisfactionRate: 86, verified: false, initials: "FY",
    avatarUrl: "https://ui-avatars.com/api/?name=Franck+Yoka&background=2563eb&color=fff&size=128", portfolio: [],
    certifications: ["BP Fluides Énergies", "Agrément Mitsubishi Electric"],
    reviews: [
      { author: "Vanessa K.", rating: 5, comment: "Installation de 2 splits, travail propre et soigné. Jeune mais compétent.", date: "2026-07-16" },
      { author: "Martin D.", rating: 4, comment: "Maintenance de mes climatiseurs. Bon travail, encore en rodage sur l'administratif.", date: "2026-06-08" },
      { author: "Colette B.", rating: 4, comment: "Dépannage rapide. Bon technicien, tarifs corrects.", date: "2026-05-20" },
    ],
  },
];

export const mockTechnicians: MockTechnician[] = techs;
