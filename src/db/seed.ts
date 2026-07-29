/**
 * KongoFix — Seed de la base de données SQLite
 *
 * Usage :
 *   bun run src/db/seed.ts
 *
 * Insère :
 *   - 1 compte admin
 *   - 12 techniciens (issus de mock-technicians.ts)
 *   - 5 comptes clients de test
 *   - Quelques demandes d'exemple
 */

import { dbRun, dbQuery, generateUUID, nowISO } from "./sqlite";

async function seed() {
  console.log("🌱 Démarrage du seed...");

  const now = nowISO();
  const hashedPw = await Bun.password.hash('password123');
  const hashedAdminPw = await Bun.password.hash('admin123');

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------
  const adminExists = dbQuery<{ id: string }>(
    "SELECT id FROM users WHERE email = 'admin@kongofix.com'"
  );
  if (!adminExists) {
    const adminId = generateUUID();
    dbRun(
      `INSERT INTO users (id, full_name, phone, email, password_hash, role, verified, created_at)
       VALUES (?, 'Administrateur KongoFix', '+242000000000', 'admin@kongofix.com', '${hashedAdminPw}', 'admin', 1, ?)`,
      adminId, now
    );
    console.log("  ✅ Admin: admin@kongofix.com / admin123");
  } else {
    console.log("  ⏭️ Admin déjà présent");
  }

  // ---------------------------------------------------------------------------
  // Techniciens
  // ---------------------------------------------------------------------------
  const existingTechs = (dbQuery<{ cnt: number }>(
    "SELECT COUNT(*) as cnt FROM technicians"
  ))?.cnt || 0;

  if (existingTechs > 0) {
    console.log(`  ⏭️ ${existingTechs} techniciens déjà présents, seed ignoré`);
    return;
  }

  const technicians = [
    {
      fullName: "Jean-Pierre Makosso", phone: "+2420555123456", email: "jp.makosso@email.cg",
      city: "Brazzaville", neighborhood: "Poto-Poto", specialties: ["Électricien"],
      yearsExperience: 8, description: "Électricien qualifié avec 8 ans d'expérience en installation et dépannage.",
      tariff: "À partir de 15 000 FCFA", languages: "Français, Lingala",
      identityDoc: "/docs/identity_makosso.pdf",
      certifications: ["Certificat_Électricité_BTP.pdf"],
      status: "verified" as const, rating: 4.7, reviewCount: 42, totalInterventions: 156,
    },
    {
      fullName: "Marie-France Ngoma", phone: "+2420666123456", email: "mf.ngoma@email.cg",
      city: "Pointe-Noire", neighborhood: "Centre-ville", specialties: ["Plombier"],
      yearsExperience: 5, description: "Plombière professionnelle, interventions rapides et soignées.",
      tariff: "À partir de 12 000 FCFA", languages: "Français, Kikongo",
      identityDoc: "/docs/identity_ngoma.pdf",
      certifications: ["CAP_Plomberie.pdf"],
      status: "verified" as const, rating: 4.5, reviewCount: 28, totalInterventions: 89,
    },
    {
      fullName: "Alain Tchicaya", phone: "+2420555987654", email: "a.tchicaya@email.cg",
      city: "Brazzaville", neighborhood: "Moungali", specialties: ["Climatisation"],
      yearsExperience: 12, description: "Expert en climatisation et ventilation, maintenance et installation.",
      tariff: "À partir de 20 000 FCFA", languages: "Français, Anglais",
      identityDoc: "/docs/identity_tchicaya.pdf",
      certifications: ["Certification_Clim_Froid.pdf", "Habilitation_Gaz.pdf"],
      status: "verified" as const, rating: 4.9, reviewCount: 67, totalInterventions: 230,
    },
    {
      fullName: "Brigitte Okombi", phone: "+2420444123456", email: "b.okombi@email.cg",
      city: "Brazzaville", neighborhood: "Bacongo", specialties: ["Menuisier"],
      yearsExperience: 6, description: "Menuisière-ébéniste, fabrication et réparation de meubles.",
      tariff: "À partir de 18 000 FCFA", languages: "Français",
      identityDoc: "/docs/identity_okombi.pdf",
      certifications: [],
      status: "verified" as const, rating: 4.3, reviewCount: 15, totalInterventions: 47,
    },
    {
      fullName: "Christian Mabiala", phone: "+2420777888999", email: "c.mabiala@email.cg",
      city: "Brazzaville", neighborhood: "Talangaï", specialties: ["Électricien", "Plombier"],
      yearsExperience: 3, description: "Technicien polyvalent en électricité et plomberie, interventions à domicile.",
      tariff: "À partir de 10 000 FCFA", languages: "Français",
      identityDoc: "/docs/identity_mabiala.pdf",
      certifications: ["Attestation_Formation_Elec.pdf"],
      status: "pending" as const, rating: 0, reviewCount: 0, totalInterventions: 0,
    },
    {
      fullName: "Sylvie Bouesso", phone: "+2420555666777", email: "s.bouesso@email.cg",
      city: "Pointe-Noire", neighborhood: "Loandjili", specialties: ["Peintre"],
      yearsExperience: 7, description: "Peintre décoratrice avec 7 ans d'expérience, spécialisée en finitions intérieures.",
      tariff: "À partir de 25 000 FCFA", languages: "Français, Anglais",
      identityDoc: "/docs/identity_bouesso.pdf",
      certifications: ["Certificat_Peinture_Déco.pdf", "Portfolio_Bouesso.pdf"],
      status: "pending" as const, rating: 0, reviewCount: 0, totalInterventions: 0,
    },
    {
      fullName: "Guy Mpassi", phone: "+2420333444555", email: "g.mpassi@email.cg",
      city: "Brazzaville", neighborhood: "Ouenzé", specialties: ["Climatisation"],
      yearsExperience: 4, description: "Technicien de maintenance en climatisation et froid commercial.",
      tariff: "À partir de 15 000 FCFA", languages: "Français",
      identityDoc: "/docs/identity_mpassi.pdf",
      certifications: [],
      status: "pending" as const, rating: 0, reviewCount: 0, totalInterventions: 0,
    },
    {
      fullName: "Patience Nkouka", phone: "+2420111222333", email: "p.nkouka@email.cg",
      city: "Dolisie", neighborhood: "Centre-ville", specialties: ["Menuisier", "Peintre"],
      yearsExperience: 10, description: "Artisan menuisier et peintre, rénovation complète d'intérieur.",
      tariff: "À partir de 30 000 FCFA", languages: "Français, Lingala",
      identityDoc: "/docs/identity_nkouka.pdf",
      certifications: ["CAP_Menuiserie.pdf", "Attestation_Peinture.pdf"],
      status: "pending" as const, rating: 0, reviewCount: 0, totalInterventions: 0,
    },
    {
      fullName: "Faux Profil", phone: "+2420999888777", email: "faux@email.cg",
      city: "Brazzaville", neighborhood: "Inconnu", specialties: ["Électricien"],
      yearsExperience: 1, description: "Profil suspect avec documents non conformes.",
      tariff: "À partir de 5 000 FCFA", languages: "Français",
      identityDoc: "/docs/identity_faux.pdf",
      certifications: [],
      status: "rejected" as const, rating: 0, reviewCount: 0, totalInterventions: 0,
      rejectionReason: "Documents d'identité non conformes.",
    },
    // Additional verified technicians for catalog
    {
      fullName: "Jean Koumba", phone: "+2420555000111", email: "j.koumba@email.cg",
      city: "Brazzaville", neighborhood: "Brazzaville Centre", specialties: ["Électricien"],
      yearsExperience: 11, description: "Électricien certifié avec plus de 10 ans d'expérience en installations résidentielles et industrielles.",
      tariff: "15 000 FCFA / intervention de base", languages: "Français",
      identityDoc: "/docs/identity_koumba.pdf",
      certifications: ["BT Électrotechnique", "Habilitation Électrique"],
      status: "verified" as const, rating: 4.8, reviewCount: 47, totalInterventions: 312,
    },
    {
      fullName: "Marie Ngakosso", phone: "+2420666000222", email: "m.ngakosso@email.cg",
      city: "Pointe-Noire", neighborhood: "Pointe-Noire", specialties: ["Plombier"],
      yearsExperience: 8, description: "Plombière expérimentée intervenant sur tous types de travaux de plomberie.",
      tariff: "12 000 FCFA / intervention de base", languages: "Français",
      identityDoc: "/docs/identity_ngakosso.pdf",
      certifications: ["CAP Installateur Sanitaire", "Certification Qualiplomb"],
      status: "verified" as const, rating: 4.9, reviewCount: 63, totalInterventions: 458,
    },
    {
      fullName: "Pascal Mabiala", phone: "+2420777000333", email: "p.mabiala@email.cg",
      city: "Brazzaville", neighborhood: "Brazzaville Nord", specialties: ["Climatisation"],
      yearsExperience: 7, description: "Technicien frigoriste spécialisé en climatisation et ventilation.",
      tariff: "20 000 FCFA / intervention de base", languages: "Français",
      identityDoc: "/docs/identity_pmabiala.pdf",
      certifications: ["BP Fluides Énergies Domotique"],
      status: "verified" as const, rating: 4.7, reviewCount: 35, totalInterventions: 198,
    },
  ];

  for (const t of technicians) {
    const techId = generateUUID();
    const userId = generateUUID();

    // Create user
    dbRun(
      `INSERT INTO users (id, full_name, phone, email, password_hash, role, verified, created_at)
       VALUES (?, ?, ?, ?, '${hashedPw}', 'technicien', ?, ?)`,
      userId, t.fullName, t.phone, t.email,
      t.status === "verified" ? 1 : 0, now
    );

    // Create technician
    dbRun(
      `INSERT INTO technicians (
        id, user_id, full_name, phone, email, password_hash, photo_url,
        city, neighborhood, specialties, years_experience, description,
        tariff, languages, identity_doc, certifications, portfolio,
        status, availability, working_hours, rating, review_count,
        total_interventions, rejection_reason, created_at
      ) VALUES (?, ?, ?, ?, ?, '${hashedPw}', '', ?, ?, ?, ?, ?, ?, ?, ?, ?, '[]', ?, 'offline', '{"start":"08:00","end":"18:00"}', ?, ?, ?, ?, ?)`,
      techId, userId,
      t.fullName, t.phone, t.email,
      t.city, t.neighborhood,
      JSON.stringify(t.specialties), t.yearsExperience,
      t.description, t.tariff, t.languages || "",
      t.identityDoc, JSON.stringify(t.certifications),
      t.status, t.rating, t.reviewCount,
      t.totalInterventions, (t as any).rejectionReason || null, now
    );

    console.log(`  ✅ Technicien: ${t.fullName} (${t.status})`);
  }

  // ---------------------------------------------------------------------------
  // Clients de test
  // ---------------------------------------------------------------------------
  const clients = [
    { fullName: "Alain Matingou", phone: "+2420500111001", email: "alain.matingou@email.cg" },
    { fullName: "Christelle Ngoma", phone: "+2420500111002", email: "christelle.ngoma@email.cg" },
    { fullName: "François Tchicaya", phone: "+2420500111003", email: "francois.tchicaya@email.cg" },
    { fullName: "Marie Okombi", phone: "+2420500111004", email: "marie.okombi@email.cg" },
    { fullName: "Paul Boukaka", phone: "+2420500111005", email: "paul.boukaka@email.cg" },
  ];

  const clientIds: string[] = [];

  for (const c of clients) {
    const clientId = generateUUID();
    dbRun(
      `INSERT INTO users (id, full_name, phone, email, password_hash, role, verified, created_at)
       VALUES (?, ?, ?, ?, '${hashedPw}', 'client', 1, ?)`,
      clientId, c.fullName, c.phone, c.email, now
    );
    clientIds.push(clientId);
    console.log(`  ✅ Client: ${c.fullName}`);
  }

  // ---------------------------------------------------------------------------
  // Demandes d'exemple
  // ---------------------------------------------------------------------------
  const today = new Date();
  const dateStr = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
  };

  const sampleRequests = [
    {
      category: "Électricien", date: dateStr(today), timeSlot: "10:00 - 12:00",
      urgency: "urgent" as const, street: "45 Avenue de l'Indépendance",
      neighborhood: "Poto-Poto", city: "Brazzaville",
      description: "Panne totale de courant dans l'appartement, le disjoncteur principal saute en permanence.",
      status: "pending" as const, clientIdx: 0,
    },
    {
      category: "Électricien", date: dateStr(today), timeSlot: "14:00 - 16:00",
      urgency: "normal" as const, street: "12 Rue Mbochi",
      neighborhood: "Moungali", city: "Brazzaville",
      description: "Installation de prises électriques supplémentaires dans le salon et la chambre.",
      status: "pending" as const, clientIdx: 1,
    },
    {
      category: "Électricien", date: dateStr(daysAgo(-1)), timeSlot: "08:00 - 10:00",
      urgency: "normal" as const, street: "78 Boulevard Denis Sassou Nguesso",
      neighborhood: "Centre-ville", city: "Brazzaville",
      description: "Remplacement du tableau électrique complet, mise aux normes.",
      status: "pending" as const, clientIdx: 2,
    },
    {
      category: "Plombier", date: dateStr(today), timeSlot: "08:00 - 10:00",
      urgency: "urgent" as const, street: "3 Impasse de la Paix",
      neighborhood: "Bacongo", city: "Brazzaville",
      description: "Fuite d'eau importante dans la salle de bain, risque d'inondation.",
      status: "accepted" as const, clientIdx: 3,
    },
    {
      category: "Climatisation", date: dateStr(today), timeSlot: "12:00 - 14:00",
      urgency: "normal" as const, street: "22 Avenue Matsoua",
      neighborhood: "Ouenzé", city: "Brazzaville",
      description: "Climatiseur qui ne refroidit plus, nécessite une recharge ou réparation.",
      status: "accepted" as const, clientIdx: 4,
    },
    {
      category: "Menuisier", date: dateStr(daysAgo(1)), timeSlot: "10:00 - 12:00",
      urgency: "normal" as const, street: "67 Rue de la Liberté",
      neighborhood: "Poto-Poto", city: "Brazzaville",
      description: "Réparation d'une porte d'entrée qui ne ferme plus correctement.",
      status: "completed" as const, clientIdx: 0,
    },
    {
      category: "Électricien", date: dateStr(daysAgo(1)), timeSlot: "14:00 - 17:00",
      urgency: "normal" as const, street: "15 Rue Kombo",
      neighborhood: "Talangaï", city: "Brazzaville",
      description: "Installation complète électricité dans un nouveau bâtiment de 3 pièces.",
      status: "completed" as const, clientIdx: 1,
    },
  ];

  // Get the first verified technician ID
  const firstVerifiedTech = dbQuery<{ id: string }>(
    "SELECT id FROM technicians WHERE status = 'verified' ORDER BY created_at ASC LIMIT 1"
  );

  for (let i = 0; i < sampleRequests.length; i++) {
    const req = sampleRequests[i];
    const ref = `PRX-${String(i + 148).padStart(6, "0")}`;
    const reqId = generateUUID();
    const createdAt = req.status === "completed"
      ? daysAgo(2).toISOString()
      : req.date === dateStr(today)
        ? today.toISOString()
        : daysAgo(1).toISOString();

    // Assign technician for non-pending requests
    const techId = req.status !== "pending" && firstVerifiedTech
      ? firstVerifiedTech.id
      : null;

    dbRun(
      `INSERT INTO service_requests (
        id, reference, category, date, time_slot, urgency,
        street, neighborhood, city, description, technician_id,
        client_id, client_name, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      reqId, ref, req.category, req.date, req.timeSlot, req.urgency,
      req.street, req.neighborhood, req.city, req.description,
      techId, clientIds[req.clientIdx], clients[req.clientIdx].fullName,
      req.status, createdAt
    );

    console.log(`  ✅ Demande: ${ref} — ${req.category} (${req.status})`);
  }

  // ---------------------------------------------------------------------------
  // Résumé
  // ---------------------------------------------------------------------------
  const usersCount = (dbQuery<{ cnt: number }>("SELECT COUNT(*) as cnt FROM users"))?.cnt || 0;
  const techsCount = (dbQuery<{ cnt: number }>("SELECT COUNT(*) as cnt FROM technicians"))?.cnt || 0;
  const reqsCount = (dbQuery<{ cnt: number }>("SELECT COUNT(*) as cnt FROM service_requests"))?.cnt || 0;

  console.log("\n📊 Résumé du seed :");
  console.log(`   - ${usersCount} utilisateurs`);
  console.log(`   - ${techsCount} techniciens`);
  console.log(`   - ${reqsCount} demandes`);
  console.log("✅ Seed terminé avec succès !");
}

seed();
