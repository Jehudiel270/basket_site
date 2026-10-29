/**
 * CourtLink — couche serveur « mode réel ».
 * buildState() reconstruit un snapshot au format DemoState du client,
 * scoppé selon la session (rôle + propriété des enregistrements).
 */
import { db } from '@/lib/db';
import type {
  DemoState, Player, Organization, Opportunity, Application, CourtEvent,
  EventRegistration, Conversation, Notification, Verification, Report, Ticket,
  Payment, Plan, AuditLog, ScoutingReport, SavedSearch, PrivateNote,
  ConsentRequest, PlatformSettings, Role, Visibility, StaffMember,
} from '@/lib/types';

export interface SessionUser { id: string; name: string; role: string }

const P = <T>(s: string | null | undefined, fb: T): T => {
  if (!s) return fb;
  try { return JSON.parse(s) as T; } catch { return fb; }
};

/* ── Mappers ligne → type client ── */

interface PlayerRow {
  id: string; name: string; photo: string; country: string; city: string; birthDate: string;
  height: number; weight: number; position: string; secondaryPositions: string;
  dominantHand: string; club: string; number: number; rating: number; verified: boolean;
  available: boolean; visibility: string; bio: string; languages: string; availability: string;
  goals: string; targetZones: string; education: string; experience: string; stats: string;
  videos: string; references: string; guardianId: string | null; isMinor: boolean;
  suspended: boolean; wingspan: number | null; verticalReach: number | null;
  views: number; videoViews: number;
}

const mapPlayer = (r: PlayerRow): Player => ({
  id: r.id, name: r.name, photo: r.photo, country: r.country, city: r.city,
  birthDate: r.birthDate, height: r.height, weight: r.weight, position: r.position,
  secondaryPositions: P<string[]>(r.secondaryPositions, []),
  dominantHand: r.dominantHand as Player['dominantHand'],
  club: r.club, number: r.number, rating: r.rating, verified: r.verified,
  available: r.available, visibility: r.visibility as Visibility, bio: r.bio,
  languages: P<string[]>(r.languages, []), availability: r.availability,
  goals: P<string[]>(r.goals, []), targetZones: P<string[]>(r.targetZones, []),
  education: r.education, experience: P(r.experience, []), stats: P(r.stats, []),
  videos: P(r.videos, []), references: P(r.references, []),
  guardianId: r.guardianId ?? undefined, isMinor: r.isMinor, suspended: r.suspended,
  wingspan: r.wingspan ?? undefined, verticalReach: r.verticalReach ?? undefined,
  views: r.views, videoViews: r.videoViews,
});

const mapOrg = (r: { id: string; name: string; type: string; country: string; city: string; logoSeed: string; image: string; verified: boolean; verificationStatus: string; members: number; playersCount: number; founded: string; description: string; divisions: string; achievements: string; staff: string; suspended: boolean }): Organization => ({
  id: r.id, name: r.name, type: r.type as Organization['type'], country: r.country, city: r.city,
  logoSeed: r.logoSeed, image: r.image, verified: r.verified,
  verificationStatus: r.verificationStatus as Organization['verificationStatus'],
  members: r.members, playersCount: r.playersCount, founded: r.founded, description: r.description,
  divisions: P<string[]>(r.divisions, []), achievements: P<string[]>(r.achievements, []),
  staff: P(r.staff, []), suspended: r.suspended,
});

const mapOpp = (r: { id: string; orgId: string; org: string; title: string; type: string; country: string; city: string; position: string; ageRange: string; level: string; deadline: string; startDate: string; status: string; description: string; requirements: string; conditions: string; slots: number; applicants: number; salary: string; createdAt: string }): Opportunity => ({
  id: r.id, orgId: r.orgId, org: r.org, title: r.title, type: r.type, country: r.country, city: r.city,
  position: r.position, ageRange: r.ageRange, level: r.level, deadline: r.deadline, startDate: r.startDate,
  status: r.status as Opportunity['status'], description: r.description,
  requirements: P<string[]>(r.requirements, []), conditions: P<string[]>(r.conditions, []),
  slots: r.slots, applicants: r.applicants, salary: r.salary, createdAt: r.createdAt,
});

const mapApp = (r: { id: string; playerId: string; playerName: string; opportunityId: string; opportunityTitle: string; orgId: string; status: string; updatedAt: string; motivation: string; history: string }): Application => ({
  id: r.id, playerId: r.playerId, playerName: r.playerName, opportunityId: r.opportunityId,
  opportunityTitle: r.opportunityTitle, orgId: r.orgId, status: r.status as Application['status'],
  updatedAt: r.updatedAt, motivation: r.motivation, history: P(r.history, []),
});

const mapEvent = (r: { id: string; title: string; kind: string; city: string; country: string; venue: string; date: string; endDate: string; participants: number; capacity: number; description: string; program: string; price: string; ageRange: string; status: string; image: string; results: string | null; organizerId: string; organizer: string }): CourtEvent => ({
  id: r.id, title: r.title, kind: r.kind as CourtEvent['kind'], city: r.city, country: r.country,
  venue: r.venue, date: r.date, endDate: r.endDate, participants: r.participants, capacity: r.capacity,
  description: r.description, program: P<string[]>(r.program, []), price: r.price, ageRange: r.ageRange,
  status: r.status as CourtEvent['status'], image: r.image,
  results: r.results ? P(r.results, []) : undefined, organizerId: r.organizerId, organizer: r.organizer,
});

const mapConv = (r: { id: string; participants: string; participantNames: string; subject: string; messages: string; unread: boolean; updatedAt: string }, userName: string): Conversation => {
  const messages = P<{ from: string; body: string; time: string; me?: boolean }[]>(r.messages, []);
  return {
    id: r.id, participants: P<string[]>(r.participants, []),
    participantNames: P<string[]>(r.participantNames, []),
    subject: r.subject,
    messages: messages.map(m => ({ ...m, me: m.from === userName ? true : m.me })),
    unread: r.unread, updatedAt: r.updatedAt,
  };
};

/* ── Snapshot complet scoppé par session ── */
export async function buildState(user: SessionUser | null): Promise<DemoState & { sessionRole: Role | null }> {
  const isStaff = !!user && ['moderator', 'support', 'admin'].includes(user.role);

  const [
    players, orgs, opps, apps, events, regs, convs, notifs, verifs, reports,
    tickets, payments, plans, audits, scoutReps, savedS, notesP, consents,
    favorites, follows, hidden, suspended, settingsRow, userRow,
  ] = await Promise.all([
    db.player.findMany({ orderBy: { rating: 'desc' } }),
    db.organization.findMany(),
    db.opportunity.findMany({ orderBy: { id: 'desc' } }),
    db.application.findMany({ orderBy: { id: 'desc' } }),
    db.courtEvent.findMany({ orderBy: { date: 'asc' } }),
    db.eventRegistration.findMany({ orderBy: { id: 'desc' } }),
    db.conversation.findMany({ orderBy: { updatedAt: 'desc' } }),
    user ? db.notification.findMany({ where: { userId: user.id }, orderBy: { id: 'desc' }, take: 30 }) : Promise.resolve([]),
    db.verification.findMany({ orderBy: { id: 'desc' } }),
    db.report.findMany({ orderBy: { id: 'desc' } }),
    db.ticket.findMany({ orderBy: { id: 'desc' } }),
    db.payment.findMany({ orderBy: { id: 'desc' } }),
    db.plan.findMany(),
    db.auditLog.findMany({ orderBy: { id: 'desc' }, take: 60 }),
    db.scoutingReport.findMany({ orderBy: { id: 'desc' } }),
    user ? db.savedSearch.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
    user ? db.privateNote.findMany({ where: { userId: user.id }, orderBy: { id: 'desc' } }) : Promise.resolve([]),
    db.consentRequest.findMany({ orderBy: { id: 'desc' } }),
    user ? db.favorite.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
    user ? db.follow.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
    user ? db.hiddenContent.findMany({ where: { userId: user.id } }) : Promise.resolve([]),
    db.suspendedAccount.findMany(),
    db.platformSettings.findUnique({ where: { id: 'singleton' } }),
    user ? db.user.findUnique({ where: { id: user.id } }) : Promise.resolve(null),
  ]);

  const userName = user?.name ?? '';
  const myPlayerIds = user ? players.filter(p => p.ownerId === user.id).map(p => p.id) : [];
  const myOrgIds = user ? orgs.filter(o => o.ownerId === user.id).map(o => o.id) : [];
  const myProfileIds = [...myPlayerIds, ...myOrgIds, user ? `u-${user.id}` : ''];

  /* Scopage des candidatures : les miennes (joueur) ou celles de mes organisations (club) */
  const scopedApps = !user ? [] : apps.filter(a =>
    isStaff || myPlayerIds.includes(a.playerId) || myOrgIds.includes(a.orgId) || user.role === 'scout' && a.id !== '',
  );

  const scopedRegs = !user ? [] : regs.filter(r => myPlayerIds.includes(r.playerId) || r.id === '' || (user.role === 'organizer' && true));
  const scopedNotifs: Notification[] = notifs.map(n => ({ id: n.id, title: n.title, body: n.body, time: n.time, read: n.read, kind: n.kind as Notification['kind'] }));

  const scopedConvs = convs
    .filter(c => {
      const parts = P<string[]>(c.participants, []);
      return !user ? false : parts.includes(user.id) || parts[0] === 'me' && (userName === P<string[]>(c.participantNames, [])[0]?.replace('Vous', userName) || user.role === 'player');
    })
    .map(c => mapConv(c, userName));

  const scopedTickets = tickets.filter(t => isStaff || t.requester === userName);
  const scopedPayments = payments.filter(p => isStaff || p.userId === user?.id || p.user === userName);
  const scopedVerifs = verifs.filter(v => isStaff || myProfileIds.includes(v.subjectId));
  const scopedReports = reports.filter(r => isStaff || r.reporter === userName || r.reporter === 'Vous');
  const scopedAudits: AuditLog[] = isStaff ? audits.map(a => ({ id: a.id, time: a.time, actor: a.actor, action: a.action, scope: a.scope })) : [];
  const scopedScoutReps = scoutReps.filter(r => isStaff || r.scout === userName);
  const scopedConsents = consents.filter(c => user && (c.guardianId === user.id || c.requester === userName || isStaff));

  const settings: PlatformSettings = settingsRow ? {
    brandName: settingsRow.brandName, tagline: settingsRow.tagline, accentColor: settingsRow.accentColor,
    maintenance: settingsRow.maintenance, newRegistrations: settingsRow.newRegistrations,
    autoVerifyPlayers: settingsRow.autoVerifyPlayers, maxFreeApplications: settingsRow.maxFreeApplications,
    featuredSlots: settingsRow.featuredSlots,
  } : {
    brandName: 'CourtLink', tagline: '', accentColor: '#ff6b35', maintenance: false,
    newRegistrations: true, autoVerifyPlayers: false, maxFreeApplications: 5, featuredSlots: 6,
  };

  const myPlayers = players.filter(p => p.ownerId === user?.id);

  /* Équipe staff — visible par l'administration ; le nommage est réservé au super admin */
  const isSuperAdmin = !!userRow?.isSuperAdmin;
  const staff = user?.role === 'admin'
    ? await db.user.findMany({
        where: { role: { in: ['admin', 'moderator', 'support'] } },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, email: true, role: true, isSuperAdmin: true },
      })
    : [];

  /* Accès démo ouverts ? (décision du super admin, dérivée du journal d'audit) */
  const { demoAccountsActive } = await import('./demo-data');
  const demoOpen = await demoAccountsActive(db);

  return {
    role: (user?.role as Role) ?? 'visitor',
    loggedIn: !!user,
    currentUserId: myPlayers[0]?.id ?? user?.id ?? '',
    isSuperAdmin: !!userRow?.isSuperAdmin,
    demoAccountsActive: demoOpen,
    staff: staff as StaffMember[],
    players: players.map(mapPlayer),
    organizations: orgs.map(mapOrg),
    opportunities: opps.filter(o => o.status !== 'Brouillon' || myOrgIds.includes(o.orgId)).map(mapOpp),
    applications: scopedApps.map(mapApp),
    events: events.map(mapEvent),
    registrations: scopedRegs.map(r => ({
      id: r.id, eventId: r.eventId, eventTitle: r.eventTitle, playerId: r.playerId,
      playerName: r.playerName, status: r.status as EventRegistration['status'],
      registeredAt: r.registeredAt, consent: r.consent,
    })),
    conversations: scopedConvs,
    notifications: scopedNotifs,
    verifications: scopedVerifs.map(v => ({
      id: v.id, subject: v.subject, subjectType: v.subjectType as Verification['subjectType'],
      subjectId: v.subjectId, status: v.status as Verification['status'], submitted: v.submitted,
      documents: P<string[]>(v.documents, []), reviewer: v.reviewer ?? undefined, justification: v.justification ?? undefined,
    })),
    reports: scopedReports.map(r => ({
      id: r.id, subject: r.subject, target: r.target, reason: r.reason, details: r.details,
      status: r.status as Report['status'], priority: r.priority as Report['priority'],
      submitted: r.submitted, reporter: r.reporter, action: r.action ?? undefined,
    })),
    tickets: scopedTickets.map(t => ({
      id: t.id, subject: t.subject, requester: t.requester, topic: t.topic,
      status: t.status as Ticket['status'], priority: t.priority as Ticket['priority'],
      opened: t.opened, messages: P(t.messages, []),
    })),
    payments: scopedPayments.map(p => ({
      id: p.id, userId: p.userId, user: p.user, plan: p.plan, amount: p.amount, method: p.method,
      status: p.status as Payment['status'], date: p.date, invoice: p.invoice,
    })),
    subscription: userRow?.subPlanId ? {
      planId: userRow.subPlanId,
      status: (userRow.subStatus ?? 'Actif') as 'Actif' | 'Essai' | 'Expiré',
      renews: userRow.subRenews ?? '—', since: userRow.subSince ?? '—',
    } : null,
    plans: plans.map(p => ({
      id: p.id, name: p.name, audience: p.audience, price: p.price, currency: p.currency,
      period: p.period as Plan['period'], features: P<string[]>(p.features, []),
      highlighted: p.highlighted, active: p.active,
    })),
    auditLogs: scopedAudits,
    scoutingReports: scopedScoutReps.map(r => ({
      id: r.id, playerId: r.playerId, playerName: r.playerName, scout: r.scout,
      strengths: P<string[]>(r.strengths, []), improvements: P<string[]>(r.improvements, []),
      confidence: r.confidence as ScoutingReport['confidence'], observations: r.observations,
      date: r.date, rating: r.rating,
    })),
    savedSearches: savedS.map(s => ({
      id: s.id, name: s.name, query: s.query, filters: P<Record<string, string>>(s.filters, {}), alerts: s.alerts,
    })),
    privateNotes: notesP.map(n => ({
      id: n.id, targetId: n.targetId, targetName: n.targetName, body: n.body, date: n.date, author: n.author,
    })),
    consentRequests: scopedConsents.map(c => ({
      id: c.id, guardianId: c.guardianId, playerId: c.playerId, playerName: c.playerName,
      requester: c.requester, kind: c.kind as ConsentRequest['kind'],
      status: c.status as ConsentRequest['status'], date: c.date,
    })),
    favorites: favorites.map(f => f.playerId),
    followedClubs: follows.map(f => f.orgId),
    hiddenContent: hidden.map(h => h.contentId),
    suspendedAccounts: suspended.map(s => s.accountId),
    settings,
    profileViews: myPlayers.reduce((acc, p) => acc + p.views, 0),
    videoViews: myPlayers.reduce((acc, p) => acc + p.videoViews, 0),
    sessionRole: (user?.role as Role) ?? null,
  };
}
