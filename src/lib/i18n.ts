'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ── Langues supportées : français par défaut, anglais activable ──
   Les surfaces publiques (en-tête, pied de page, accueil) sont traduites.
   Les espaces de travail restent en français ; les contenus de démonstration
   (profils, annonces) restent en français car ils représentent des données
   régionales fictives. L'architecture permet d'étendre le dictionnaire. */

export type Lang = 'fr' | 'en';

type Translations = Record<string, string>;

export const dict: Record<Lang, Translations> = {
  /* ─────────── FRANÇAIS (défaut) ─────────── */
  fr: {
    // Navigation
    'nav.players': 'Joueurs',
    'nav.clubs': 'Clubs & académies',
    'nav.opportunities': 'Opportunités',
    'nav.events': 'Événements',
    'nav.pricing': 'Tarifs',
    'nav.help': 'Aide',
    'header.login': 'Connexion',
    'header.register': 'Créer mon compte',
    'header.mySpace': 'Mon espace',
    'header.theme': 'Changer de thème',
    'header.menu': 'Menu',
    'header.logout': 'Se déconnecter',

    // Pied de page
    'footer.tagline': 'La plateforme qui connecte les talents du basketball aux clubs, académies et recruteurs d\u2019Afrique de l\u2019Ouest — avec des données vérifiées et des parcours transparents.',
    'footer.chip.fcfa': 'FCFA supporté',
    'footer.chip.lang': 'FR / EN',
    'footer.chip.mobile': 'Mobile first',
    'footer.disclaimer': 'CourtLink facilite la découverte et la mise en relation. La plateforme ne garantit aucune sélection, bourse, contrat ou rémunération et n\u2019est pas un agent licencié.',
    'footer.col.discover': 'Découvrir',
    'footer.col.journeys': 'Parcours',
    'footer.col.trust': 'Confiance & sécurité',
    'footer.playersDir': 'Annuaire des joueurs',
    'footer.howPlayers': 'Pour les joueurs',
    'footer.howClubs': 'Pour les clubs & recruteurs',
    'footer.register': 'Créer un compte',
    'footer.helpCenter': 'Centre d\u2019aide',
    'footer.contact': 'Contact',
    'footer.privacy': 'Politique de confidentialité',
    'footer.terms': 'Conditions d\u2019utilisation',
    'footer.report': 'Signaler un contenu',
    'footer.verify': 'Vérification des comptes',
    'footer.minors': 'Protection des mineurs',
    'footer.copyright': '© 2026 CourtLink (prototype de démonstration) — Cotonou, Bénin. Aucune transaction réelle.',
    'footer.demoActive': 'Mode démonstration actif — données fictives',

    // Hero
    'hero.badge': 'Le réseau de confiance du basketball · Bénin & Afrique de l\u2019Ouest',
    'hero.title1': 'Le talent local',
    'hero.title2': 'entre dans le panier.',
    'hero.sub': 'Profils vérifiés, statistiques par saison, opportunités régionales et suivi de recrutement — du premier camp de détection au contrat.',
    'hero.cta.explore': 'Explorer les profils',
    'hero.cta.createProfile': 'Je suis joueur — créer mon profil',
    'hero.trust.verified': 'Profils & clubs vérifiés',
    'hero.trust.players': 'joueurs référencés',
    'hero.trust.countries': '10 pays couverts',
    'hero.loading': 'CHARGEMENT DE L\u2019ARÈNE 3D…',
    'hero.score': 'Score',
    'hero.shots': 'Tirs',
    'hero.made': 'Paniers',
    'hero.streak': 'Série',
    'hero.shoot': 'Tirer',
    'hero.auto': 'Auto',
    'hero.reset': 'Remettre le score à zéro',
    'hero.clickHint': 'Cliquez le ballon pour marquer',
    'hero.scroll': 'Défiler',
    'hero.pop.miss': 'RATÉ !',

    // Moteur de découverte
    'discover.kicker': 'Console de recherche',
    'discover.title': 'Trouvez votre futur joueur ou votre futur club',
    'discover.placeholder': 'Nom, ville, club…',
    'discover.allPositions': 'Tous les postes',
    'discover.allCountries': 'Tous les pays',
    'discover.search': 'Rechercher',
    'discover.position': 'Poste',
    'discover.country': 'Pays',

    // Bandeau chiffres
    'stats.registered': 'Joueurs inscrits',
    'stats.clubs': 'Clubs & académies',
    'stats.opportunities': 'Opportunités publiées',
    'stats.countries': 'Pays couverts',

    // Section vedettes
    'featured.eyebrow': 'Scouting du moment',
    'featured.title': 'Les profils en vedette',
    'featured.sub': 'Sélection éditoriale basée sur l\u2019indice CourtLink : statistiques vérifiées, vidéos complètes et disponibilité actuelle.',
    'featured.all': 'Tout l\u2019annuaire',

    // Section opportunités
    'opps.eyebrow': 'Bouche à oreille numérique',
    'opps.title': 'Opportunités ouvertes cette semaine',
    'opps.sub': 'Contrats saison, camps de détection, bourses académiques : chaque annonce indique critères, conditions et date limite.',
    'opps.all': 'Toutes les opportunités',
    'opps.candidates': 'candidats',

    // Fonctionnement
    'how.eyebrow': 'Le fonctionnement',
    'how.title': 'Trois parcours, un même terrain',
    'how.sub': 'Chaque rôle dispose de son espace de travail avec des outils conçus pour le basketball ouest-africain.',
    'how.players': 'Pour les joueurs',
    'how.clubs': 'Pour les clubs & recruteurs',
    'how.organizers': 'Pour les organisateurs',
    'how.step.p1': 'Créez votre profil sportif complet',
    'how.step.p2': 'Ajoutez stats par saison et vidéos',
    'how.step.p3': 'Choisissez votre visibilité',
    'how.step.p4': 'Postulez et suivez vos candidatures',
    'how.step.c1': 'Faites vérifier votre structure',
    'how.step.c2': 'Publiez des opportunités claires',
    'how.step.c3': 'Filtrez et comparez les profils',
    'how.step.c4': 'Gérez votre pipeline de recrutement',
    'how.step.o1': 'Créez combines, showcases et tournois',
    'how.step.o2': 'Gérez inscriptions et présences',
    'how.step.o3': 'Publiez les résultats et stats',
    'how.step.o4': 'Donnez de la visibilité aux talents',
    'how.discover': 'Découvrir le parcours',

    // Rôles
    'roles.eyebrow': '8 rôles métier',
    'roles.title': 'Un espace de travail pour chaque maillon du recrutement',
    'roles.sub': 'Testez chaque rôle depuis la page de connexion : le menu, les pages et les permissions s\u2019adaptent automatiquement.',
    'role.player': 'Joueur',
    'role.player.desc': 'Profil sportif, stats, vidéos, candidatures',
    'role.guardian': 'Parent / tuteur',
    'role.guardian.desc': 'Consentements et protection des mineurs',
    'role.club': 'Club / académie',
    'role.club.desc': 'Pipeline, effectifs, opportunités',
    'role.scout': 'Recruteur / scout',
    'role.scout.desc': 'Recherche avancée, rapports, favoris',
    'role.organizer': 'Organisateur',
    'role.organizer.desc': 'Événements, inscriptions, résultats',
    'role.moderator': 'Modérateur',
    'role.moderator.desc': 'Vérifications et modération',
    'role.support': 'Support',
    'role.support.desc': 'Tickets, paiements, litiges',
    'role.admin': 'Administrateur',
    'role.admin.desc': 'Pilotage complet de la plateforme',

    // Témoignages
    'testi.eyebrow': 'Ils l\u2019utilisent',
    'testi.title': 'Ce que dit le terrain',

    // Tarifs
    'pricing.eyebrow': 'Tarifs transparents',
    'pricing.title': 'Commencez gratuitement, évoluez quand ça compte',
    'pricing.sub': 'Prix en FCFA, configurables par l\u2019administration. Les abonnements achètent des fonctionnalités — jamais une promesse de sélection.',
    'pricing.compare': 'Comparer les offres',
    'pricing.mostChosen': 'Le plus choisi',
    'pricing.free': 'Gratuit',

    // CTA finale
    'cta.eyebrow': 'Rejoindre le réseau',
    'cta.title1': 'Votre saison prochaine',
    'cta.title2': 'commence sur ce profil.',
    'cta.sub': 'Que vous soyez joueur en quête de visibilité ou recruteur à la recherche du bon profil, le meilleur moment pour rejoindre le réseau, c\u2019est avant la prochaine fenêtre de recrutement.',
    'cta.register': 'Créer mon compte gratuit',
    'cta.demo': 'Tester les comptes démo',
    'cta.trust1.t': 'Vérification documentaire',
    'cta.trust1.d': 'Joueurs, clubs et scouts justificatifs à l\u2019appui',
    'cta.trust2.t': 'Historique de saison complet',
    'cta.trust2.d': 'Points, rebonds, passes, % de tir par compétition',
    'cta.trust3.t': 'Zéro contact non sollicité',
    'cta.trust3.d': 'Consentement obligatoire pour les mineurs',
  },

  /* ─────────── ENGLISH ─────────── */
  en: {
    // Navigation
    'nav.players': 'Players',
    'nav.clubs': 'Clubs & academies',
    'nav.opportunities': 'Opportunities',
    'nav.events': 'Events',
    'nav.pricing': 'Pricing',
    'nav.help': 'Help',
    'header.login': 'Log in',
    'header.register': 'Create my account',
    'header.mySpace': 'My workspace',
    'header.theme': 'Switch theme',
    'header.menu': 'Menu',
    'header.logout': 'Log out',

    // Footer
    'footer.tagline': 'The platform connecting basketball talent with clubs, academies and recruiters across West Africa — with verified data and transparent pathways.',
    'footer.chip.fcfa': 'FCFA supported',
    'footer.chip.lang': 'FR / EN',
    'footer.chip.mobile': 'Mobile first',
    'footer.disclaimer': 'CourtLink facilitates discovery and connections. The platform guarantees no selection, scholarship, contract or compensation and is not a licensed agent.',
    'footer.col.discover': 'Discover',
    'footer.col.journeys': 'Pathways',
    'footer.col.trust': 'Trust & safety',
    'footer.playersDir': 'Player directory',
    'footer.howPlayers': 'For players',
    'footer.howClubs': 'For clubs & recruiters',
    'footer.register': 'Create an account',
    'footer.helpCenter': 'Help center',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy policy',
    'footer.terms': 'Terms of use',
    'footer.report': 'Report content',
    'footer.verify': 'Account verification',
    'footer.minors': 'Minor protection',
    'footer.copyright': '© 2026 CourtLink (demo prototype) — Cotonou, Benin. No real transactions.',
    'footer.demoActive': 'Demo mode active — fictional data',

    // Hero
    'hero.badge': 'Basketball\u2019s trusted network · Benin & West Africa',
    'hero.title1': 'Local talent',
    'hero.title2': 'hits the shot.',
    'hero.sub': 'Verified profiles, season-by-season stats, regional opportunities and recruiting tracking — from the first tryout camp to the contract.',
    'hero.cta.explore': 'Explore profiles',
    'hero.cta.createProfile': 'I\u2019m a player — create my profile',
    'hero.trust.verified': 'Verified profiles & clubs',
    'hero.trust.players': 'players listed',
    'hero.trust.countries': '10 countries covered',
    'hero.loading': 'LOADING THE 3D ARENA…',
    'hero.score': 'Score',
    'hero.shots': 'Shots',
    'hero.made': 'Baskets',
    'hero.streak': 'Streak',
    'hero.shoot': 'Shoot',
    'hero.auto': 'Auto',
    'hero.reset': 'Reset the score',
    'hero.clickHint': 'Click the ball to score',
    'hero.scroll': 'Scroll',
    'hero.pop.miss': 'MISSED!',

    // Discovery engine
    'discover.kicker': 'Search console',
    'discover.title': 'Find your next player or your next club',
    'discover.placeholder': 'Name, city, club…',
    'discover.allPositions': 'All positions',
    'discover.allCountries': 'All countries',
    'discover.search': 'Search',
    'discover.position': 'Position',
    'discover.country': 'Country',

    // Stats band
    'stats.registered': 'Registered players',
    'stats.clubs': 'Clubs & academies',
    'stats.opportunities': 'Opportunities posted',
    'stats.countries': 'Countries covered',

    // Featured
    'featured.eyebrow': 'Fresh scouting',
    'featured.title': 'Featured profiles',
    'featured.sub': 'Editorial selection based on the CourtLink index: verified stats, complete videos and current availability.',
    'featured.all': 'Full directory',

    // Opportunities
    'opps.eyebrow': 'Digital word of mouth',
    'opps.title': 'Opportunities open this week',
    'opps.sub': 'Season contracts, tryout camps, academic scholarships: every listing states criteria, conditions and deadline.',
    'opps.all': 'All opportunities',
    'opps.candidates': 'candidates',

    // How it works
    'how.eyebrow': 'How it works',
    'how.title': 'Three pathways, one court',
    'how.sub': 'Every role gets its own workspace with tools built for West African basketball.',
    'how.players': 'For players',
    'how.clubs': 'For clubs & recruiters',
    'how.organizers': 'For organizers',
    'how.step.p1': 'Create your complete sports profile',
    'how.step.p2': 'Add season-by-season stats and videos',
    'how.step.p3': 'Choose your visibility level',
    'how.step.p4': 'Apply and track your applications',
    'how.step.c1': 'Get your organization verified',
    'how.step.c2': 'Publish clear opportunities',
    'how.step.c3': 'Filter and compare profiles',
    'how.step.c4': 'Manage your recruiting pipeline',
    'how.step.o1': 'Create combines, showcases and tournaments',
    'how.step.o2': 'Manage registrations and attendance',
    'how.step.o3': 'Publish results and stats',
    'how.step.o4': 'Give talent the exposure they deserve',
    'how.discover': 'Explore the pathway',

    // Roles
    'roles.eyebrow': '8 business roles',
    'roles.title': 'A workspace for every link in the recruiting chain',
    'roles.sub': 'Try each role from the login page: the menu, pages and permissions adapt automatically.',
    'role.player': 'Player',
    'role.player.desc': 'Sports profile, stats, videos, applications',
    'role.guardian': 'Parent / guardian',
    'role.guardian.desc': 'Consents and minor protection',
    'role.club': 'Club / academy',
    'role.club.desc': 'Pipeline, rosters, opportunities',
    'role.scout': 'Scout / recruiter',
    'role.scout.desc': 'Advanced search, reports, favorites',
    'role.organizer': 'Organizer',
    'role.organizer.desc': 'Events, registrations, results',
    'role.moderator': 'Moderator',
    'role.moderator.desc': 'Verification and moderation',
    'role.support': 'Support',
    'role.support.desc': 'Tickets, payments, disputes',
    'role.admin': 'Administrator',
    'role.admin.desc': 'Full platform control',

    // Testimonials
    'testi.eyebrow': 'They use it',
    'testi.title': 'What the court says',

    // Pricing
    'pricing.eyebrow': 'Transparent pricing',
    'pricing.title': 'Start free, upgrade when it counts',
    'pricing.sub': 'Prices in FCFA, configurable by administration. Subscriptions buy features — never a promise of selection.',
    'pricing.compare': 'Compare plans',
    'pricing.mostChosen': 'Most chosen',
    'pricing.free': 'Free',

    // Final CTA
    'cta.eyebrow': 'Join the network',
    'cta.title1': 'Your next season',
    'cta.title2': 'starts on this profile.',
    'cta.sub': 'Whether you\u2019re a player looking for exposure or a recruiter searching for the right profile, the best time to join the network is before the next recruiting window.',
    'cta.register': 'Create my free account',
    'cta.demo': 'Try the demo accounts',
    'cta.trust1.t': 'Document verification',
    'cta.trust1.d': 'Players, clubs and scouts with supporting documents',
    'cta.trust2.t': 'Full season history',
    'cta.trust2.d': 'Points, rebounds, assists, shooting % per competition',
    'cta.trust3.t': 'Zero unsolicited contact',
    'cta.trust3.d': 'Guardian consent required for minors',
  },
};

interface LangState {
  lang: Lang;
  setLang: (l: Lang) => void;
}

export const useLang = create<LangState>()(
  persist(
    (set) => ({ lang: 'fr', setLang: (lang) => set({ lang }) }),
    { name: 'courtlink-lang' }
  )
);

/** Hook de traduction : t('nav.players') → libellé dans la langue active */
export function useT() {
  const lang = useLang(s => s.lang);
  return (key: string): string => dict[lang][key] ?? dict.fr[key] ?? key;
}
