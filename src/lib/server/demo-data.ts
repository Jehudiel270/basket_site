/**
 * CourtLink — moteur des données de démonstration (côté serveur).
 *
 * Utilisé par :
 *   - prisma/seed.ts (amorçage de la base)
 *   - l'action serveur `loadDemoData` (console super admin)
 *
 * Sécurité :
 *   - Les comptes @demo.courtlink sont TOUJOURS créés avec un hash aléatoire
 *     (aucun mot de passe connue n'existe dans le code ni dans le repo).
 *   - L'accès démo passe exclusivement par /api/demo-login, activable ou non
 *     par un super administrateur (voir actions `setDemoAccounts`).
 *   - L'état actif/désactivé est dérivé du journal d'audit (dernière entrée
 *     « Comptes démo »), donc aucune colonne supplémentaire en base.
 */
import bcrypt from 'bcryptjs';

/* eslint-disable @typescript-eslint/no-explicit-any */
type AnyDB = any;

export const DEMO_DOMAIN = '@demo.courtlink';

export const DEMO_USERS: { email: string; name: string; role: string }[] = [
  { email: 'admin@demo.courtlink', name: 'Admin général', role: 'admin' },
  { email: 'semevo@demo.courtlink', name: 'Sèmèvo Hountondji', role: 'player' },
  { email: 'tuteur@demo.courtlink', name: 'Gérard Ndiaye', role: 'guardian' },
  { email: 'club@demo.courtlink', name: 'Cotonou Hoopers', role: 'club' },
  { email: 'scout@demo.courtlink', name: 'Mamadou Bamba', role: 'scout' },
  { email: 'events@demo.courtlink', name: 'Bénin 3x3', role: 'organizer' },
  { email: 'moderation@demo.courtlink', name: 'Camille H.', role: 'moderator' },
  { email: 'support@demo.courtlink', name: 'Nadège S.', role: 'support' },
];

/** Hash d'un secret aléatoire : rend toute connexion par mot de passe impossible. */
export function lockedHash(): string {
  return bcrypt.hashSync(Math.random().toString(36) + Date.now() + Math.random().toString(36), 10);
}

/**
 * Crée les comptes de démonstration manquants (jamais de mot de passe connu :
 * hash aléatoire). Les comptes existants ne sont jamais modifiés.
 */
export async function ensureDemoUsers(db: AnyDB): Promise<{ created: string[]; total: number; userIds: Record<string, string> }> {
  const created: string[] = [];
  const userIds: Record<string, string> = {};
  for (const u of DEMO_USERS) {
    const existing = await db.user.findUnique({ where: { email: u.email } });
    if (existing) {
      userIds[u.role] = existing.id;
      continue;
    }
    const row = await db.user.create({
      data: { email: u.email, name: u.name, role: u.role, passwordHash: lockedHash(), country: 'Bénin' },
    });
    userIds[u.role] = row.id;
    created.push(u.email);
  }
  const total = await db.user.count({ where: { email: { endsWith: DEMO_DOMAIN } } });
  return { created, total, userIds };
}

/**
 * État d'ouverture des accès démo : dérivé de la dernière entrée d'audit
 * « Comptes démo ». Aucune entrée = désactivé (sécurisé par défaut).
 */
export async function demoAccountsActive(db: AnyDB): Promise<boolean> {
  const last = await db.auditLog.findFirst({
    where: { action: { contains: 'Comptes démo' } },
    orderBy: { id: 'desc' },
  });
  // « ACCÈS OUVERT » = ouvert ; « ACCÈS FERMÉ » ne contient pas « OUVERT ».
  return !!last && last.action.includes('OUVERT');
}

/**
 * Complète la base avec le contenu de démonstration (idempotent :
 * chaque bloc n'est créé que si la table concernée est vide).
 */
export async function ensureDemoContent(db: AnyDB, userIds: Record<string, string>): Promise<Record<string, number>> {
  const { seedPlayers, seedOrganizations, seedOpportunities, seedEvents, seedApplications, seedRegistrations,
    seedConversations, seedVerifications, seedReports, seedTickets, seedPayments, seedAuditLogs,
    seedScoutingReports, seedSavedSearches, seedPrivateNotes, seedConsentRequests } = await import('../demo-data');

  const summary: Record<string, number> = {};

  if ((await db.player.count()) === 0) {
    for (const p of seedPlayers) {
      await db.player.create({ data: {
        id: p.id, name: p.name, photo: p.photo, country: p.country, city: p.city, birthDate: p.birthDate,
        height: p.height, weight: p.weight, position: p.position, secondaryPositions: JSON.stringify(p.secondaryPositions),
        dominantHand: p.dominantHand, club: p.club, number: p.number, rating: p.rating, verified: p.verified,
        available: p.available, visibility: p.visibility, bio: p.bio, languages: JSON.stringify(p.languages),
        availability: p.availability, goals: JSON.stringify(p.goals), targetZones: JSON.stringify(p.targetZones),
        education: p.education, experience: JSON.stringify(p.experience), stats: JSON.stringify(p.stats),
        videos: JSON.stringify(p.videos), references: JSON.stringify(p.references), guardianId: p.guardianId,
        isMinor: p.isMinor, suspended: p.suspended ?? false, wingspan: p.wingspan, verticalReach: p.verticalReach,
        views: p.views, videoViews: p.videoViews,
      } });
    }
    // Le compte joueur démo possède le profil p1
    if (userIds.player) await db.player.update({ where: { id: 'p1' }, data: { ownerId: userIds.player } }).catch(() => {});
    summary.joueurs = seedPlayers.length;
  }

  if ((await db.organization.count()) === 0) {
    for (const o of seedOrganizations) {
      await db.organization.create({ data: {
        id: o.id, name: o.name, type: o.type, country: o.country, city: o.city, logoSeed: o.logoSeed,
        image: o.image, verified: o.verified, verificationStatus: o.verificationStatus, members: o.members,
        playersCount: o.playersCount, founded: o.founded, description: o.description,
        divisions: JSON.stringify(o.divisions), achievements: JSON.stringify(o.achievements), staff: JSON.stringify(o.staff),
        suspended: o.suspended ?? false,
      } });
    }
    if (userIds.club) await db.organization.update({ where: { id: 'org1' }, data: { ownerId: userIds.club } }).catch(() => {});
    summary.organisations = seedOrganizations.length;
  }

  if ((await db.opportunity.count()) === 0) {
    for (const o of seedOpportunities) {
      await db.opportunity.create({ data: {
        id: o.id, orgId: o.orgId, org: o.org, title: o.title, type: o.type, country: o.country, city: o.city,
        position: o.position, ageRange: o.ageRange, level: o.level, deadline: o.deadline, startDate: o.startDate,
        status: o.status, description: o.description, requirements: JSON.stringify(o.requirements),
        conditions: JSON.stringify(o.conditions), slots: o.slots, applicants: o.applicants,
        salary: o.salary, createdAt: o.createdAt,
      } });
    }
    summary.opportunites = seedOpportunities.length;
  }

  if ((await db.courtEvent.count()) === 0) {
    for (const e of seedEvents) {
      await db.courtEvent.create({ data: {
        id: e.id, title: e.title, kind: e.kind, city: e.city, country: e.country, venue: e.venue, date: e.date,
        endDate: e.endDate, participants: e.participants, capacity: e.capacity, description: e.description,
        program: JSON.stringify(e.program), price: e.price, ageRange: e.ageRange, status: e.status,
        image: e.image, results: e.results ? JSON.stringify(e.results) : null,
        organizerId: e.organizerId, organizer: e.organizer,
      } });
    }
    summary.evenements = seedEvents.length;
  }

  if ((await db.application.count()) === 0) {
    for (const a of seedApplications) {
      await db.application.create({ data: {
        id: a.id, playerId: a.playerId, playerName: a.playerName, opportunityId: a.opportunityId,
        opportunityTitle: a.opportunityTitle, orgId: a.orgId, status: a.status, updatedAt: a.updatedAt,
        motivation: a.motivation, history: JSON.stringify(a.history),
      } });
    }
    summary.candidatures = seedApplications.length;
  }

  if ((await db.eventRegistration.count()) === 0) {
    for (const r of seedRegistrations) {
      await db.eventRegistration.create({ data: {
        id: r.id, eventId: r.eventId, eventTitle: r.eventTitle, playerId: r.playerId, playerName: r.playerName,
        status: r.status, registeredAt: r.registeredAt, consent: r.consent,
      } });
    }
    summary.inscriptions = seedRegistrations.length;
  }

  if ((await db.conversation.count()) === 0) {
    for (const c of seedConversations) {
      await db.conversation.create({ data: {
        id: c.id, participants: JSON.stringify(c.participants), participantNames: JSON.stringify(c.participantNames),
        subject: c.subject, messages: JSON.stringify(c.messages), unread: c.unread, updatedAt: c.updatedAt,
      } });
    }
    summary.conversations = seedConversations.length;
  }

  if ((await db.verification.count()) === 0) {
    for (const v of seedVerifications) {
      await db.verification.create({ data: {
        id: v.id, subject: v.subject, subjectType: v.subjectType, subjectId: v.subjectId, status: v.status,
        submitted: v.submitted, documents: JSON.stringify(v.documents), reviewer: v.reviewer, justification: v.justification,
      } });
    }
    summary.verifications = seedVerifications.length;
  }

  if ((await db.report.count()) === 0) {
    for (const r of seedReports) {
      await db.report.create({ data: {
        id: r.id, subject: r.subject, target: r.target, reason: r.reason, details: r.details, status: r.status,
        priority: r.priority, submitted: r.submitted, reporter: r.reporter, action: r.action,
      } });
    }
    summary.signalements = seedReports.length;
  }

  if ((await db.ticket.count()) === 0) {
    for (const t of seedTickets) {
      await db.ticket.create({ data: {
        id: t.id, subject: t.subject, requester: t.requester, topic: t.topic, status: t.status,
        priority: t.priority, opened: t.opened, messages: JSON.stringify(t.messages),
      } });
    }
    summary.tickets = seedTickets.length;
  }

  if ((await db.payment.count()) === 0) {
    for (const p of seedPayments) {
      await db.payment.create({ data: { ...p } });
    }
    summary.paiements = seedPayments.length;
  }

  if ((await db.auditLog.count()) === 0) {
    for (const l of seedAuditLogs) {
      await db.auditLog.create({ data: { ...l } });
    }
  }

  if ((await db.scoutingReport.count()) === 0) {
    for (const r of seedScoutingReports) {
      await db.scoutingReport.create({ data: {
        id: r.id, playerId: r.playerId, playerName: r.playerName, scout: r.scout,
        strengths: JSON.stringify(r.strengths), improvements: JSON.stringify(r.improvements),
        confidence: r.confidence, observations: r.observations, date: r.date, rating: r.rating,
      } });
    }
    summary.rapportsScouting = seedScoutingReports.length;
  }

  if ((await db.savedSearch.count()) === 0) {
    for (const s of seedSavedSearches) {
      await db.savedSearch.create({ data: {
        id: s.id, userId: userIds.scout, name: s.name, query: s.query, filters: JSON.stringify(s.filters), alerts: s.alerts,
      } });
    }
    summary.recherches = seedSavedSearches.length;
  }

  if ((await db.privateNote.count()) === 0) {
    for (const n of seedPrivateNotes) {
      await db.privateNote.create({ data: {
        id: n.id, userId: userIds.scout, targetId: n.targetId, targetName: n.targetName, body: n.body, date: n.date, author: n.author,
      } });
    }
    summary.notesPrivees = seedPrivateNotes.length;
  }

  if ((await db.consentRequest.count()) === 0) {
    for (const c of seedConsentRequests) {
      await db.consentRequest.create({ data: {
        id: c.id, guardianId: userIds.guardian, playerId: c.playerId, playerName: c.playerName,
        requester: c.requester, kind: c.kind, status: c.status, date: c.date,
      } });
    }
    summary.consentsTuteurs = seedConsentRequests.length;
  }

  return summary;
}
