# KongoFix — Services techniques à domicile au Congo 🇨🇬

[![MVP](https://img.shields.io/badge/status-MVP%20complet-brightgreen)](https://kongofix.com)
[![Licence](https://img.shields.io/badge/licence-Tous%20droits%20réservés-red)](./LICENSE)
[![Stack](https://img.shields.io/badge/stack-TanStack%20Start%20%2B%20React-blue)](https://tanstack.com/start)

**KongoFix** est une plateforme web de mise en relation entre particuliers/entreprises et techniciens qualifiés en République du Congo — électriciens, plombiers, menuisiers, climatiseurs, etc. Un client décrit son besoin, choisit un service et une date, et reçoit une mise en relation avec un professionnel vérifié.

🌐 Site : **[kongofix.com](https://kongofix.com)**

---

## 🚀 Fonctionnalités MVP (10/10)

| # | Fonctionnalité | Description |
|---|---------------|-------------|
| 1 | **Recherche de techniciens** | Page d'accueil avec catégories, barre de recherche, profils vérifiés |
| 2 | **Inscription client** | Création de compte avec validation OTP par email |
| 3 | **Inscription technicien** | Inscription avec documents (pièce d'identité, certifications, portfolio) |
| 4 | **Demande d'intervention** | Formulaire complet : service, date, adresse, description, photos |
| 5 | **Tableau de bord technicien** | Vue des demandes reçues, acceptation/refus en un clic |
| 6 | **Espace administrateur** | Validation des techniciens, tableau de bord, statistiques |
| 7 | **Suivi de demande** | Timeline 4 étapes avec notifications (demandé → accepté → en cours → terminé) |
| 8 | **Messagerie intégrée** | Chat client-technicien en temps réel |
| 9 | **Paiements Mobile Money** | Airtel Money, MTN Mobile Money et espèces acceptés |
| 10 | **PWA installable** | Application web progressive, utilisable hors-ligne sur mobile et desktop |

### 🔒 Sécurité
- Mots de passe hashés avec **bcrypt**
- Protection anti brute-force : **rate limiting** (max 5 tentatives/min par email)
- Validation OTP pour inscription et réinitialisation de mot de passe

### 🎨 Interface
- **Design responsive** : optimisé mobile, tablette et desktop
- **Thème clair** pro et accessible
- Composants **shadcn/ui** + **Tailwind CSS**
- **SEO** : meta tags, OG, Twitter Cards, sitemap.xml, JSON-LD

### 📄 Pages
- Accueil, CGU, Confidentialité, Contact, FAQ, À propos
- Témoignages clients, bouton WhatsApp flottant
- Pages 404 et 500 personnalisées
- Squelettes de chargement (loading skeletons)

---

## 🧰 Stack technique

| Catégorie | Technologie |
|-----------|-------------|
| **Framework** | [TanStack Start](https://tanstack.com/start) (React full-stack) |
| **Frontend** | React 19 + TypeScript |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Runtime** | [Bun](https://bun.sh) |
| **Base de données** | PostgreSQL via [Neon](https://neon.tech) (serverless) |
| **Déploiement** | `bun run publish` (one-command) |
| **Email** | Templates HTML personnalisés |

---

## 📁 Architecture

```
kongofix/
├── src/
│   ├── components/          # Composants UI (shadcn/ui + custom)
│   │   └── ui/              # Button, Card, Input, Badge, etc.
│   ├── lib/                 # Utilitaires
│   │   ├── session.ts       # Gestion de session (localStorage)
│   │   ├── rate-limiter.ts  # Protection anti brute-force
│   │   ├── email.ts         # Envoi d'emails
│   │   └── email-templates.ts
│   ├── db/                  # Base de données
│   │   ├── postgres.ts      # Adaptateur PostgreSQL (Neon)
│   │   ├── migrate.ts       # Migrations
│   │   └── seed-pg.ts       # Données initiales
│   ├── server/              # Logique métier (server functions)
│   │   ├── auth.ts          # Authentification clients
│   │   ├── technician.ts    # Gestion techniciens
│   │   ├── admin.ts         # Administration
│   │   ├── requests.ts      # Demandes d'intervention
│   │   ├── payments.ts      # Paiements Mobile Money
│   │   └── messages.ts      # Messagerie
│   ├── routes/              # Pages (file-based routing)
│   │   ├── client/          # Espace client
│   │   ├── technicien/      # Espace technicien
│   │   └── admin/           # Espace administrateur
│   ├── styles/              # CSS global
│   └── routeTree.gen.ts     # Route tree auto-généré
├── public/                  # Assets statiques
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .env                     # Variables d'environnement
```

---

## ⚙️ Installation

### Prérequis
- [Bun](https://bun.sh) ≥ 1.x
- PostgreSQL (local ou [Neon](https://neon.tech) cloud)

### Démarrage rapide

```bash
# Cloner le repo
git clone https://github.com/blondel12/Kongofix.git
cd Kongofix

# Installer les dépendances
bun install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer en développement
bun run dev
```

L'application est accessible sur **http://localhost:3000**.

---

## 🔧 Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Base de données PostgreSQL (Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# API Email (optionnel)
EMAIL_API_URL=https://api.email-service.com/send
EMAIL_API_KEY=votre-clé-api
```

---

## 🚢 Déploiement

```bash
bun run publish
```

Cette commande build l'application et la redéploie automatiquement sur le serveur de production.

---

## 👥 Rôles utilisateurs

| Rôle | Accès |
|------|-------|
| **Client** | Recherche, demande d'intervention, suivi, messagerie, paiement |
| **Technicien** | Réception de demandes, profil éditable, statistiques |
| **Admin** | Validation des techniciens, dashboard, supervision |

---

## 📜 Licence

**Tous droits réservés** — KongoFix (ex-ProxiServ).  
Ce code est privé et ne peut être copié, modifié ou redistribué sans autorisation explicite.

---

## 📞 Contact

- **WhatsApp** : [+242 06 543 18 06](https://wa.me/242065431806)
- **Email** : contact@kongofix.com
- **Site** : [kongofix.com](https://kongofix.com)

---

*Built with ❤️ in Congo-Brazzaville 🇨🇬*
