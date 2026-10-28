# Worklog — CourtLink

---
Task ID: 1
Agent: Z.ai (principal)
Task: Reconstruire CourtLink (prototype SaaS de recrutement basketball) à partir du zip Nuxt « mou » en une application Next.js 16 complète, animée, thème basketball 3D interactive, prête à démontrer.

Work Log:
- Extrait et analysé upload/code_2.zip (Nuxt 3, 2 pages géantes, données minimales).
- Consulté https://github.com/Jehudiel270/Animation-kit → GSAP / R3F / Motion retenus comme inspiration technique.
- Initialisé l'environnement fullstack Next.js 16 + shadcn/ui ; installé three, @react-three/fiber, @react-three/drei + polices @fontsource (Space Grotesk, Inter, Orbitron, Share Tech Mono).
- Généré 11 visuels IA cohérents (6 portraits joueurs studio rim-light orange, arène, dunk, académie, club, événement) via scripts/gen-images.mjs.
- Couche données : src/lib/types.ts (28 entités), demo-data.ts (24 joueurs détaillés 10 pays, 8 organisations, 10 opportunités, 5 événements, candidatures, conversations, vérifications, signalements, tickets, paiements, plans FCFA, audit, scouting, consentements), store.ts (Zustand + persist localStorage + ~35 actions métier + audit + notifications), permissions.ts (8 rôles, menus, gardes de routes), router.ts (navigation par hash).
- Design system : globals.css — thème sombre/clair (OKLCH), orange ballon #FF6B1A, scrollbar personnalisée, sélection orange, classes signature (btn-ball, card-court, court-lines-bg, marquee, LED, ball-loader, confettis, reveal).
- Scène 3D (components/three/CourtScene.tsx) : ballon texturé procédural (coutures + grain), panier (panneau COURTLINK, arceau, filet 12 segments avec balancement), tirs en parabole auto/manuel, confettis instanciés, ombres de contact, parallaxe caméra, responsive mobile.
- Hero (components/home/Hero.tsx) : tableau de score LED Orbitron (SCORE/TIRS/PANIERS/SÉRIE), pop « +3 PTS / RATÉ », boutons TIRER/AUTO/Reset, click sur le ballon.
- Landing : moteur de découverte, marquee, compteurs animés (IO + rAF), profils en vedette, opportunités, 3 parcours, grille 8 rôles, témoignages, aperçu tarifs, CTA dunk.
- 23 routes publiques : annuaires joueurs/clubs filtrables, profils détaillés (stats par saison, vidéos, références, visibilité), opportunités + détail + candidature dialog, événements + inscription, tarifs + checkout 3 étapes, FAQ, contact→ticket, signalement, connexion (8 comptes démo), inscription avec choix de rôle, récupération, confidentialité, conditions, 404.
- Espaces de travail : Shell sidebar par rôle + notifications + gardes d'accès.
  - Joueur : dashboard, éditeur profil (stats + visibilité + preview), répertoire, candidatures (timeline), invitations, clubs suivis, paramètres.
  - Tuteur : mineurs, consentements, visibilité, suivi, alertes.
  - Club : dashboard, recherche avancée (filtres + comparaison + favoris + recherche sauvegardée), pipeline kanban drag&drop, gestion + publication d'opportunités, organisation/staff, analytique.
  - Scout : prospection, favoris, comparateur 3 colonnes, rapports de scouting, notes privées, recherches.
  - Organisateur : événements, création, inscriptions (statuts présence), résultats.
  - Modérateur : vérifications (décisions justifiées → badges), signalements, contenus masqués, suspects (suspension), journal.
  - Support : tickets (réponses), paiements simulés, litiges/remboursements.
  - Admin : 15 vues (vue globale, utilisateurs, organisations, joueurs, opportunités, événements, modération, tickets, plans éditables, contenus/marque, notifications, paramètres, audit, admins).
- Vérifié au navigateur (agent-browser) : 23 routes publiques + 15 admin + 17 workspace = 55/55 OK ; parcours A→H testés de bout en bout ; captures desktop + mobile ; corrections (opacité cartes, clés dupliquées footer, garde de permissions, Target/cn manquants, bouton ghost sur canvas WebGL, ThemeProvider next-themes, compteur TIRS auto).

Stage Summary:
- Application livrée : Next.js 16 + TS + Tailwind 4 + Zustand persist, ~40 fichiers modulaires, 0 erreur lint.
- 3D basketball interactive avec compteur LED pro fonctionnelle (auto + manuel), responsive.
- 8 rôles × menus/pages/permissions distincts ; parcours A-H opérationnels ; persistence localStorage ; réinitialisation démo.
- Reste simulé : authentification, paiements, stockage (localStorage), vidéos (liens externes) — à migrer vers API/DB réelle.
