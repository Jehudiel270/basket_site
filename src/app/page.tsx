'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useHashRoute } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { isApiMode, fetchState } from '@/lib/api-mode';
import type { DemoState } from '@/lib/types';
import { PublicHeader, PublicFooter } from '@/components/layout/Chrome';
import { WorkspaceShell } from '@/components/workspace/Shell';
import { Hero } from '@/components/home/Hero';
import { Ticker, FeaturedPlayers, RecentOpportunities, ClosingCTA } from '@/components/home/Sections';
import { PlayersDirectory, PlayerProfile } from '@/components/public/Players';
import { OrgsDirectory, OrgProfile } from '@/components/public/Orgs';
import { OpportunitiesPage, OpportunityDetail, EventsPage, EventDetail } from '@/components/public/Opportunities';
import { PricingPage } from '@/components/public/Pricing';
import {
  LoginPage, RegisterPage, ForgotPage, HowPlayerPage, HowClubPage,
  FaqPage, ContactPage, ReportPage, PrivacyPage, TermsPage,
} from '@/components/public/Info';
import { MessagesView, SubscriptionView, NotificationsView } from '@/components/workspace/Shared';
import {
  PlayerDashboard, PlayerProfileEdit, PlayerOpportunities, PlayerApplications,
  PlayerInvitations, PlayerFollows, PlayerSettings,
} from '@/components/workspace/PlayerSpace';
import {
  ClubDashboard, AdvancedSearch, ClubPipeline, ClubOpportunities, CreateOpportunity,
  CompareView, ClubOrganization, ClubAnalytics,
  ScoutDashboard, ScoutFavorites, ScoutReports, ScoutNotes, SavedSearchesView,
} from '@/components/workspace/ClubScout';
import {
  GuardianDashboard, GuardianKids, GuardianConsents, GuardianTracking, GuardianAlerts,
  OrganizerDashboard, CreateEvent, OrganizerRegistrations, OrganizerResults,
  ModeratorDashboard, ModeratorVerifications, ModeratorReports, ModeratorHidden, ModeratorSuspects,
  ModeratorJournal,
  SupportDashboard, SupportTickets, SupportPayments, SupportDisputes,
} from '@/components/workspace/Others';
import { WorkspaceHeader } from '@/components/workspace/Shell';
import {
  AdminOverview, AdminUsers, AdminOrganizations, AdminPlayers, AdminOpportunities,
  AdminEvents, AdminModeration, AdminTickets, AdminBilling, AdminContent,
  AdminNotifications, AdminSettings, AdminAudit, AdminAdmins,
} from '@/components/workspace/Admin';
import { SectionHead } from '@/components/common/Bits';
import { navigate } from '@/lib/router';
import { cn } from '@/lib/utils';

/** En mode réel : synchronise le store avec la session NextAuth + /api/state. */
function RealSessionSync() {
  const { status } = useSession();
  useEffect(() => {
    if (!isApiMode() || status === 'loading') return;
    let alive = true;
    fetchState<DemoState>().then(st => {
      if (!alive) return;
      if (st) useCourtLink.setState(s => ({ ...s, ...st, dataSource: 'api', hydrated: true }));
      else useCourtLink.setState({ hydrated: true });
    });
    return () => { alive = false; };
  }, [status]);
  return null;
}

export default function Home() {
  const { route } = useHashRoute();
  const { players, opportunities, hydrated } = useCourtLink();

  // route par défaut
  useEffect(() => {
    if (!window.location.hash) window.location.hash = '/';
  }, []);

  const inWorkspace = route.startsWith('/app') || route.startsWith('/admin');

  /* ── Résolution des vues workspace ── */
  let workspace: React.ReactNode = null;
  if (route === '/app') {
    workspace = <RoleHome />;
  } else {
    switch (route) {
      case '/app/profil': workspace = <PlayerProfileEdit />; break;
      case '/app/opportunites': workspace = <PlayerSwitch a={<PlayerOpportunities />} b={<ClubOpportunities />} />; break;
      case '/app/candidatures': workspace = <PlayerApplications />; break;
      case '/app/invitations': workspace = <PlayerInvitations />; break;
      case '/app/messages': workspace = <MessagesView />; break;
      case '/app/suivis': workspace = <PlayerFollows />; break;
      case '/app/abonnement': workspace = <SubscriptionView />; break;
      case '/app/parametres': workspace = <PlayerSettings />; break;
      case '/app/notifications': workspace = <NotificationsView />; break;
      case '/app/recherche': workspace = <AdvancedSearch />; break;
      case '/app/pipeline': workspace = <ClubPipeline />; break;
      case '/app/nouvelle-opportunite': workspace = <CreateOpportunity />; break;
      case '/app/comparaison': workspace = <CompareView />; break;
      case '/app/organisation': workspace = <ClubOrganization />; break;
      case '/app/analytique': workspace = <ClubAnalytics />; break;
      case '/app/favoris': workspace = <ScoutFavorites />; break;
      case '/app/rapports': workspace = <ScoutReports />; break;
      case '/app/notes': workspace = <ScoutNotes />; break;
      case '/app/recherches': workspace = <SavedSearchesView />; break;
      case '/app/mineurs': workspace = <GuardianKids />; break;
      case '/app/consentements': workspace = <GuardianConsents />; break;
      case '/app/visibilite': workspace = <GuardianKids />; break;
      case '/app/suivi': workspace = <GuardianTracking />; break;
      case '/app/alertes': workspace = <GuardianAlerts />; break;
      case '/app/creer-evenement': workspace = <CreateEvent />; break;
      case '/app/inscriptions': workspace = <OrganizerRegistrations />; break;
      case '/app/resultats': workspace = <OrganizerResults />; break;
      case '/app/verifications': workspace = <ModeratorVerifications />; break;
      case '/app/signalements': workspace = <ModeratorReports />; break;
      case '/app/masques': workspace = <ModeratorHidden />; break;
      case '/app/suspects': workspace = <ModeratorSuspects />; break;
      case '/app/journal': workspace = <div><WorkspaceHeader title="Journal des décisions" sub="Toutes les actions de modération, horodatées." /><div className="card-court p-6"><ModeratorJournal /></div></div>; break;
      case '/app/tickets': workspace = <SupportTickets />; break;
      case '/app/paiements': workspace = <SupportPayments />; break;
      case '/app/litiges': workspace = <SupportDisputes />; break;
      case '/admin': workspace = <AdminOverview />; break;
      case '/admin/utilisateurs': workspace = <AdminUsers />; break;
      case '/admin/organisations': workspace = <AdminOrganizations />; break;
      case '/admin/verifications': workspace = <ModeratorVerifications />; break;
      case '/admin/joueurs': workspace = <AdminPlayers />; break;
      case '/admin/opportunites': workspace = <AdminOpportunities />; break;
      case '/admin/evenements': workspace = <AdminEvents />; break;
      case '/admin/moderation': workspace = <AdminModeration />; break;
      case '/admin/tickets': workspace = <AdminTickets />; break;
      case '/admin/facturation': workspace = <AdminBilling />; break;
      case '/admin/contenus': workspace = <AdminContent />; break;
      case '/admin/notifications': workspace = <AdminNotifications />; break;
      case '/admin/parametres': workspace = <AdminSettings />; break;
      case '/admin/journal': workspace = <AdminAudit />; break;
      case '/admin/admins': workspace = <AdminAdmins />; break;
      case '/demo': workspace = <DemoLauncher />; break;
      default:
        if (inWorkspace) workspace = <NotFoundWorkspace />;
        else workspace = null;
    }
  }

  if (inWorkspace) {
    return (
      <SessionProvider>
        <RealSessionSync />
        <PublicHeader route={route} />
        <div className="min-h-[calc(100vh-4rem)] flex flex-col">
          <WorkspaceShell route={route}>
            {!hydrated ? <LoadingState /> : workspace}
          </WorkspaceShell>
          <PublicFooter />
        </div>
      </SessionProvider>
    );
  }

  /* ── Vues publiques ── */
  let page: React.ReactNode;
  const segs = route.split('/').filter(Boolean);

  switch (segs[0]) {
    case undefined:
      page = (
        <>
          <Hero featured={players.length} />
          <Ticker />
          <FeaturedPlayers />
          <RecentOpportunities />
          <ClosingCTA />
        </>
      );
      break;
    case 'joueurs':
      page = segs[1] ? <PlayerProfile id={segs[1]} /> : <PlayersDirectory />;
      break;
    case 'organisations':
      page = segs[1] ? <OrgProfile id={segs[1]} /> : <OrgsDirectory />;
      break;
    case 'opportunites':
      page = segs[1] ? <OpportunityDetail id={segs[1]} /> : <OpportunitiesPage />;
      break;
    case 'evenements':
      page = segs[1] ? <EventDetail id={segs[1]} /> : <EventsPage />;
      break;
    case 'tarifs': page = <PricingPage />; break;
    case 'fonctionnement-joueurs': page = <HowPlayerPage />; break;
    case 'fonctionnement-clubs': page = <HowClubPage />; break;
    case 'aide': page = <FaqPage />; break;
    case 'contact': page = <ContactPage />; break;
    case 'signaler': page = <ReportPage />; break;
    case 'connexion': page = <LoginPage />; break;
    case 'inscription': page = <RegisterPage />; break;
    case 'recuperation': page = <ForgotPage />; break;
    case 'confidentialite': page = <PrivacyPage />; break;
    case 'conditions': page = <TermsPage />; break;
    case 'demo': page = <DemoLauncher publicMode />; break;
    default:
      page = (
        <div className="mx-auto max-w-2xl px-4 py-24 text-center">
          <p className="font-score text-6xl text-[var(--ball)]">404</p>
          <h1 className="mt-4 font-display text-2xl font-black">Page introuvable</h1>
          <p className="mt-2 text-sm text-muted-foreground">Le chemin <code>{route}</code> n'existe pas sur CourtLink.</p>
          <button onClick={() => navigate('/')} className="btn-ball mt-6">Retour à l'accueil</button>
        </div>
      );
  }

  return (
    <SessionProvider>
      <RealSessionSync />
      <div className="flex min-h-screen flex-col">
        <PublicHeader route={route} />
        <main className="flex-1" key={route}>{page}</main>
        <PublicFooter />
      </div>
    </SessionProvider>
  );
}

/* ── Helpers ── */

function RoleHome() {
  const { role } = useCourtLink();
  switch (role) {
    case 'player': return <PlayerDashboard />;
    case 'guardian': return <GuardianDashboard />;
    case 'club': return <ClubDashboard />;
    case 'scout': return <ScoutDashboard />;
    case 'organizer': return <OrganizerDashboard />;
    case 'moderator': return <ModeratorDashboard />;
    case 'support': return <SupportDashboard />;
    case 'admin': return <AdminOverview />;
    default: return <PlayerDashboard />;
  }
}

function PlayerSwitch({ a, b }: { a: React.ReactNode; b: React.ReactNode }) {
  const { role } = useCourtLink();
  return role === 'club' ? b : a;
}

function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-9 w-64 rounded-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
      </div>
      <div className="skeleton h-64 rounded-xl" />
    </div>
  );
}

function NotFoundWorkspace() {
  return (
    <div className="py-20 text-center">
      <p className="font-score text-5xl text-[var(--ball)]">404</p>
      <h1 className="mt-3 font-display text-2xl font-black">Page d'espace introuvable</h1>
      <button onClick={() => navigate('/app')} className="btn-ball mt-5">Retour au tableau de bord</button>
    </div>
  );
}

/** Lanceur de comptes démo (page /demo) */
function DemoLauncher({ publicMode }: { publicMode?: boolean }) {
  const { login, demoLogin, role, loggedIn, dataSource, demoAccountsActive } = useCourtLink();

  const enter = async (role: import('@/lib/types').Role, target: string) => {
    if (dataSource === 'api') {
      const ok = await demoLogin(role);
      if (ok) navigate(target);
    } else {
      login(role);
      navigate(target);
    }
  };
  const locked = dataSource === 'api' && !demoAccountsActive;
  const accounts: { role: import('@/lib/types').Role; label: string; note: string; target: string }[] = [
    { role: 'player', label: 'Joueur', note: 'Sèmèvo H., arrière U21 vérifié', target: '/app' },
    { role: 'guardian', label: 'Parent / tuteur', note: 'Consentements & protection mineurs', target: '/app' },
    { role: 'club', label: 'Club / académie', note: 'Cotonou Hoopers — pipeline complet', target: '/app' },
    { role: 'scout', label: 'Recruteur / scout', note: 'Mamadou B. — rapports & favoris', target: '/app' },
    { role: 'organizer', label: 'Organisateur', note: 'Bénin 3x3 — événements', target: '/app' },
    { role: 'moderator', label: 'Modérateur', note: 'Vérifications & signalements', target: '/app' },
    { role: 'support', label: 'Support', note: 'Tickets & facturation', target: '/app' },
    { role: 'admin', label: 'Administrateur', note: 'Console plateforme complète', target: '/admin' },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6">
      {publicMode && (
        <SectionHead eyebrow="Mode démonstration" title="Tester chaque rôle en un clic" sub="Le changement de rôle est réservé à la démonstration et ne constitue pas une authentification sécurisée." />
      )}
      {locked && (
        <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4 text-xs leading-relaxed text-amber-300">
          Les accès de démonstration sont actuellement <strong className="font-semibold">désactivés par l’administration</strong> de la plateforme.
          Un super administrateur peut les ouvrir depuis la console « Administrateurs ».
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        {accounts.map(a => (
          <div key={a.role} className={cn('card-court flex items-center gap-4 p-5', role === a.role && loggedIn && 'border-[var(--ball)]')}>
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] font-display text-sm font-bold text-[var(--ball)]">
              {a.label.slice(0, 2).toUpperCase()}
            </span>
            <div className="flex-1">
              <p className="font-display text-sm font-bold">{a.label}</p>
              <p className="text-xs text-muted-foreground">{a.note}</p>
            </div>
            <button disabled={locked} onClick={() => enter(a.role, a.target)} className="btn-ball !py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40">Entrer</button>
          </div>
        ))}
      </div>
      <p className="mt-6 rounded-lg border border-[var(--amber-glow)]/40 bg-[color-mix(in_oklch,var(--amber-glow)_8%,transparent)] p-4 text-xs leading-relaxed text-muted-foreground">
        <strong className="font-semibold text-foreground">Mode démonstration</strong> — toutes les données sont fictives, stockées dans votre navigateur, et les paiements sont simulés. Aucune authentification sécurisée n'est implémentée dans ce prototype.
      </p>
    </div>
  );
}
