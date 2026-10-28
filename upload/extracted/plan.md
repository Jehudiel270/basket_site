# CourtLink — plan d’implémentation

## Approche

CourtLink est une application Nuxt 3 + TypeScript avec une interface publique et un espace de travail multi-rôles. Le mode démonstration utilise un dépôt centralisé côté client, persistant dans `localStorage`, avec des données et mutations cohérentes pour joueurs, opportunités, candidatures, événements, favoris et notifications. Le repository contract décrit les entités à migrer vers PostgreSQL/Neon pour la production multi-utilisateur.

Neon est connecté par `DATABASE_URL` côté serveur avec un endpoint de santé qui exécute un `select 1` non destructif; Neon Managed Better Auth est préparé par variables d’environnement sans exposer de secret. Cloudinary stocke les médias dans `courtlink/avatars`, avec URLs transformées et signature côté serveur. Le prototype reste immédiatement testable même si le schéma Neon n’est pas encore provisionné.

## Structure du projet

- `app.vue`, `nuxt.config.ts`, `app.config.ts` : shell Nuxt, configuration de marque et runtime.
- `assets/css/main.css` : tokens visuels et composants CSS globaux.
- `components/` : marque, navigation, cartes de joueurs et éléments réutilisables.
- `composables/` : état partagé de démonstration, mutations, notifications et Cloudinary.
- `data/demo.ts`, `data/workflows.ts` : données de réseau et entités de parcours de démonstration.
- `types/` : modèles métier et rôles TypeScript.
- `services/repository.ts` : contrat de dépôt et filtre joueur remplaçables par Neon.
- `pages/` : accueil, annuaires, détails, pages d’information et workspace/admin.
- `server/api/` : santé, ping Neon, état Neon Auth et signature Cloudinary.
- `docs/integrations.md` : conventions et sources officielles d’intégration.
- `public/manus-routes.json` : manifeste de routes demandé par Webdev.

## Design

Styles alternatifs :
1. Terrain éditorial premium — 0,07 : magazine sportif sombre, typographie forte et orange signalétique.
2. Côte atlantique contemporaine — 0,06 : anthracite, ivoire et vert lagon avec chaleur ouest-africaine.
3. Laboratoire de performance — 0,05 : interface data dense, bleu nuit et accents citron.

### Choix : Terrain éditorial premium

- **Mouvement** : direction artistique de magazine sportif haut de gamme, entre vestiaire professionnel et fiche de scouting.
- **Principes** : hiérarchie éditoriale nette, densité maîtrisée, données lisibles en premier, actions contextualisées.
- **Philosophie couleur** : l’anthracite crée la concentration, l’ivoire garde une lecture calme, l’orange `#F97316` évoque le ballon et devient la signature d’action.
- **Paradigme de layout** : rail latéral fixe sur les espaces de travail, contenu en colonnes asymétriques et bandeaux éditoriaux sur les pages publiques.
- **Signatures** : pastille de vérification, ruban orange de scouting et chiffres de performance en grand.
- **Interactions** : chaque action donne un retour immédiat; les filtres et statuts sont persistants; les panneaux évitent de perdre le contexte.
- **Animation** : transitions courtes de 160–220 ms, apparitions en fondu + translation légère, aucun mouvement décoratif permanent.
- **Typographie** : `DM Sans` pour l’interface, `Space Grotesk` pour les titres et statistiques.
- **Essence de marque** : le réseau de confiance qui transforme le potentiel basketball en opportunités vérifiables — précis, humain, ambitieux.
- **Voix** : directe, encourageante et concrète. « Faites circuler votre jeu, pas vos doutes. » / « Une opportunité claire commence par un profil qui dit vrai. »
- **Wordmark & logo** : monogramme `C` formé par deux arcs autour d’un point orange, associé à CourtLink en capitales compactes.
- **Couleur signature** : orange CourtLink `#F97316`.

## Données et intégrations

Le mode démo contient 20 joueurs, 5 organisations, 8 opportunités, 4 événements, statistiques saisonnières, candidatures à plusieurs états, conversations, vérifications, signalements, paiements simulés et audit. Les actions locales couvrent favoris, candidature, inscription événement, changement de rôle et modification de profil. Le passage production prévoit des tables Neon correspondant au repository contract et une authentification Better Auth côté serveur.

Les secrets sont documentés par `.env.example` et lus uniquement côté serveur sauf le cloud name Cloudinary. Les huit visuels basket de démonstration sont rangés dans Cloudinary sous `courtlink/avatars`.

## Build et lancement

- `pnpm install`
- `pnpm dev`
- `pnpm typecheck`
- `pnpm build`
- `pnpm preview`

L’application écoute sur le port 3000 et le serveur de développement expose `GET /manus-routes.json` ainsi que les endpoints de santé sans secret.
