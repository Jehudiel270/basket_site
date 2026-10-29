/**
 * CourtLink — contenu du document de documentation (français).
 * Consommé par gen-doc-courtlink.js
 */
"use strict";

const IMG = "/home/z/my-project/download/captures";

const content = [
  /* ══════════ 1. RÉSUMÉ EXÉCUTIF ══════════ */
  { h1: "1. Résumé exécutif" },
  { p: "CourtLink est une plateforme web de recrutement basketball dédiée au Bénin et à l'Afrique de l'Ouest francophone. Elle connecte en un seul lieu les joueurs, les parents, les clubs, les académies, les recruteurs indépendants, les organisateurs d'événements et l'administration, autour d'une base de profils sportifs vérifiés. Le projet répond à un problème concret : le talent local manque de visibilité structurée, et les recruteurs n'ont accès à aucune donnée fiable sur les joueurs de la sous-région." },
  { p: "La plateforme est en ligne et accessible publiquement à l'adresse https://basketsite.vercel.app. Elle fonctionne selon deux modes complémentaires : un mode démonstration (données fictives chargées en mémoire, idéal pour présenter le produit) et un mode réel (authentification complète et base de données PostgreSQL hébergée chez Neon, déployée sur Vercel). L'interface est intégralement en français par défaut, avec bascule anglais disponible, et l'ensemble des parcours a été conçu pour un usage mobile d'abord." },
  { p: "Ce document présente l'intégralité du projet : la vision et le contexte, les fonctionnalités détaillées pour chacun des neuf rôles, le système d'abonnements désormais adossé au paiement réel via FedaPay (Mobile Money et cartes bancaires en FCFA), les mesures de sécurité mises en œuvre, l'architecture technique complète ainsi que la feuille de route. Il s'adresse autant aux clubs et partenaires potentiels qu'aux profils techniques chargés de l'exploitation." },

  /* ══════════ 2. CONTEXTE ET VISION ══════════ */
  { h1: "2. Contexte et vision du projet" },
  { h2: "2.1 Le problème : un marché du recrutement informel" },
  { p: "En Afrique de l'Ouest francophone, le recrutement basketball repose encore presque exclusivement sur le bouche-à-oreille, les tournois ponctuels et les relations personnelles. Un joueur talentueux de Cotonou, de Lomé ou d'Abidjan n'a aucun moyen fiable de rendre son parcours visible auprès des clubs et académies au-delà de son entourage immédiat. À l'inverse, un club qui cherche un arrière U21 doit multiplier les déplacements, les appels et les relances, sans garantie sur l'exactitude des informations reçues : statistiques non vérifiées, âges approximatifs, vidéos introuvables." },
  { p: "Cette opacité a trois conséquences directes. Premièrement, des carrières se brisent faute d'être vues : chaque année, des joueurs de niveau national ou régional arrêtent le basket sans jamais avoir été contactés. Deuxièmement, les clubs dépensent du temps et de l'argent pour recruter à l'aveugle, avec un taux d'erreur élevé sur les essais. Troisièmement, les parents — décisionnaires finaux pour les mineurs — refusent souvent des opportunités par manque de confiance dans les intermédiaires. C'est précisément ce déficit de confiance que CourtLink entend combler." },
  { h2: "2.2 La solution CourtLink" },
  { p: "CourtLink propose un réseau de confiance en cinq piliers : des profils sportifs détaillés et vérifiables (identité, taille, position, statistiques par saison, vidéos, références d'entraîneurs), une vérification des comptes joueurs et des structures par une équipe de modération dédiée, des opportunités d'emploi et d'essais publiées par les clubs de toute la sous-région, un suivi de recrutement structuré (présélections, comparaisons, pipeline), et une gestion du consentement parental pour les joueurs mineurs. Chaque donnée sensible n'est visible qu'auprès des rôles habilités." },
  { p: "L'expérience utilisateur est volontairement sobre et sportive : identité graphique orange basket-ball sur fond sombre type terrain de jeu, animations de transition fluides entre les pages, tableaux de bord différenciés par rôle. La page d'accueil intègre un mini-jeu interactif « CourtLink Arena » qui donne le ton produit sans nuire à la lisibilité de l'information." },
  { image: { path: `${IMG}/01-accueil-hero.png`, caption: "Figure 1 — Page d'accueil publique de CourtLink (basketsite.vercel.app)", w: 1440, h: 900 } },
  { image: { path: `${IMG}/02-accueil-fonctionnalites.png`, caption: "Figure 2 — Section fonctionnalités de la page d'accueil", w: 1440, h: 900 } },
  { h2: "2.3 Publics cibles et positionnement" },
  { p: "La plateforme s'adresse simultanément à cinq publics : les joueurs et joueuses de 14 ans et plus à la recherche de contrats, de bourses ou de sélection ; les parents et tuteurs légaux qui encadrent les mineurs ; les clubs et académies qui recrutent et gèrent leurs effectifs ; les scouts et recruteurs indépendants qui structurent leur veille ; et les organisateurs de camps, tournois et stages. Les marques et événements disposent enfin d'une offre « Partenaire » dédiée à la visibilité commerciale." },
  { p: "Le positionnement géographique démarre au Bénin (Cotonou, Porto-Novo) et vise l'extension à l'ensemble de l'UEMOA : Togo, Côte d'Ivoire, Sénégal, Burkina Faso, Mali, Niger et Guinée. Le choix du FCFA comme devise de facturation, du français comme langue principale et de FedaPay comme agrégateur de paiement découle directement de ce positionnement régional." },

  /* ══════════ 3. ACCÈS ET PRISE EN MAIN ══════════ */
  { h1: "3. Accès et prise en main" },
  { h2: "3.1 Lien officiel et navigation" },
  { p: "La plateforme est disponible à l'URL publique https://basketsite.vercel.app, hébergée sur l'infrastructure Vercel. Aucune installation n'est nécessaire : le site fonctionne sur tout navigateur récent, sur ordinateur comme sur téléphone. La navigation publique donne accès à l'annuaire des joueurs, aux clubs et académies, aux opportunités, aux événements, aux tarifs, au centre d'aide et à la création de compte. L'interface s'adapte automatiquement aux écrans étroits, chaque page ayant été auditée en responsive design avant mise en production." },
  { image: { path: `${IMG}/10-accueil-mobile.png`, caption: "Figure 3 — Page d'accueil sur mobile (390 × 844) : design mobile-first", w: 390, h: 844 } },
  { h2: "3.2 Créer un compte et se connecter" },
  { p: "L'inscription publique est ouverte à tous les rôles non-administratifs : joueur, parent/tuteur, club ou académie, scout, organisateur. Le formulaire demande e-mail, nom complet et mot de passe (stocké exclusivement en version chiffrée bcrypt) ; aucun courriel de confirmation n'est requis, la plateforme n'envoie volontairement aucun courriel. La page de connexion ne divulgue aucun identifiant de démonstration et n'indique jamais si un compte existe — les messages d'erreur sont volontairement génériques pour empêcher l'énumération de comptes." },
  { p: "Après connexion, chaque rôle est redirigé vers son espace dédié : les administrateurs vers la console d'administration (/#/admin), les autres rôles vers leur espace personnel (/#/app). Une case « rester connecté » prolonge la session via un cookie httpOnly sécurisé." },
  { image: { path: `${IMG}/05-connexion.png`, caption: "Figure 4 — Page de connexion sécurisée, sans identifiant affiché", w: 1440, h: 900 } },
  { h2: "3.3 Mode démonstration et mode réel" },
  { p: "La plateforme embarque un double fonctionnement. Le mode démonstration charge un jeu de données fictives réaliste (24 joueurs, 8 organisations, opportunités, événements, paiements de test) stocké en mémoire du navigateur : il permet de présenter le produit en conditions réelles sans toucher aux données de production, et l'administrateur peut le (re)charger à la demande depuis la console. Le mode réel connecte l'application à la base PostgreSQL Neon : chaque action est validée côté serveur, écrite en base et scoppée par la session. Le basculement est piloté par la variable d'environnement NEXT_PUBLIC_DATA_SOURCE (demo ou api)." },
  { p: "Cette architecture a un avantage opérationnel majeur : les démonstrations commerciales peuvent être réinitialisées à volonté sans risque, tandis que les comptes réels (comme les comptes super administrateur) vivent dans la base de production avec leurs propres sauvegardes et journaux d'audit." },

  /* ══════════ 4. FONCTIONNALITÉS PAR RÔLE ══════════ */
  { h1: "4. Fonctionnalités détaillées par rôle" },
  { p: "CourtLink gère neuf rôles utilisateurs plus le visiteur anonyme. Chaque rôle dispose d'un menu, de permissions et d'un périmètre de données propres : la matrice ci-dessous résume les capacités principales, avant le détail section par section." },
  { table: {
    title: "Tableau 1 — Matrice des rôles et capacités principales",
    headers: ["Rôle", "Périmètre principal", "Actions clés"],
    rows: [
      ["Joueur", "Profil sportif et candidatures", "Profil complet, vidéos, statistiques, candidatures, messagerie"],
      ["Parent / tuteur", "Protection des mineurs", "Validation des contacts, essais et partages de données"],
      ["Club / académie", "Recrutement et effectif", "Recherche avancée, présélections, pipeline, offres"],
      ["Scout / recruteur", "Veille et évaluation", "Rapports de scouting, notes privées, recherches sauvegardées"],
      ["Organisateur", "Événements", "Camps et tournois, inscriptions, présences, résultats"],
      ["Vérificateur / modérateur", "Conformité", "Vérifications de comptes, signalements, suspensions"],
      ["Support", "Assistance et facturation", "Tickets, factures, remboursements, litiges"],
      ["Administrateur", "Pilotage complet", "KPIs, utilisateurs, contenus, plans, journal d'audit"],
      ["Super administrateur", "Gouvernance", "Nomination des staffs et super admins, données de démo"],
    ],
  } },
  { h2: "4.1 Joueur et parent / tuteur" },
  { p: "Le joueur dispose d'un profil sportif exhaustif : identité et coordonnées, taille, poids, envergure, position principale et secondaires, main dominante, club actuel, numéro, langues parlées, parcours scolaire, objectifs de carrière et zones géographiques cibles. Il alimente ses statistiques par saison, ajoute des vidéos (highlights, matchs complets, workouts) et référence des personnes garantes (entraîneurs, dirigeants) dont le contact est affiché « via CourtLink » pour ne jamais exposer de donnée personnelle. La visibilité du profil se règle en trois niveaux : public, comptes vérifiés uniquement, ou privé." },
  { p: "Le joueur postule aux opportunités publiées par les clubs — trois candidatures par mois en offre gratuite, illimitées en offre Premium — et suit l'avancement de chaque candidature dans un pipeline clair (nouveau, à examiner, présélectionné, contacté, essai proposé, retenu, refusé). La messagerie intégrée échange uniquement avec les comptes vérifiés. Pour les joueurs mineurs, un tuteur légal est rattaché au compte : aucune demande de contact, d'essai ou de partage de données n'aboutit sans son approbation explicite, conformément à la politique de protection des mineurs." },
  { h2: "4.2 Club et académie" },
  { p: "L'espace club ou académie centralise le recrutement. La recherche avancée multicritères filtre par pays, ville, position, tranche d'âge, niveau, disponibilité et statut de vérification ; les résultats se trient par note d'évaluation. Le recruteur constitue des listes de présélection illimitées, compare jusqu'à plusieurs profils côte à côte et déplace chaque candidature dans son pipeline de recrutement. Les rapports de scouting privés et les notes internes restent confinés à la structure." },
  { p: "Le club publie des opportunités (postes, conditions, deadline, fourchette d'âge) qui alimentent l'annuaire public, gère les candidatures reçues et organise son effectif : pour les académies, la gestion du staff (multiples rôles pour les entraîneurs), la fiche publique de la structure, ses divisions et palmarès, ainsi que les rapports de progression des joueurs formés. La vérification de la structure par la modération renforce la confiance affichée auprès des familles." },
  { image: { path: `${IMG}/03-joueurs.png`, caption: "Figure 5 — Annuaire public des joueurs : filtres, cartes de profils et vérifications", w: 1440, h: 900 } },
  { image: { path: `${IMG}/09-profil-joueur.png`, caption: "Figure 6 — Consultation des profils joueurs avec statistiques et vidéos", w: 1440, h: 900 } },
  { h2: "4.3 Scout / recruteur indépendant" },
  { p: "Le scout certifié dispose des mêmes capacités de recherche que le club, complétées par des outils d'évaluation personnels : rédaction de rapports de scouting structurés (forces, faiblesses, projection de niveau), notes privées attachées à chaque joueur et recherches sauvegardées pour suivre dans le temps une zone géographique ou un segment de joueurs. Cette boîte à outils transforme un travail généralement éparpillé dans des carnets et tableurs en une veille professionnelle traçable." },
  { h2: "4.4 Organisateur d'événements" },
  { p: "L'organisateur crée et pilote des événements — camps de détection, tournois, stages — avec page publique (programme, lieu, capacité, fourchette d'âge, tarif), gestion des inscriptions et statuts de présence. Les résultats et statistiques des événements alimentent la visibilité des participants : un bon tournoi devient une vitrine mesurable pour les joueurs, et une source qualifiée de candidatures pour les clubs qui y assistent." },
  { h2: "4.5 Vérificateur / modérateur et support" },
  { p: "La file de vérification permet d'examiner les demandes des joueurs et des structures : contrôle des pièces, validation ou refus motivé, avec point d'attention visible dans l'interface. Les signalements de contenu remontés par la communauté arrivent dans une file de modération priorisée, où chaque décision (retrait, suspension de compte, classement sans suite) est journalisée. Le support, de son côté, gère les tickets utilisateurs et la facturation : consultation des factures, confirmation des paiements en attente, traitement des remboursements et des litiges — sans jamais accéder aux données sportives des joueurs, le périmètre étant techniquement séparé." },
  { h2: "4.6 Administrateur et super administrateur" },
  { p: "La console d'administration offre une vue globale de la plateforme : indicateurs temps réel (joueurs, organisations, opportunités, événements, candidatures, vérifications en attente, signalements, tickets ouverts), répartition par pays, pipeline des candidatures et indicateurs de santé (profils complétés, structures vérifiées, revenus). L'administrateur gère les utilisateurs et rôles, les organisations, les vérifications, les joueurs et profils, les opportunités et candidatures, les événements, la modération, le support et tickets, les plans et paiements, les contenus publics et FAQ, les notifications et les paramètres généraux." },
  { p: "Deux pouvoirs supplémentaires sont réservés au super administrateur : nommer des membres du staff et d'autres super administrateurs (action setStaffRole et setSuperAdmin, avec interdiction d'auto-modification et protection du dernier super admin), et charger ou réinitialiser le jeu de données de démonstration. Toute action administrative sensible est inscrite au journal d'audit et génère une notification." },
  { image: { path: `${IMG}/06-admin-dashboard.png`, caption: "Figure 7 — Console d'administration : vue globale de la plateforme", w: 1440, h: 900 } },
  { image: { path: `${IMG}/08-admin-utilisateurs.png`, caption: "Figure 8 — Gestion des utilisateurs et des rôles", w: 1440, h: 900 } },

  /* ══════════ 5. ABONNEMENTS ET FEDAPAY ══════════ */
  { h1: "5. Abonnements et paiement réel via FedaPay" },
  { h2: "5.1 Les offres d'abonnement" },
  { p: "Le compte joueur est gratuit pour toujours. Les offres payantes débloquent des outils concrets par population : visibilité renforcée pour les joueurs, outils de recrutement pour les clubs, gestion d'événements pour les organisateurs. Les montants ci-dessous sont exprimés en FCFA et restent modifiables à tout moment par l'administration depuis la console (rubrique Plans & paiements) ; la tarification affichée en production peut donc évoluer sans mise à jour du code." },
  { table: {
    title: "Tableau 2 — Offres d'abonnement (valeurs de démonstration, éditables par l'administration)",
    headers: ["Offre", "Public", "Prix mensuel", "Contenu principal"],
    rows: [
      ["Découverte", "Joueur", "0 FCFA", "Profil complet, 3 candidatures/mois, messagerie vérifiée"],
      ["Joueur Premium", "Joueur", "4 900 FCFA", "Candidatures illimitées, stats de consultation, priorité de recherche"],
      ["Club Pro", "Club / recruteur", "25 000 FCFA", "Recherche multicritères, présélections, pipeline, rapports privés"],
      ["Académie", "Académie", "20 000 FCFA", "Effectif, staff multi-rôles, événements de détection, progression"],
      ["Organisateur", "Organisateur", "15 000 FCFA", "Événements, inscriptions, présences, résultats, page publique"],
      ["Partenaire", "Marques / événements", "80 000 FCFA", "Visibilité publicitaire, événements sponsorisés, rapports d'audience"],
    ],
  } },
  { p: "Une bascule mensuel / annuel est proposée sur la page Tarifs : l'engagement annuel équivaut à dix mois payés, soit deux mois offerts. La page affiche systématiquement un encart de transparence : aucune sélection, bourse ou contrat n'est lié à un paiement — les offres achètent uniquement des fonctionnalités." },
  { image: { path: `${IMG}/04-tarifs.png`, caption: "Figure 9 — Page des tarifs en FCFA avec bascule mensuel/annuel", w: 1440, h: 900 } },
  { h2: "5.2 Intégration du paiement réel FedaPay" },
  { p: "Les abonnements payants sont désormais encaissés en argent réel via FedaPay, l'agrégateur de paiement ouest-africain basé à Cotonou. FedaPay agrège les principaux moyens de paiement de la sous-région : MTN MoMo, Moov Money, Orange Money et Wave pour le Mobile Money, ainsi que les cartes Visa et Mastercard. La facturation est en XOF (FCFA), ce qui élimine toute conversion pour les utilisateurs de la zone UEMOA." },
  { p: "Le tunnel de paiement fonctionne en quatre étapes. Premièrement, l'utilisateur choisit une offre : la plateforme appelle le serveur, qui relit le montant officiel depuis la base (jamais depuis le navigateur) et crée une transaction FedaPay. Deuxièmement, le serveur renvoie une URL de paiement sécurisée et le navigateur y est redirigé : l'utilisateur paie chez FedaPay par Mobile Money ou carte, sans que CourtLink ne voie jamais ses credentials de paiement. Troisièmement, FedaPay ramène l'utilisateur sur la page de retour intégrée (/fedapay/retour) qui interroge le statut réel de la transaction. Quatrièmement, l'abonnement est activé : facture au statut « Confirmé », notification utilisateur, entrée au journal d'audit et renouvellement calculé (un mois ou un an)." },
  { p: "Un webhook signé complète ce parcours : FedaPay notifie directement le serveur (endpoint /api/billing/webhook) lorsqu'une transaction est approuvée, même si l'utilisateur a fermé son navigateur avant le retour. La signature X-FEDAPAY-SIGNATURE (HMAC-SHA256) est vérifiée sur le corps brut de chaque requête. L'activation est idempotente : retour navigateur et webhook peuvent confirmer la même transaction sans jamais créer de doublon de facture ni de double activation." },
  { image: { path: `${IMG}/07-espace-abonnement.png`, caption: "Figure 10 — Espace Abonnement : offre active, factures et souscription", w: 1440, h: 900 } },
  { h2: "5.3 Activation technique et variables d'environnement" },
  { p: "L'intégration a été conçue pour être sûre par défaut. Tant que la clé secrète FedaPay n'est pas présente dans les variables d'environnement du déploiement, la plateforme conserve intégralement son tunnel de démonstration simulé — aucune transaction réelle ne peut être déclenchée par accident. L'ajout des clés bascule automatiquement les boutons « Payer » vers la page FedaPay, sans intervention sur le code ni redéploiement particulier." },
  { table: {
    title: "Tableau 3 — Variables d'environnement FedaPay à configurer sur Vercel",
    headers: ["Variable", "Valeur", "Rôle"],
    rows: [
      ["FEDAPAY_SECRET_KEY", "sk_sandbox_… ou sk_live_…", "Clé secrète API — active le paiement réel dès qu'elle est définie"],
      ["FEDAPAY_ENVIRONMENT", "sandbox ou live (défaut sandbox)", "Sélectionne l'API de test ou de production"],
      ["FEDAPAY_WEBHOOK_SECRET", "Secret du webhook FedaPay", "Vérifie la signature des événements serveur"],
      ["FEDAPAY_BASE_URL", "https://basketsite.vercel.app", "URL publique utilisée pour le retour de paiement (optionnel)"],
    ],
  } },
  { h2: "5.4 Sécurité des paiements" },
  { p: "Quatre garde-fous encadrent l'encaissement. Le montant est toujours relu côté serveur depuis la table des plans, ce qui rend impossible la falsification du prix par manipulation du navigateur. La création de transaction exige une session authentifiée, et la vérification refuse tout paiement n'appartenant pas à l'utilisateur connecté. Le webhook n'accepte que des requêtes dont la signature correspond au secret configuré. Enfin, le mode de test sandbox permet de valider l'intégralité du parcours avec des montants de test avant le passage en production, recommandé avec un premier paiement réel à petit montant (par exemple 500 FCFA) suivi d'une vérification croisée dans le tableau de bord FedaPay et dans le journal d'audit de CourtLink." },

  /* ══════════ 6. SÉCURITÉ ══════════ */
  { h1: "6. Sécurité, confidentialité et conformité" },
  { h2: "6.1 Authentification et protection anti force brute" },
  { p: "L'authentification repose sur NextAuth v4 en mode credentials : le mot de passe est comparé à son empreinte bcrypt, et la session prend la forme d'un JSON Web Token signé transporté par un cookie httpOnly — inaccessible au JavaScript de la page. Le token embarque l'identifiant et le rôle de l'utilisateur, ce qui permet un contrôle d'accès systématique côté serveur. Aucun courriel n'est collecté à des fins marketing et la plateforme n'envoie aucun courriel : tout passe par les notifications internes." },
  { p: "La page de connexion est protégée par un limiteur de tentatives en mémoire serveur : au-delà de huit échecs pour un même couple e-mail/adresse IP dans une fenêtre de cinq minutes, toute nouvelle tentative est rejetée silencieusement avec le même message générique. Cette protection a été vérifiée en production : la neuvième tentative est bloquée, et la page ne laisse jamais deviner si un compte existe. L'inscription publique ne peut jamais créer un compte administrateur directement — les élévations de privilèges passent exclusivement par les actions super administrateur." },
  { h2: "6.2 Scoping des données par rôle" },
  { p: "Le serveur ne fait jamais confiance au client sur le périmètre des données. Chaque lecture (endpoint /api/state) et chaque action est filtrée selon la session : un support ne voit que les tickets et factures, jamais les profils sportifs ; un joueur ne voit que son propre pipeline ; un anonyme reçoit un état minimal sans aucune donnée sensible. Les actions sensibles (administration, modération, facturation) vérifient le rôle côté serveur avant toute écriture et répondent 401 à toute session absente ou insuffisante — comportement audité en production." },
  { h2: "6.3 Journal d'audit, notifications et protection des mineurs" },
  { p: "Toute action administrative — activation d'abonnement, changement de rôle, vérification, suspension, modification de contenu — est inscrite au journal d'audit avec auteur, horodatage et périmètre, et consultable uniquement par le staff. Les utilisateurs sont notifiés dans l'application des décisions qui les concernent (abonnement activé, vérification validée, réponse de support). Pour les mineurs, la double validation joueur/tuteur est imposée avant tout contact externe, et le partage de données est refusé par défaut. Enfin, le dépôt de code exclut explicitement les fichiers d'environnement (.env) : les clés ne circulent que dans les variables sécurisées de Vercel." },

  /* ══════════ 7. ARCHITECTURE ══════════ */
  { h1: "7. Architecture technique" },
  { h2: "7.1 Pile technologique" },
  { p: "La plateforme est une application Next.js 16 (App Router) écrite en TypeScript, rendue côté client pour l'expérience applicative et côté serveur pour les API. Le style utilise Tailwind CSS 4 avec des composants shadcn/ui adaptés à l'identité CourtLink ; l'état applicatif est géré par un store Zustand unique qui hydrate soit les données de démonstration, soit le serveur. L'ORM Prisma dialogue avec PostgreSQL hébergé chez Neon en production et SQLite en développement local. Les médias (photos de profils, documents) sont envoyés directement à Cloudinary via une signature générée côté serveur. Le déploiement est assuré par Vercel, avec redéploiement automatique à chaque commit sur la branche principale." },
  { table: {
    title: "Tableau 4 — Composants de la pile technique",
    headers: ["Couche", "Technologie", "Rôle"],
    rows: [
      ["Frontend", "Next.js 16, React, TypeScript", "Application SPA avec routing par hash"],
      ["Style", "Tailwind CSS 4, shadcn/ui", "Design system CourtLink, responsive"],
      ["État", "Zustand", "Store unique démo / API"],
      ["Authentification", "NextAuth v4, bcryptjs, JWT", "Sessions et mots de passe chiffrés"],
      ["Base de données", "Prisma, PostgreSQL (Neon)", "Persistance réelle, SQLite en dev"],
      ["Médias", "Cloudinary", "Photos, vidéos, documents des profils"],
      ["Paiement", "FedaPay (REST v1)", "Encaissement Mobile Money et cartes"],
      ["Hébergement", "Vercel", "CDN mondial, redéploiement automatique"],
    ],
  } },
  { h2: "7.2 Modèle de données" },
  { p: "Le schéma Prisma couvre l'ensemble du domaine : utilisateurs et rôles, profils joueurs (statistiques, vidéos, références en JSON), organisations, opportunités et candidatures, événements et inscriptions, demandes de consentement parental, vérifications, signalements, tickets et messages de support, paiements et plans d'abonnement, notifications, rapports de scouting et recherches sauvegardées, journal d'audit. Les tables principales sont décrites ci-dessous." },
  { table: {
    title: "Tableau 5 — Tables principales de la base de données",
    headers: ["Table", "Contenu"],
    rows: [
      ["User", "Comptes : e-mail, hash bcrypt, rôle, statut super admin, abonnement (plan, statut, échéances)"],
      ["Player", "Profils sportifs : identité, mesures, position, club, note, visibilité, stats et vidéos (JSON)"],
      ["Organization", "Clubs et académies : type, localisation, vérification, effectif, palmarès"],
      ["Opportunity / Application", "Offres publiées par les clubs et candidatures des joueurs avec pipeline"],
      ["Event", "Camps et tournois : programme, capacité, inscriptions, présences, résultats"],
      ["Payment / Plan", "Factures (statut, moyen, montant) et offres d'abonnement éditables"],
      ["ConsentRequest", "Demandes de contact/essai/partage soumises à l'accord du tuteur légal"],
      ["AuditLog / Notification", "Traçabilité administrative et notifications internes aux utilisateurs"],
    ],
  } },
  { h2: "7.3 Interface de programmation (API)" },
  { p: "Le backend expose des routes REST App Router regroupées par responsabilité. Le bus d'actions unique /api/actions/[action] applique chaque mutation après validation de session, de rôle et de propriété ; l'état scoppé est servi par /api/state. Les routes de facturation FedaPay sont isolées dans /api/billing. La répartition complète est la suivante." },
  { table: {
    title: "Tableau 6 — Routes API principales",
    headers: ["Route", "Méthode", "Fonction"],
    rows: [
      ["/api/state", "GET", "État complet scoppé par la session (données du rôle courant)"],
      ["/api/actions/[action]", "POST", "Bus d'actions validées : joueurs, clubs, événements, facturation…"],
      ["/api/auth/[...nextauth]", "POST/GET", "Connexion credentials, session JWT, cookie httpOnly"],
      ["/api/auth/register", "POST", "Inscription publique (jamais administrateur)"],
      ["/api/billing/checkout", "POST", "Création de transaction FedaPay + URL de paiement sécurisée"],
      ["/api/billing/verify", "POST", "Vérification du statut réel et activation idempotente"],
      ["/api/billing/webhook", "POST", "Événements FedaPay signés (HMAC-SHA256) — filet de sécurité"],
      ["/api/upload", "POST", "Signature d'upload direct vers Cloudinary"],
      ["/fedapay/retour", "GET", "Page de retour après paiement, vérification visible à l'utilisateur"],
    ],
  } },

  /* ══════════ 8. DÉPLOIEMENT ══════════ */
  { h1: "8. Déploiement et exploitation" },
  { h2: "8.1 Hébergement et intégration continue" },
  { p: "Le dépôt GitHub (github.com/Jehudiel270/basket_site) est connecté à Vercel : chaque push sur la branche principale déclenche un build et une mise en ligne en moins d'une minute. Les variables d'environnement de production sont gérées dans le tableau de bord Vercel et ne figurent jamais dans le dépôt. Cette chaîne permet des itérations rapides — correctifs de sécurité, ajustements de contenu, nouvelles fonctionnalités — avec un retour de déploiement quasi immédiat et un historique de versions conservé par Vercel pour tout retour arrière." },
  { h2: "8.2 Base de données et supervision" },
  { p: "La base PostgreSQL Neon est accessible uniquement en TLS ; le schéma est géré par les migrations Prisma. L'exploitation quotidienne s'appuie sur trois leviers : le journal d'audit intégré à la console d'administration pour la traçabilité métier, les logs d'exécution Vercel pour l'incidents techniques (erreurs serveur, latence des API), et le tableau de bord FedaPay pour la réconciliation des paiements. La réinitialisation du jeu de démonstration, disponible depuis la console, ne touche jamais les données réelles de production." },

  /* ══════════ 9. ROADMAP ══════════ */
  { h1: "9. Feuille de route" },
  { p: "Court mill terme, trois chantiers confirment le passage à l'échelle commerciale. Le premier est l'activation opérationnelle de FedaPay : création du compte marchand validé (KYC), configuration du webhook en production avec son secret, puis bascule FEDAPAY_ENVIRONMENT en live pour les premiers encaissements réels, précédés d'un test à petit montant. Le deuxième est le lancement commercial auprès des clubs pilotes béninois avec l'offre Club Pro, en s'appuyant sur le mode démonstration pour les rendez-vous de vente. Le troisième est l'extension régionale : ouverture de la vérification des structures togolaises et ivoiriennes, puis déploiement de l'offre Partenaire pour les marques cherchant une visibilité auprès de la génération basket de l'UEMOA." },
  { p: "À moyen terme, la feuille de route envisage une application mobile installable (PWA), des notifications enrichies, un module de statistiques avancées alimenté par les organisateurs d'événements, et des partenariats institutionnels (fédérations, ligues) autour de la vérification des identités sportives. La fondation technique — rôles, audit, scoping, paiements — est déjà en place pour absorber ces évolutions sans refonte." },

  /* ══════════ 10. ANNEXES ══════════ */
  { h1: "10. Annexes" },
  { h2: "10.1 Référence des variables d'environnement" },
  { table: {
    title: "Tableau 7 — Variables d'environnement de production",
    headers: ["Variable", "Description"],
    rows: [
      ["DATABASE_URL", "Chaîne de connexion PostgreSQL Neon (production) ou SQLite (développement)"],
      ["NEXTAUTH_URL", "URL publique de la plateforme (https://basketsite.vercel.app)"],
      ["NEXTAUTH_SECRET", "Secret de signature des sessions JWT"],
      ["NEXT_PUBLIC_DATA_SOURCE", "demo (données fictives) ou api (base réelle)"],
      ["CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET", "Clés d'upload des médias (photos, documents)"],
      ["FEDAPAY_SECRET_KEY", "Clé secrète FedaPay — active le paiement réel"],
      ["FEDAPAY_ENVIRONMENT", "sandbox ou live"],
      ["FEDAPAY_WEBHOOK_SECRET", "Secret de vérification des webhooks FedaPay"],
      ["FEDAPAY_BASE_URL", "URL publique pour le retour de paiement (optionnel)"],
    ],
  } },
  { h2: "10.2 Glossaire" },
  { table: {
    title: "Tableau 8 — Glossaire",
    headers: ["Terme", "Définition"],
    rows: [
      ["CourtLink Arena", "Mini-jeu interactif de la page d'accueil (tir au panier)"],
      ["Pipeline de recrutement", "Suivi d'avancement d'une candidature de la découverte à la signature"],
      ["Présélection", "Liste de joueurs retenus par un club pour approfondissement"],
      ["Scouting report", "Rapport d'évaluation structuré d'un joueur (forces, axes, projection)"],
      ["Mobile Money", "Paiement par portefeuille mobile (MTN MoMo, Moov, Orange, Wave)"],
      ["FedaPay", "Agrégateur de paiement ouest-africain (Bénin, Togo, Côte d'Ivoire…)"],
      ["Webhook", "Notification automatique serveur à serveur d'un événement de paiement"],
      ["HMAC-SHA256", "Mécanisme de signature cryptographique utilisé pour les webhooks"],
      ["Super administrateur", "Compte de gouvernance pouvant nommer staff et autres super admins"],
      ["Mode démonstration", "Jeu de données fictives rechargeable pour la présentation du produit"],
    ],
  } },
];

module.exports = { content };
