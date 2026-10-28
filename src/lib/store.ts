'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';
import type {
  DemoState, Player, Role, Opportunity, ApplicationStatus, CourtEvent,
  Application, EventRegistration, Conversation, Verification, Report, Plan,
  ScoutingReport, PrivateNote, PlatformSettings, Payment,
} from './types';
import {
  seedPlayers, seedOrganizations, seedOpportunities, seedEvents, seedApplications,
  seedRegistrations, seedConversations, seedNotifications, seedVerifications,
  seedReports, seedTickets, seedPayments, defaultPlans, seedAuditLogs,
  seedScoutingReports, seedSavedSearches, seedPrivateNotes, seedConsentRequests,
} from './demo-data';
import { isApiMode, pushAction } from './api-mode';

let auditCounter = 100;
let notifCounter = 100;

const now = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const today = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

export interface CourtLinkStore extends DemoState {
  hydrated: boolean;
  flashToasted: string[];
  dataSource: 'demo' | 'api';
  enterApiSession: (user: { id: string; name: string; role: Role }) => void;
  applyServerState: (data: Partial<DemoState>) => void;
  // session
  login: (role: Role, name?: string) => void;
  logout: () => void;
  // players
  updatePlayer: (id: string, patch: Partial<Player>) => void;
  addSeasonStat: (playerId: string, stat: Player['stats'][number]) => void;
  // opportunities
  createOpportunity: (opp: Omit<Opportunity, 'id' | 'applicants' | 'createdAt' | 'status'>) => string;
  updateOpportunity: (id: string, patch: Partial<Opportunity>) => void;
  // applications
  applyToOpportunity: (oppId: string, motivation: string) => void;
  setApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  // events
  createEvent: (ev: Omit<CourtEvent, 'id' | 'participants' | 'status' | 'image'>) => string;
  registerEvent: (eventId: string) => void;
  setRegistrationStatus: (regId: string, status: EventRegistration['status']) => void;
  // favorites / follows
  toggleFavorite: (playerId: string) => void;
  toggleFollow: (orgId: string) => void;
  // messaging
  sendMessage: (convId: string, body: string) => void;
  startConversation: (targetName: string, subject: string, body: string) => void;
  markConversationRead: (convId: string) => void;
  // notifications
  addNotification: (n: { title: string; body: string; kind?: 'info' | 'success' | 'warning' | 'danger'; role?: Role }) => void;
  markAllNotificationsRead: () => void;
  markNotificationRead: (id: string) => void;
  // verification & moderation
  decideVerification: (id: string, decision: 'Approuvée' | 'Refusée' | 'Correction demandée', justification: string) => void;
  submitVerification: (subject: string, subjectType: Verification['subjectType'], documents: string[]) => void;
  decideReport: (id: string, decision: 'En revue' | 'Résolu' | 'Rejeté', action?: string) => void;
  submitReport: (target: string, reason: string, details: string) => void;
  hideContent: (contentId: string) => void;
  unhideContent: (contentId: string) => void;
  suspendAccount: (accountId: string, name: string) => void;
  unsuspendAccount: (accountId: string) => void;
  // scouting
  addScoutingReport: (r: Omit<ScoutingReport, 'id' | 'date' | 'scout'>) => void;
  addPrivateNote: (targetId: string, targetName: string, body: string) => void;
  addSavedSearch: (name: string, query: string, filters: Record<string, string>) => void;
  removeSavedSearch: (id: string) => void;
  // consent
  decideConsent: (id: string, decision: 'Approuvée' | 'Refusée') => void;
  requestContact: (playerId: string, playerName: string, kind: 'Contact' | 'Essai' | 'Partage de données' | 'Média') => void;
  // billing
  checkout: (plan: Plan, method: string) => void;
  cancelSubscription: () => void;
  updatePlan: (id: string, patch: Partial<Plan>) => void;
  resolvePayment: (id: string, status: Payment['status']) => void;
  // tickets
  createTicket: (subject: string, topic: string, body: string) => void;
  replyTicket: (id: string, body: string) => void;
  setTicketStatus: (id: string, status: 'Ouvert' | 'En cours' | 'Résolu') => void;
  // settings & audit
  updateSettings: (patch: Partial<PlatformSettings>) => void;
  addAudit: (action: string, scope: string) => void;
  resetDemo: () => void;
}

const roleNames: Record<Role, string> = {
  visitor: 'Visiteur', player: 'Sèmèvo Hountondji', guardian: 'M. Gérard Ndiaye (tuteur)',
  club: 'Cotonou Hoopers', scout: 'Mamadou Bamba (scout)', organizer: 'Bénin 3x3',
  moderator: 'Camille H. (modération)', support: 'Nadège S. (support)', admin: 'Admin général',
};

const initialData = (): Omit<DemoState, 'role' | 'loggedIn' | 'currentUserId'> => ({
  players: seedPlayers,
  organizations: seedOrganizations,
  opportunities: seedOpportunities,
  applications: seedApplications,
  events: seedEvents,
  registrations: seedRegistrations,
  conversations: seedConversations,
  notifications: seedNotifications,
  verifications: seedVerifications,
  reports: seedReports,
  tickets: seedTickets,
  payments: seedPayments,
  subscription: { planId: 'free', status: 'Actif', renews: '30 juin 2026', since: '01 janvier 2026' },
  plans: defaultPlans,
  auditLogs: seedAuditLogs,
  scoutingReports: seedScoutingReports,
  savedSearches: seedSavedSearches,
  privateNotes: seedPrivateNotes,
  consentRequests: seedConsentRequests,
  favorites: ['p5', 'p15'],
  followedClubs: ['org1', 'org2'],
  hiddenContent: [],
  suspendedAccounts: [],
  settings: {
    brandName: 'CourtLink', tagline: 'Le réseau de confiance du basketball ouest-africain',
    accentColor: '#FF6B1A', maintenance: false, newRegistrations: true,
    autoVerifyPlayers: false, maxFreeApplications: 3, featuredSlots: 4,
  },
  profileViews: 342,
  videoViews: 187,
});

export const useCourtLink = create<CourtLinkStore>()(
  persist(
    (set, get) => ({
      ...initialData(),
      role: 'visitor' as Role,
      loggedIn: false,
      currentUserId: '',
      hydrated: false,
      flashToasted: [],
      dataSource: 'demo',

      enterApiSession: (user) => {
        set({ role: user.role, loggedIn: true, currentUserId: user.id, dataSource: 'api', hydrated: true });
        roleNames[user.role] = user.name;
      },

      applyServerState: (data) =>
        set(s => ({ ...s, ...data, hydrated: true })),

      addAudit: (action, scope) => set(s => ({
        auditLogs: [{ id: `l${auditCounter++}`, time: now(), actor: roleNames[s.role], action, scope }, ...s.auditLogs].slice(0, 60),
      })),

      addNotification: ({ title, body, kind = 'info', role = 'player' }) => set(s => ({
        notifications: [{ id: `n${notifCounter++}`, title, body, time: 'À l\u2019instant', read: false, kind, role }, ...s.notifications].slice(0, 30),
      })),

      login: (role, name) => {
        set({ role, loggedIn: true, currentUserId: role === 'player' ? 'p1' : role === 'club' ? 'org1' : `demo-${role}` });
        if (name) roleNames[role] = name;
        toast.success(`Connecté en mode démonstration — ${roleNames[role]}`);
        get().addAudit(`Connexion mode démo (${role})`, 'Session');
      },

      logout: () => {
        set({ role: 'visitor', loggedIn: false, currentUserId: '' });
        toast('Déconnecté de la démonstration');
      },

      updatePlayer: (id, patch) => {
        set(s => ({ players: s.players.map(p => (p.id === id ? { ...p, ...patch } : p)) }));
        if (isApiMode()) void pushAction('updatePlayer', { id, patch });
        toast.success('Profil mis à jour — l\u2019annuaire public est synchronisé.');
        get().addAudit(`Mise à jour du profil joueur ${id}`, 'Profil');
      },

      addSeasonStat: (playerId, stat) => {
        set(s => ({
          players: s.players.map(p => (p.id === playerId ? { ...p, stats: [stat, ...p.stats] } : p)),
        }));
        if (isApiMode()) void pushAction('addSeasonStat', { playerId, stat });
        toast.success(`Statistiques ${stat.season} ajoutées (${stat.competition}).`);
        get().addAudit(`Ajout de stats ${stat.season} pour ${playerId}`, 'Profil');
      },

      createOpportunity: (opp) => {
        const id = `o${Date.now()}`;
        const created = { ...opp, id, applicants: 0, status: 'Ouverte' as const, createdAt: today() };
        set(s => ({
          opportunities: [created, ...s.opportunities],
        }));
        if (isApiMode()) void pushAction('createOpportunity', created);
        toast.success('Opportunité publiée — visible immédiatement dans l\u2019annuaire public.');
        get().addAudit(`Publication de l\u2019opportunité « ${opp.title} »`, 'Opportunités');
        get().addNotification({ title: 'Nouvelle opportunité', body: `${opp.org} a publié « ${opp.title} » à ${opp.city}.`, kind: 'info' });
        return id;
      },

      updateOpportunity: (id, patch) => {
        set(s => ({ opportunities: s.opportunities.map(o => (o.id === id ? { ...o, ...patch } : o)) }));
        if (isApiMode()) void pushAction('updateOpportunity', { id, patch });
        toast.success('Opportunité mise à jour.');
        get().addAudit(`Modification de l\u2019opportunité ${id} (${patch.status ?? 'contenu'})`, 'Opportunités');
      },

      applyToOpportunity: (oppId, motivation) => {
        const s = get();
        if (s.applications.some(a => a.opportunityId === oppId && a.playerId === (s.currentUserId || 'p1'))) {
          toast.info('Cette candidature est déjà enregistrée.');
          return;
        }
        const opp = s.opportunities.find(o => o.id === oppId);
        const me = s.players.find(p => p.id === (s.currentUserId || 'p1'));
        if (!opp) { toast.error('Opportunité introuvable.'); return; }
        const app: Application = {
          id: `a${Date.now()}`, playerId: me?.id ?? 'p1', playerName: me?.name ?? 'Vous',
          opportunityId: oppId, opportunityTitle: opp.title, orgId: opp.orgId,
          status: 'Nouveau', updatedAt: 'À l\u2019instant', motivation,
          history: [{ status: 'Nouveau', date: today() }],
        };
        set(st => ({
          applications: [app, ...st.applications],
          opportunities: st.opportunities.map(o => (o.id === oppId ? { ...o, applicants: o.applicants + 1 } : o)),
        }));
        if (isApiMode()) void pushAction('applyToOpportunity', { oppId, motivation });
        toast.success('Candidature envoyée — le club la voit dans son pipeline.');
        get().addAudit(`Candidature de ${app.playerName} sur « ${opp.title} »`, 'Candidatures');
        get().addNotification({ title: 'Candidature envoyée', body: `Votre dossier pour « ${opp.title} » est en attente d\u2019examen par ${opp.org}.`, kind: 'success' });
      },

      setApplicationStatus: (appId, status) => {
        const app = get().applications.find(a => a.id === appId);
        set(s => ({
          applications: s.applications.map(a => (a.id === appId ? { ...a, status, updatedAt: 'À l\u2019instant', history: [...a.history, { status, date: today() }] } : a)),
        }));
        if (isApiMode()) void pushAction('setApplicationStatus', { appId, status });
        toast.success(`Pipeline mis à jour : ${status}`);
        get().addAudit(`Statut candidature ${appId} → ${status}`, 'Recrutement');
        if (app) get().addNotification({ title: 'Candidature mise à jour', body: `${app.orgId === 'org1' ? 'Votre club' : 'L\u2019organisation'} a mis à jour « ${app.opportunityTitle} » : ${status}.`, kind: status === 'Refusé' ? 'warning' : 'success' });
      },

      createEvent: (ev) => {
        const id = `e${Date.now()}`;
        const created = { ...ev, id, participants: 0, status: 'Ouvert' as const, image: '/img/event-arena.jpg' };
        set(s => ({ events: [created, ...s.events] }));
        if (isApiMode()) void pushAction('createEvent', created);
        toast.success('Événement créé et publié dans le calendrier public.');
        get().addAudit(`Création de l\u2019événement « ${ev.title} »`, 'Événements');
        return id;
      },

      registerEvent: (eventId) => {
        const s = get();
        const ev = s.events.find(e => e.id === eventId);
        const me = s.players.find(p => p.id === (s.currentUserId || 'p1'));
        if (!ev) return;
        if (s.registrations.some(r => r.eventId === eventId && r.playerId === me?.id)) {
          toast.info('Vous êtes déjà inscrit à cet événement.');
          return;
        }
        if (ev.participants >= ev.capacity) { toast.error('Événement complet.'); return; }
        const reg: EventRegistration = {
          id: `er${Date.now()}`, eventId, eventTitle: ev.title, playerId: me?.id ?? 'p1',
          playerName: me?.name ?? 'Vous', status: 'En attente', registeredAt: 'À l\u2019instant', consent: !me?.isMinor,
        };
        set(st => ({
          registrations: [reg, ...st.registrations],
          events: st.events.map(e => (e.id === eventId ? { ...e, participants: e.participants + 1 } : e)),
        }));
        if (isApiMode()) void pushAction('registerEvent', { eventId });
        toast.success('Inscription enregistrée — l\u2019organisateur la voit dans sa liste.');
        get().addAudit(`Inscription de ${reg.playerName} à « ${ev.title} »`, 'Événements');
      },

      setRegistrationStatus: (regId, status) => {
        set(s => ({ registrations: s.registrations.map(r => (r.id === regId ? { ...r, status } : r)) }));
        if (isApiMode()) void pushAction('setRegistrationStatus', { regId, status });
        toast.success(`Inscription mise à jour : ${status}`);
        get().addAudit(`Statut inscription ${regId} → ${status}`, 'Événements');
      },

      toggleFavorite: (playerId) => {
        const fav = get().favorites.includes(playerId);
        set(s => ({ favorites: fav ? s.favorites.filter(f => f !== playerId) : [...s.favorites, playerId] }));
        if (isApiMode()) void pushAction('toggleFavorite', { playerId });
        toast(fav ? 'Retiré des favoris' : 'Ajouté aux favoris de prospection');
      },

      toggleFollow: (orgId) => {
        const f = get().followedClubs.includes(orgId);
        set(s => ({ followedClubs: f ? s.followedClubs.filter(x => x !== orgId) : [...s.followedClubs, orgId] }));
        if (isApiMode()) void pushAction('toggleFollow', { orgId });
        toast(f ? 'Club retiré de vos suivis' : 'Club suivi — vous recevrez ses opportunités');
      },

      sendMessage: (convId, body) => {
        set(s => ({
          conversations: s.conversations.map(c => (c.id === convId
            ? { ...c, messages: [...c.messages, { from: 'Vous', body, time: now(), me: true }], unread: false, updatedAt: 'À l\u2019instant' }
            : c)),
        }));
        if (isApiMode()) void pushAction('sendMessage', { convId, body });
        toast.success('Message envoyé.');
      },

      startConversation: (targetName, subject, body) => {
        const conv: Conversation = {
          id: `c${Date.now()}`, participants: ['me', targetName], participantNames: ['Vous', targetName],
          subject, messages: [{ from: 'Vous', body, time: now(), me: true }], unread: false, updatedAt: 'À l\u2019instant',
        };
        set(s => ({ conversations: [conv, ...s.conversations] }));
        if (isApiMode()) void pushAction('startConversation', { targetName, subject, body });
        toast.success(`Message envoyé à ${targetName}.`);
        get().addAudit(`Nouveau message à ${targetName}`, 'Messagerie');
      },

      markConversationRead: (convId) => { set(s => ({
        conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: false } : c)),
      })); if (isApiMode()) void pushAction('markConversationRead', { convId }); },

      markAllNotificationsRead: () => { set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })); if (isApiMode()) void pushAction('markAllNotificationsRead', {}); },
      markNotificationRead: (id) => { set(s => ({ notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)) })); if (isApiMode()) void pushAction('markNotificationRead', { id }); },

      decideVerification: (id, decision, justification) => {
        const v = get().verifications.find(x => x.id === id);
        set(s => ({
          verifications: s.verifications.map(x => (x.id === id ? { ...x, status: decision, justification, reviewer: roleNames[get().role] } : x)),
        }));
        if (isApiMode()) void pushAction('decideVerification', { id, decision, justification });
        if (v && decision === 'Approuvée') {
          if (v.subjectType === 'Organisation') set(s => ({ organizations: s.organizations.map(o => (o.id === v.subjectId ? { ...o, verified: true, verificationStatus: 'vérifiée' } : o)) }));
          if (v.subjectType === 'Joueur') set(s => ({ players: s.players.map(p => (p.id === v.subjectId ? { ...p, verified: true } : p)) }));
        }
        if (v && decision === 'Correction demandée' && v.subjectType === 'Organisation') {
          set(s => ({ organizations: s.organizations.map(o => (o.id === v.subjectId ? { ...o, verificationStatus: 'correction demandée' } : o)) }));
        }
        toast.success(`Décision enregistrée : ${decision}`);
        get().addAudit(`Vérification ${id} : ${decision} — ${v?.subject ?? ''}`, 'Vérification');
        get().addNotification({ title: `Vérification ${decision.toLowerCase()}`, body: `${v?.subject ?? 'Le dossier'} — ${justification}`, kind: decision === 'Approuvée' ? 'success' : 'warning' });
      },

      submitVerification: (subject, subjectType, documents) => {
        set(s => ({
          verifications: [{ id: `v${Date.now()}`, subject, subjectType, subjectId: s.currentUserId || 'self', status: 'En attente', submitted: 'À l\u2019instant', documents }, ...s.verifications],
        }));
        if (isApiMode()) void pushAction('submitVerification', { subject, subjectType, documents });
        toast.success('Demande de vérification transmise à la modération.');
        get().addAudit(`Demande de vérification : ${subject}`, 'Vérification');
      },

      decideReport: (id, decision, action) => {
        set(s => ({ reports: s.reports.map(r => (r.id === id ? { ...r, status: decision, action } : r)) }));
        if (isApiMode()) void pushAction('decideReport', { id, decision, action });
        toast.success(`Signalement : ${decision}`);
        get().addAudit(`Signalement ${id} → ${decision}${action ? ` (${action})` : ''}`, 'Modération');
      },

      submitReport: (target, reason, details) => {
        set(s => ({
          reports: [{ id: `rp${Date.now()}`, subject: reason, target, reason, details, status: 'À traiter', priority: 'Normale', submitted: 'À l\u2019instant', reporter: 'Vous' }, ...s.reports],
        }));
        if (isApiMode()) void pushAction('submitReport', { target, reason, details });
        toast.success('Signalement transmis — merci, la modération prend le relais.');
        get().addAudit(`Nouveau signalement sur ${target}`, 'Modération');
      },

      hideContent: (contentId) => {
        set(s => ({ hiddenContent: [...s.hiddenContent, contentId] }));
        if (isApiMode()) void pushAction('hideContent', { contentId });
        toast('Contenu masqué temporairement (visible dans le journal).');
        get().addAudit(`Masquage du contenu ${contentId}`, 'Modération');
      },

      unhideContent: (contentId) => {
        set(s => ({ hiddenContent: s.hiddenContent.filter(c => c !== contentId) }));
        if (isApiMode()) void pushAction('unhideContent', { contentId });
        toast.success('Contenu réaffiché.');
        get().addAudit(`Réaffichage du contenu ${contentId}`, 'Modération');
      },

      suspendAccount: (accountId, name) => {
        set(s => ({ suspendedAccounts: [...s.suspendedAccounts, accountId] }));
        if (isApiMode()) void pushAction('suspendAccount', { accountId, name });
        if (accountId.startsWith('p')) set(s => ({ players: s.players.map(p => (p.id === accountId ? { ...p, suspended: true } : p)) }));
        if (accountId.startsWith('org')) set(s => ({ organizations: s.organizations.map(o => (o.id === accountId ? { ...o, suspended: true } : o)) }));
        toast(`Compte ${name} suspendu — l\u2019état est répercuté partout.`);
        get().addAudit(`Suspension du compte ${name} (${accountId})`, 'Administration');
      },

      unsuspendAccount: (accountId) => {
        set(s => ({ suspendedAccounts: s.suspendedAccounts.filter(a => a !== accountId) }));
        if (isApiMode()) void pushAction('unsuspendAccount', { accountId });
        if (accountId.startsWith('p')) set(s => ({ players: s.players.map(p => (p.id === accountId ? { ...p, suspended: false } : p)) }));
        if (accountId.startsWith('org')) set(s => ({ organizations: s.organizations.map(o => (o.id === accountId ? { ...o, suspended: false } : o)) }));
        toast.success('Compte réactivé.');
        get().addAudit(`Réactivation du compte ${accountId}`, 'Administration');
      },

      addScoutingReport: (r) => {
        set(s => ({
          scoutingReports: [{ ...r, id: `sr${Date.now()}`, date: today(), scout: roleNames[get().role] }, ...s.scoutingReports],
        }));
        if (isApiMode()) void pushAction('addScoutingReport', r);
        toast.success('Rapport de scouting enregistré (confidentiel).');
        get().addAudit(`Rapport de scouting ajouté sur ${r.playerName}`, 'Scouting');
      },

      addPrivateNote: (targetId, targetName, body) => {
        set(s => ({
          privateNotes: [{ id: `pn${Date.now()}`, targetId, targetName, body, date: today(), author: roleNames[get().role] }, ...s.privateNotes],
        }));
        if (isApiMode()) void pushAction('addPrivateNote', { targetId, targetName, body });
        toast.success('Note privée enregistrée.');
      },

      addSavedSearch: (name, query, filters) => {
        set(s => ({ savedSearches: [...s.savedSearches, { id: `ss${Date.now()}`, name, query, filters, alerts: true }] }));
        if (isApiMode()) void pushAction('addSavedSearch', { name, query, filters });
        toast.success(`Recherche « ${name} » sauvegardée avec alertes.`);
      },

      removeSavedSearch: (id) => {
        set(s => ({ savedSearches: s.savedSearches.filter(s2 => s2.id !== id) }));
        if (isApiMode()) void pushAction('removeSavedSearch', { id });
        toast('Recherche supprimée.');
      },

      decideConsent: (id, decision) => {
        set(s => ({ consentRequests: s.consentRequests.map(c => (c.id === id ? { ...c, status: decision } : c)) }));
        if (isApiMode()) void pushAction('decideConsent', { id, decision });
        toast.success(decision === 'Approuvée' ? 'Consentement accordé.' : 'Consentement refusé — le demandeur est notifié.');
        get().addAudit(`Consentement ${id} : ${decision}`, 'Consentements');
      },

      requestContact: (playerId, playerName, kind) => {
        const s = get();
        set(st => ({
          consentRequests: [{ id: `cr${Date.now()}`, guardianId: 'g1', playerId, playerName, requester: roleNames[st.role], kind, status: 'En attente', date: 'À l\u2019instant' }, ...st.consentRequests],
        }));
        if (isApiMode()) void pushAction('requestContact', { playerId, playerName, kind });
        toast.success(`Demande de ${kind.toLowerCase()} transmise${s.players.find(p => p.id === playerId)?.isMinor ? ' — validation du tuteur légal requise.' : '.'}`);
        get().addAudit(`Demande de contact (${kind}) sur ${playerName}`, 'Consentements');
      },

      checkout: (plan, method) => {
        const payment: Payment = {
          id: `pay${Date.now()}`, userId: get().currentUserId || 'me', user: roleNames[get().role],
          plan: plan.name, amount: `${plan.price.toLocaleString('fr-FR')} FCFA`, method: `${method} (simulé)`,
          status: 'Confirmé', date: today(), invoice: `CL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        };
        set(s => ({
          payments: [payment, ...s.payments],
          subscription: { planId: plan.id, status: 'Actif', renews: '30 juin 2027', since: today() },
        }));
        if (isApiMode()) void pushAction('checkout', { planId: plan.id, planName: plan.name, amount: payment.amount, method, renews: '30 juin 2027' });
        toast.success(`Paiement simulé confirmé — ${plan.name} actif. Aucune transaction réelle.`);
        get().addAudit(`Abonnement ${plan.name} activé (${payment.invoice})`, 'Facturation');
      },

      cancelSubscription: () => {
        set(s => ({ subscription: { planId: 'free', status: 'Expiré', renews: '—', since: today() } }));
        if (isApiMode()) void pushAction('cancelSubscription', {});
        toast('Abonnement résilié (retour au plan Découverte).');
        get().addAudit('Résiliation d\u2019abonnement', 'Facturation');
      },

      updatePlan: (id, patch) => {
        set(s => ({ plans: s.plans.map(p => (p.id === id ? { ...p, ...patch } : p)) }));
        if (isApiMode()) void pushAction('updatePlan', { id, patch });
        toast.success('Plan tarifaire mis à jour — la page publique est synchronisée.');
        get().addAudit(`Modification du plan ${id}`, 'Administration');
      },

      resolvePayment: (id, status) => {
        set(s => ({ payments: s.payments.map(p => (p.id === id ? { ...p, status } : p)) }));
        if (isApiMode()) void pushAction('resolvePayment', { id, status });
        toast.success(`Paiement ${id} : ${status}`);
        get().addAudit(`Paiement ${id} → ${status}`, 'Facturation');
      },

      createTicket: (subject, topic, body) => {
        set(s => ({
          tickets: [{ id: `t${Date.now()}`, subject, requester: roleNames[s.role], topic, status: 'Ouvert', priority: 'Normale', opened: 'À l\u2019instant', messages: [{ from: 'user', body, time: 'À l\u2019instant' }] }, ...s.tickets],
        }));
        if (isApiMode()) void pushAction('createTicket', { subject, topic, body });
        toast.success('Ticket envoyé — le support répond en général sous 24 h.');
        get().addAudit(`Nouveau ticket : ${subject}`, 'Support');
      },

      replyTicket: (id, body) => {
        set(s => ({
          tickets: s.tickets.map(t => (t.id === id ? { ...t, messages: [...t.messages, { from: 'support', body, time: 'À l\u2019instant' }], status: 'En cours' } : t)),
        }));
        if (isApiMode()) void pushAction('replyTicket', { id, body });
        toast.success('Réponse envoyée au demandeur.');
        get().addAudit(`Réponse au ticket ${id}`, 'Support');
      },

      setTicketStatus: (id, status) => {
        set(s => ({ tickets: s.tickets.map(t => (t.id === id ? { ...t, status } : t)) }));
        if (isApiMode()) void pushAction('setTicketStatus', { id, status });
        toast.success(`Ticket : ${status}`);
        get().addAudit(`Ticket ${id} → ${status}`, 'Support');
      },

      updateSettings: (patch) => {
        set(s => ({ settings: { ...s.settings, ...patch } }));
        if (isApiMode()) void pushAction('updateSettings', patch);
        toast.success('Paramètres enregistrés.');
        get().addAudit(`Paramètres mis à jour : ${Object.keys(patch).join(', ')}`, 'Administration');
      },

      resetDemo: () => {
        set({ ...initialData(), role: 'visitor', loggedIn: false, currentUserId: '' });
        toast('Données de démonstration réinitialisées.');
      },
    }),
    {
      name: 'courtlink-demo-v2',
      partialize: (state) => {
        if (isApiMode()) return {} as CourtLinkStore;
        const { hydrated, flashToasted, dataSource, ...rest } = state;
        return rest as CourtLinkStore;
      },
      onRehydrateStorage: () => () => {
        // hydrated flag is set by the onFinishHydration listener below
      },
    }
  )
);

// mark hydrated after rehydration
if (typeof window !== 'undefined') {
  useCourtLink.persist.onFinishHydration(() => {
    useCourtLink.setState({ hydrated: true });
  });
  if (useCourtLink.persist.hasHydrated()) useCourtLink.setState({ hydrated: true });
}
