# CourtLink 🏀

Plateforme de recrutement basket-ball pour le Bénin et l'Afrique de l'Ouest francophone :
connecter **joueurs, tuteurs, clubs, scouts, organisateurs** autour de profils vérifiés,
d'opportunités, d'événements et d'un pipeline de recrutement structuré.

> ⚠️ Projet à visée d'aménagement sportif : **aucune promesse de sélection, de bourse ou
> de contrat**. Les paiements sont **simulés** (aucun encaissement) et le périmètre est
> volontairement **sans e-mail** (pas d'envoi de mails transactionnels).

## Fonctions principales

- **9 rôles** : visiteur, joueur, tuteur, club, scout, organisateur, modérateur, support, admin
- Profils joueurs (photos, vidéos, stats par saison) avec **vérification** et consentement tuteur
- Opportunités (try-outs, bourses, tournois) + candidatures et **pipeline de recrutement**
- Événements & inscriptions, messagerie interne, notifications, favoris / suivis
- Modération (signalements, suspension, masquage), support (tickets), facturation simulée
- Interface bilingue **français / anglais**, thème clair / sombre, animation 3D (three.js)

## Deux modes de données

| Mode | `NEXT_PUBLIC_DATA_SOURCE` | Données | Auth |
|---|---|---|---|
| Démonstration | `demo` | localStorage | comptes de démo sans mot de passe |
| **Réel** | `api` | PostgreSQL (Neon) via `/api/state` + `/api/actions/*` | NextAuth : email + mot de passe (bcrypt), sessions JWT |

En mode réel, chaque mutation passe par un **bus d'actions serveur** avec contrôle de
session, d'ownership et validation (401 / 400 / 403). Les médias partent **directement
du navigateur vers Cloudinary** (signature côté serveur, aucun fichier ne transite par l'API).

## Pile technique

Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · shadcn/ui ·
Prisma (PostgreSQL / SQLite) · NextAuth v4 (credentials) · Zustand · three.js / @react-three/fiber

## Démarrage local

```bash
npm install
cp .env.example .env        # renseigner les variables (voir ci-dessous)
npx prisma db push          # crée les tables
bun prisma/seed.ts          # admin + plans + comptes démo (SEED_DEMO=0 pour minimiser)
npm run dev
```

## Variables d'environnement

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | chaîne de connexion PostgreSQL (pooled pour Neon : `…-pooler…?sslmode=require&pgbouncer=true`) |
| `NEXTAUTH_URL` | URL publique de l'app |
| `NEXTAUTH_SECRET` | secret de signature des sessions JWT |
| `NEXT_PUBLIC_DATA_SOURCE` | `demo` ou `api` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | upload photos / vidéos / documents |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | compte super admin créé par le seed (aucune valeur par défaut pour le mot de passe) |

## Scripts d'exploitation (`scripts/`)

- `real-env.sh` — charge le `.env` réel dans le shell (contourne l'env du sandbox)
- `ensure-server.sh` — garantit que le serveur de dev tourne
- `verify-db.ts` / `get-player-id.ts` / `check-player.ts` — contrôles directs en base
- `e2e-real.sh` — suite E2E API complète (auth, snapshot, mutations, sécurité, Cloudinary)
- `cleanup-e2e.ts` — supprime les comptes de test

## Comptes de démonstration & sécurité

- **Admin réel** : `ADMIN_EMAIL` (par défaut `admin@courtlink.bj`) — mot de passe défini via la variable
  d'environnement `ADMIN_PASSWORD` au seed, ou généré aléatoirement et affiché une seule fois dans la console.
  Aucun mot de passe n'est stocké dans ce dépôt.
- **Comptes de démonstration** (`…@demo.courtlink`) : créés avec des hachages aléatoires — aucune connexion
  par mot de passe n'est possible. L'accès visiteur passe par `/api/demo-login` (sessions 12 h, débit limité),
  ouvert ou fermé par un super administrateur depuis la console **Administrateurs** de l'espace de travail.
- **Gestion des accès** : la console permet aussi de réinitialiser le mot de passe d'un membre du staff et de
  modifier son propre mot de passe (aucun e-mail : choix produit « pas mail »).
