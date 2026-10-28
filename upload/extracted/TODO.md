# CourtLink — résultats

## Fondations et identité

- [x] L’application Nuxt TypeScript utilise une architecture modulaire avec composants, pages, types, données, composables et services séparés; un catch-all de démonstration regroupe encore plusieurs vues publiques.
- [x] L’interface par défaut est en français, responsive sur téléphone, tablette et ordinateur, avec navigation publique et rail de travail adaptés aux petits écrans.
- [x] L’identité CourtLink suit une direction sportive premium sombre, ivoire et orange basketball, avec monogramme, typographie et palette documentés dans `plan.md`.
- [x] Le manifeste `public/manus-routes.json` expose les routes publiques, métier et administrateur et répond en HTTP 200.

## Parcours publics

- [x] L’accueil présente proposition de valeur, joueurs en vedette, opportunités récentes, fonctionnement et appels à l’action distincts.
- [ ] Les annuaires de joueurs, clubs/académies, opportunités et événements proposent recherche, filtres, tri et états vides : la recherche et le poste sont fonctionnels pour les joueurs, tandis que les filtres avancés, le tri et les états vides restent à compléter sur les autres annuaires.
- [x] Les profils détaillés, détails d’opportunités et d’événements sont reliés aux données de démonstration et disposent d’actions de candidature, favori ou inscription avec retour toast.
- [x] Les pages tarifs, fonctionnement, aide/FAQ, contact, signalement, connexion, inscription, récupération, confidentialité et conditions sont accessibles et non vides via les routes publiques; [ ] leurs formulaires spécialisés et validations restent à compléter.

## Rôles et espace de travail

- [x] Le sélecteur de démonstration permet d’explorer joueur, parent, club, recruteur, organisateur, modérateur, support et administrateur, avec menus adaptés.
- [x] Les rôles ont des libellés, menus et surfaces d’administration distincts; [ ] l’autorisation serveur et une authentification réelle restent à brancher.
- [ ] Le joueur peut modifier profil, visibilité, statistiques, vidéos et consulter opportunités, candidatures, messages, notifications et abonnement : candidatures, favoris, notifications simulées et suivi sont présents; édition détaillée, vidéos et abonnement restent à compléter.
- [ ] Le parent ne voit que les joueurs mineurs associés et peut gérer consentements, visibilité, invitations et signalements.
- [ ] Le club/académie peut gérer organisation, opportunités, recherche, présélection, pipeline, notes privées, messages, membres et abonnement.
- [ ] Le recruteur peut filtrer, comparer, favoriser, noter et rédiger des rapports confidentiels : les favoris et signaux de prospection sont présents; comparaison, notes et rapports restent à compléter.
- [x] L’organisateur dispose d’un accès de démonstration et le détail événement permet l’inscription avec compteur de participants; la gestion complète de présence reste à compléter.
- [x] Le modérateur voit des vérifications et signalements de démonstration et peut déclencher un retour d’audit simulé; les permissions serveur restent à brancher.
- [x] Le support voit des tickets/paiements simulés dans son espace; les remboursements restent à compléter.
- [x] L’administrateur dispose d’un centre de contrôle avec utilisateurs, vérifications, contenus, plans/paiements et journal simulés; les mutations CRUD restent à compléter.

## Données et intégrations

- [x] Les données de démonstration incluent 20 joueurs, 5 organisations, 8 opportunités, 4 événements, statistiques saisonnières, candidatures, conversations, vérifications, signalements, paiements simulés et journal d’audit; [ ] les vidéos restent représentées par des emplacements de démonstration.
- [x] Les favoris, candidatures, rôle, événements et modifications de profil de démonstration persistent dans `localStorage` et donnent un retour visible.
- [x] Neon est préparé par `DATABASE_URL` avec un endpoint serveur `select 1` non destructif; Neon Auth est configuré par variables et Cloudinary utilise ses variables dédiées, sans secret dans le navigateur.
- [x] Les paiements restent simulés, les montants sont présentés comme exemples configurables et les clés de production ne sont pas utilisées.
- [ ] Le schéma Neon, les tables, les repositories CRUD et l’authentification Better Auth restent à implémenter pour le mode production multi-utilisateur.

## Qualité et livraison

- [ ] Les formulaires valident les champs et affichent succès, erreur, chargement et liste vide : le toast succès et le modal de démonstration sont présents, mais une validation métier exhaustive reste ouverte.
- [x] Les boutons importants déclenchent une navigation, une mutation ou un retour explicite, dont le bouton de filtres avancés et les notifications.
- [x] Le projet passe `pnpm typecheck` et `pnpm build`.
- [ ] Les parcours A à H sont représentés par des données et actions de démonstration, mais ne sont pas encore traçables via une checklist métier dédiée dans l’interface.
