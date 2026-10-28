# CourtLink — Documentation de livraison

**Plateforme de recrutement basketball · Bénin & Afrique de l'Ouest**
Prototype complet et interactif — version commerciale de démonstration.

---

## 1. Installation & lancement

```bash
# Dépendances
bun install        # ou : npm install

# Lancement en développement (port 3000)
npm run dev

# Build de production
npm run build
npm run start
```

**URL locale :** http://localhost:3000 — les routes utilisent des ancres `#/` (ex. `#/joueurs`).

**Prérequis :** Node.js 20+, bun ou npm. Aucune base de données requise : les données vivent dans `localStorage` et se réinitialisent depuis l'espace administrateur.

---

## 2. Comptes de démonstration

Page dédiée : **`#/demo`** (ou bouton « Tester les comptes démo » de la page connexion `#/connexion`). Un clic = connexion immédiate au rôle.

| Rôle | Compte | Note |
|---|---|---|
| Joueur | `semevo@demo.courtlink` | Sèmèvo H. — arrière U21, profil vérifié |
| Parent / tuteur | `tuteur@demo.courtlink` | Gérard N. — 2 joueuses mineures, consentements |
| Club / académie | `club@demo.courtlink` | Cotonou Hoopers — pipeline complet |
| Recruteur / scout | `scout@demo.courtlink` | Mamadou B. — rapports & favoris |
| Organisateur | `events@demo.courtlink` | Bénin 3x3 — événements & inscriptions |
| Modérateur | `moderation@demo.courtlink` | Vérifications & signalements |
| Support | `support@demo.courtlink` | Tickets & facturation |
| Administrateur | `admin@demo.courtlink` | Console plateforme complète |

> ⚠️ Le changement de rôle est un **mécanisme de démonstration**, pas une authentification sécurisée. Aucun mot de passe réel n'est nécessaire.

---

## 3. Routes publiques (23)

Accueil `#/` · Joueurs `#/joueurs` + fiche `#/joueurs/:id` · Organisations `#/organisations` + fiche · Opportunités `#/opportunites` + détail · Événements `#/evenements` + détail · Tarifs `#/tarifs` · Fonctionnement joueurs `#/fonctionnement-joueurs` · Fonctionnement clubs `#/fonctionnement-clubs` · FAQ `#/aide` · Contact `#/contact` (→ ticket) · Signalement `#/signaler` · Connexion `#/connexion` · Inscription `#/inscription` · Récupération `#/recuperation` · Confidentialité `#/confidentialite` · Conditions `#/conditions` · Démo `#/demo` · 404 personnalisée.

## 4. Espaces de travail (8 rôles, 17+ vues)

- **Joueur** : tableau de bord, éditeur de profil (stats par saison, vidéos, visibilité), opportunités, candidatures (timeline), invitations, clubs suivis, messages, abonnement, paramètres.
- **Parent / tuteur** : mineurs rattachés, demandes de consentement, contrôle de visibilité, suivi d'activité, alertes. **Un tuteur ne voit jamais les données d'un mineur non rattaché.**
- **Club / académie** : dashboard, recherche avancée multi-critères, pipeline kanban (nouveau → à examiner → présélectionné → contacté → essai proposé → retenu / refusé), publication d'opportunités, comparaison de profils, organisation & staff, analytique.
- **Scout** : prospection, favoris, comparateur 3 colonnes, rapports de scouting structurés, notes privées, recherches sauvegardées.
- **Organisateur** : événements (création), inscriptions avec statut de présence, résultats.
- **Modérateur** : file de vérifications (chaque décision exige un motif), signalements, contenus masqués, suspects (suspension), journal horodaté.
- **Support** : tickets (réponse), paiements simulés (abonnement/remboursement), litiges.
- **Administrateur** : 15 vues — vue globale, utilisateurs, organisations, joueurs, opportunités, événements, modération, tickets, facturation & plans éditables, contenus & marque, notifications, paramètres, journal d'audit, gestion admins, export JSON des données.

## 5. Parcours métier opérationnels (A → H)

| Flux | Chemin de test |
|---|---|
| **A** — Profil → visibilité → page publique | Espace joueur → profil → visibilité « Privé » → vérifier la fiche publique masquée |
| **B** — Offre → candidature → pipeline → dashboard | Club publie → joueur candidate → club déplace le candidat dans le pipeline → statut visible côté joueur |
| **C** — Scout : filtres → comparaison → favoris → notes | Espace scout → recherche avancée → comparer 3 profils → favoris → note privée |
| **D** — Événement → inscription → présence | Organisateur crée → joueur s'inscrit → organisateur marque présent/absent |
| **E** — Vérification → badge | Modérateur approuve/rejette **avec motif obligatoire** → badge mis à jour partout |
| **F** — Messagerie bidirectionnelle | Joueur ↔ scout : envoi, réception, badge non-lu |
| **G** — Modération globale | Suspension d'un compte / masquage d'un contenu → effet immédiat sur toutes les pages |
| **H** — Abonnement → paiement simulé | Tarifs → checkout 3 étapes → confirmation → plan actif dans le workspace |

## 6. Jeu de données de démonstration

24 joueurs (10 pays), 10 clubs/académies, 10 opportunités (dont brouillon et fermée), 5 événements, candidatures à différents stades, conversations, vérifications (en attente/approuvées/rejetées), signalements, tickets, paiements, plans FCFA, consentements, rapports de scouting, journal d'audit. **Toutes les personnes et structures sont fictives.**

## 7. Personnalisation de la marque

Le nom, le logo et les couleurs se changent sans refactor :

- **Couleurs** : variables CSS (`--ball`, `--ball-deep`, `--court`, `--amber-glow`…) dans `src/app/globals.css` — thème sombre/clair en OKLCH.
- **Logo & nom** : composant `Logo` dans `src/components/layout/Chrome.tsx` + textes de marque dans `src/lib/i18n.ts` et le pied de page.
- **Polices** : Space Grotesk (display), Inter (texte), Orbitron/Share Tech Mono (tableaux de score) via `@fontsource`.
- **Tarifs & contenus** : éditables en direct depuis l'espace administrateur.

## 8. Internationalisation (FR / EN)

- Basculer via le sélecteur **FR / EN** dans l'en-tête (choix persisté).
- Dictionnaire central : `src/lib/i18n.ts` — surfaces publiques traduites (navigation, pied de page, accueil, sections).
- Les espaces de travail et les **données de démonstration** restent en français (contenus régionaux fictifs) ; l'architecture permet d'étendre le dictionnaire clé par clé.

## 9. Parties simulées (à remplacer avant production)

| Simulé aujourd'hui | Réalité à implémenter |
|---|---|
| Authentification (rôles démo sans mot de passe) | Auth réelle (OTP/e-mail, hash de mots de passe, sessions) |
| Paiements (checkout 3 étapes) | Mobile Money / cartes via prestataire local, webhooks, reçus |
| Stockage (localStorage, Zustand persist) | API + base de données (Prisma déjà configuré dans le projet) |
| Vidéos highlights (liens externes) | Hébergement/encapsulation vidéo, modération des médias |
| Vérification des documents | Flux KYC avec upload de fichiers et validation humaine |
| Notifications & e-mails | Service d'e-mails/SMS transactionnels |
| Export de données (JSON côté client) | Exports serveur planifiés, conformes RGPD |

## 10. Limites & chantiers avant mise en production

1. **Sécurité** : authentification, sessions, protection CSRF/XSS, rate limiting sur les formulaires publics.
2. **Protection des mineurs** : consentement tuteur **signé** (aujourd'hui simulé), vérification d'identité du tuteur, journalisation des accès aux profils mineurs.
3. **Conformité** : politique RGPD/Loi 09-04 (Bénin) — consentements explicites, droit à l'effacement, DPO, registre des traitements.
4. **Mentions** : aucune promesse de sélection/bourse/contrat (déjà respecté dans les textes) — à valider juridiquement par pays.
5. **Modération** : file temps réel, escalade, traces d'audit inaltérables (aujourd'hui dans localStorage).
6. **Performance** : images optimisées côté CDN, pagination serveur des annuaires, cache.
7. **Accessibilité** : audit complet WCAG AA (contrastes et navigation clavier déjà soignés, à auditer de bout en bout).
8. **Tests** : tests automatisés des 8 flux métier (aujourd'hui testés manuellement).
9. **Paiement** : conformité des prix affichés (TVA, frais de prestataire), factures numérotées.
10. **Sauvegardes** : stratégie de backup et de restauration des données utilisateurs.

## 11. Architecture du code

```
src/
├── app/                    # Layout Next.js, page racine = routeur hash
├── components/
│   ├── three/CourtScene    # Scène 3D (ballon, panier, tirs, confettis)
│   ├── home/               # Hero (tableau LED + 3D) + sections landing
│   ├── public/             # Annuaires, opportunités, tarifs, pages info
│   ├── workspace/          # 8 espaces de rôle (Shell, Player, Club/Scout, Admin, Others, Shared)
│   ├── layout/Chrome       # En-tête public, pied de page, thème, langue
│   ├── common/Bits         # PlayerCard, EmptyState, SectionHead…
│   └── ui/                 # shadcn/ui
└── lib/
    ├── types.ts            # 28 entités typées
    ├── demo-data.ts        # Données de démonstration
    ├── store.ts            # Zustand + persist (~35 actions métier, audit, notifications)
    ├── permissions.ts      # Rôles, menus, gardes de routes, comptes démo
    ├── i18n.ts             # Dictionnaire FR/EN + hook useT
    └── router.ts           # Navigation par hash
```

**Pile technique :** Next.js 16 (App Router, Turbopack) · TypeScript · Tailwind CSS 4 · shadcn/ui · Zustand (persist localStorage) · three.js / @react-three/fiber · lucide-react.

---

## Mise à jour — Mode réel (BDD + authentification)

CourtLink fonctionne désormais en **deux modes**, pilotés par `NEXT_PUBLIC_DATA_SOURCE` :

| Mode | Valeur | Données | Auth |
|---|---|---|---|
| Démonstration | `demo` | localStorage + données fictives | comptes sans mot de passe |
| **Réel** | `api` | vraie base (Neon/SQLite) via `/api/state` + `/api/actions/*` | NextAuth : email + mot de passe bcrypt, sessions JWT |

### Architecture mode réel
- `prisma/schema.prisma` — schéma PostgreSQL de production (24 modèles)
- `prisma/schema.local.prisma` — miroir SQLite pour le sandbox
- `src/lib/auth.ts` + `src/app/api/auth/*` — inscription/connexion réelles
- `src/lib/server/data.ts` — snapshot scopé par rôle (`/api/state`)
- `src/lib/server/actions.ts` — bus d'actions sécurisé (session + ownership + validation)
- `src/app/api/upload` — signature Cloudinary (dossier `courtlink/<type>`)
- `src/lib/api-mode.ts` — client (hydrate + réplication des mutations)

### Commandes
```bash
bun prisma/seed.ts          # admin + plans + comptes démo + contenu (SEED_DEMO=0 pour minimiser)
bunx prisma db push --schema prisma/schema.local.prisma   # sandbox SQLite
bunx prisma db push         # production Neon (après avoir rempli DATABASE_URL)
```

### Comptes réels semés (mot de passe : demo1234 — À CHANGER)
admin@demo.courtlink · semevo@ · tuteur@ · club@ · scout@ · events@ · moderation@ · support@demo.courtlink
+ admin réel : admin@courtlink.bj (mot de passe `courtlink-admin-2026`, à changer via ADMIN_PASSWORD au seed)

### Restant pour la mise en ligne
1. ~~Clés Neon (DATABASE_URL) et Cloudinary (3 valeurs)~~ → **reçues et branchées** (voir `COURTLINK-CLES.md`)
2. Push du repo GitHub (PAT demandé) puis déploiement Vercel (variables d'env listées dans `COURTLINK-CLES.md`)
3. Paiements réels (restent simulés — aucun encaissement) et réinitialisation de mot de passe
   volontairement hors périmètre (« pas mail »).

### Branchement effectué (29 oct 2026)
- Neon connecté : 24 tables poussées + seed complet (9 comptes, 24 joueurs, 8 organisations, 10 opportunités, 5 événements, 7 candidatures)
- Cloudinary branché : signature + upload réel vérifié (`courtlink/photos/…`)
- E2E API 16/16 : auth (login/register/409), snapshot `/api/state` depuis Neon, mutations persistées et relues en base, sécurité (401 sans session, 400 payload invalide, 403 ownership)
- `.env` retiré du suivi git (aucune clé dans l'historique — vérifié par recherche `git log -S`)
- Scripts d'exploitation dans `scripts/` : `real-env.sh` (charge la vraie env malgré le sandbox), `ensure-server.sh`, `verify-db.ts`, `e2e-real.sh`, `get-player-id.ts`, `check-player.ts`, `cleanup-e2e.ts`
- Détail : URL Neon avec `sslmode=require&pgbouncer=true` (`channel_binding=require` non supporté par le parseur Prisma)
