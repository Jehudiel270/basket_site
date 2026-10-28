import type { Role } from './types';

export const roleLabels: Record<Role, string> = {
  visitor: 'Visiteur',
  player: 'Joueur',
  guardian: 'Parent / tuteur légal',
  club: 'Club / académie',
  scout: 'Recruteur / scout',
  organizer: 'Organisateur d\u2019événements',
  moderator: 'Vérificateur / modérateur',
  support: 'Support & facturation',
  admin: 'Administrateur général',
};

export const roleIcons: Record<Role, string> = {
  visitor: 'Globe', player: 'User', guardian: 'HeartHandshake', club: 'Building2',
  scout: 'Radar', organizer: 'CalendarDays', moderator: 'ShieldCheck', support: 'Headset', admin: 'Crown',
};

export interface MenuEntry { label: string; hash: string; icon: string; badge?: 'unread' | 'queue' }

export const roleMenus: Record<Role, MenuEntry[]> = {
  visitor: [
    { label: 'Accueil', hash: '#/', icon: 'Globe' },
    { label: 'Joueurs', hash: '#/joueurs', icon: 'UserRound' },
    { label: 'Opportunités', hash: '#/opportunites', icon: 'Target' },
  ],
  player: [
    { label: 'Vue d\u2019ensemble', hash: '#/app', icon: 'LayoutDashboard' },
    { label: 'Mon profil sportif', hash: '#/app/profil', icon: 'UserRound' },
    { label: 'Opportunités', hash: '#/app/opportunites', icon: 'Target' },
    { label: 'Mes candidatures', hash: '#/app/candidatures', icon: 'SendHorizontal', badge: 'queue' },
    { label: 'Invitations reçues', hash: '#/app/invitations', icon: 'Mail' },
    { label: 'Messagerie', hash: '#/app/messages', icon: 'MessageCircle', badge: 'unread' },
    { label: 'Clubs suivis', hash: '#/app/suivis', icon: 'Star' },
    { label: 'Abonnement & factures', hash: '#/app/abonnement', icon: 'CreditCard' },
    { label: 'Paramètres du compte', hash: '#/app/parametres', icon: 'Settings' },
  ],
  guardian: [
    { label: 'Tableau du représentant', hash: '#/app', icon: 'LayoutDashboard' },
    { label: 'Joueurs associés', hash: '#/app/mineurs', icon: 'UsersRound' },
    { label: 'Consentements', hash: '#/app/consentements', icon: 'FileCheck2', badge: 'queue' },
    { label: 'Visibilité & données', hash: '#/app/visibilite', icon: 'Eye' },
    { label: 'Suivi des démarches', hash: '#/app/suivi', icon: 'TrendingUp' },
    { label: 'Alertes & signalement', hash: '#/app/alertes', icon: 'BellRing' },
  ],
  club: [
    { label: 'Recrutement (tableau)', hash: '#/app', icon: 'LayoutDashboard' },
    { label: 'Recherche avancée', hash: '#/app/recherche', icon: 'Search' },
    { label: 'Pipeline de recrutement', hash: '#/app/pipeline', icon: 'KanbanSquare', badge: 'queue' },
    { label: 'Mes opportunités', hash: '#/app/opportunites', icon: 'Megaphone' },
    { label: 'Publier une opportunité', hash: '#/app/nouvelle-opportunite', icon: 'Plus' },
    { label: 'Comparateur', hash: '#/app/comparaison', icon: 'GitCompareArrows' },
    { label: 'Effectif & staff', hash: '#/app/organisation', icon: 'Building2' },
    { label: 'Analytique', hash: '#/app/analytique', icon: 'BarChart3' },
    { label: 'Messagerie', hash: '#/app/messages', icon: 'MessageCircle', badge: 'unread' },
    { label: 'Abonnement', hash: '#/app/abonnement', icon: 'CreditCard' },
  ],
  scout: [
    { label: 'Prospection', hash: '#/app', icon: 'LayoutDashboard' },
    { label: 'Répertoire joueurs', hash: '#/app/recherche', icon: 'Search' },
    { label: 'Favoris', hash: '#/app/favoris', icon: 'Star' },
    { label: 'Comparateur', hash: '#/app/comparaison', icon: 'GitCompareArrows' },
    { label: 'Rapports de scouting', hash: '#/app/rapports', icon: 'ClipboardList' },
    { label: 'Notes privées', hash: '#/app/notes', icon: 'NotebookPen' },
    { label: 'Recherches sauvegardées', hash: '#/app/recherches', icon: 'BookmarkCheck' },
    { label: 'Messagerie', hash: '#/app/messages', icon: 'MessageCircle', badge: 'unread' },
    { label: 'Abonnement', hash: '#/app/abonnement', icon: 'CreditCard' },
  ],
  organizer: [
    { label: 'Mes événements', hash: '#/app', icon: 'LayoutDashboard' },
    { label: 'Créer un événement', hash: '#/app/creer-evenement', icon: 'Plus' },
    { label: 'Inscriptions', hash: '#/app/inscriptions', icon: 'ClipboardCheck', badge: 'queue' },
    { label: 'Résultats & stats', hash: '#/app/resultats', icon: 'Trophy' },
    { label: 'Messagerie', hash: '#/app/messages', icon: 'MessageCircle', badge: 'unread' },
    { label: 'Abonnement', hash: '#/app/abonnement', icon: 'CreditCard' },
  ],
  moderator: [
    { label: 'File de travail', hash: '#/app', icon: 'LayoutDashboard' },
    { label: 'Vérifications', hash: '#/app/verifications', icon: 'FileCheck2', badge: 'queue' },
    { label: 'Signalements', hash: '#/app/signalements', icon: 'Flag', badge: 'queue' },
    { label: 'Contenus masqués', hash: '#/app/masques', icon: 'EyeOff' },
    { label: 'Comptes suspects', hash: '#/app/suspects', icon: 'UserX' },
    { label: 'Journal des décisions', hash: '#/app/journal', icon: 'ScrollText' },
  ],
  support: [
    { label: 'Centre de support', hash: '#/app', icon: 'LayoutDashboard' },
    { label: 'Tickets', hash: '#/app/tickets', icon: 'LifeBuoy', badge: 'queue' },
    { label: 'Abonnements & paiements', hash: '#/app/paiements', icon: 'CreditCard' },
    { label: 'Remboursements & litiges', hash: '#/app/litiges', icon: 'Undo2' },
  ],
  admin: [
    { label: 'Vue globale plateforme', hash: '#/admin', icon: 'Gauge' },
    { label: 'Utilisateurs & rôles', hash: '#/admin/utilisateurs', icon: 'UsersRound' },
    { label: 'Organisations', hash: '#/admin/organisations', icon: 'Building2' },
    { label: 'Vérifications', hash: '#/admin/verifications', icon: 'FileCheck2', badge: 'queue' },
    { label: 'Joueurs & profils', hash: '#/admin/joueurs', icon: 'UserRound' },
    { label: 'Opportunités & candidatures', hash: '#/admin/opportunites', icon: 'Target' },
    { label: 'Événements', hash: '#/admin/evenements', icon: 'CalendarDays' },
    { label: 'Modération & signalements', hash: '#/admin/moderation', icon: 'Flag' },
    { label: 'Support & tickets', hash: '#/admin/tickets', icon: 'LifeBuoy' },
    { label: 'Plans & paiements', hash: '#/admin/facturation', icon: 'CreditCard' },
    { label: 'Contenus publics & FAQ', hash: '#/admin/contenus', icon: 'Newspaper' },
    { label: 'Notifications', hash: '#/admin/notifications', icon: 'Bell' },
    { label: 'Paramètres généraux', hash: '#/admin/parametres', icon: 'Settings' },
    { label: 'Journal d\u2019audit', hash: '#/admin/journal', icon: 'ScrollText' },
    { label: 'Administrateurs', hash: '#/admin/admins', icon: 'Crown' },
  ],
};

export const demoAccounts: { role: Role; name: string; email: string; note: string }[] = [
  { role: 'player', name: 'Sèmèvo Hountondji', email: 'semevo@demo.courtlink', note: 'Arrière U21, profil vérifié' },
  { role: 'guardian', name: 'Gérard Ndiaye', email: 'tuteur@demo.courtlink', note: 'Père de 2 joueuses mineures' },
  { role: 'club', name: 'Cotonou Hoopers', email: 'club@demo.courtlink', note: 'Club vérifié, plan Club Pro' },
  { role: 'scout', name: 'Mamadou Bamba', email: 'scout@demo.courtlink', note: 'Scout indépendant certifié' },
  { role: 'organizer', name: 'Bénin 3x3', email: 'events@demo.courtlink', note: 'Organisateur de tournois' },
  { role: 'moderator', name: 'Camille H.', email: 'moderation@demo.courtlink', note: 'Vérifications & modération' },
  { role: 'support', name: 'Nadège S.', email: 'support@demo.courtlink', note: 'Tickets & facturation' },
  { role: 'admin', name: 'Admin général', email: 'admin@demo.courtlink', note: 'Accès plateforme complet' },
];

/** Route guard: workspace routes allowed only for listed roles. */
export const routeRoles: Record<string, Role[]> = {
  '/app': ['player', 'guardian', 'club', 'scout', 'organizer', 'moderator', 'support', 'admin'],
  '/app/notifications': ['player', 'guardian', 'club', 'scout', 'organizer', 'moderator', 'support', 'admin'],
  '/app/abonnement': ['player', 'guardian', 'club', 'scout', 'organizer', 'moderator', 'support', 'admin'],
  '/app/messages': ['player', 'guardian', 'club', 'scout', 'organizer', 'moderator', 'support', 'admin'],
  '/app/profil': ['player'], '/app/opportunites': ['player', 'club'],
  '/app/candidatures': ['player'], '/app/invitations': ['player'], '/app/suivis': ['player'],
  '/app/parametres': ['player', 'guardian', 'club', 'scout', 'organizer'],
  '/app/mineurs': ['guardian'], '/app/consentements': ['guardian'], '/app/visibilite': ['guardian'],
  '/app/suivi': ['guardian'], '/app/alertes': ['guardian'],
  '/app/recherche': ['club', 'scout'], '/app/pipeline': ['club'], '/app/nouvelle-opportunite': ['club'],
  '/app/comparaison': ['club', 'scout'], '/app/organisation': ['club'], '/app/analytique': ['club'],
  '/app/favoris': ['scout'], '/app/rapports': ['scout'], '/app/notes': ['scout'], '/app/recherches': ['scout'],
  '/app/creer-evenement': ['organizer'], '/app/inscriptions': ['organizer'], '/app/resultats': ['organizer'],
  '/app/verifications': ['moderator'], '/app/signalements': ['moderator'], '/app/masques': ['moderator'],
  '/app/suspects': ['moderator'], '/app/journal': ['moderator'],
  '/app/tickets': ['support'], '/app/paiements': ['support'], '/app/litiges': ['support'],
  '/admin': ['admin'],
};
