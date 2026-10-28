/**
 * CourtLink — seed de la base de données réelle.
 *
 * Usage :
 *   bun prisma/seed.ts                 → crée admin + 8 comptes démo + contenu de démonstration
 *   SEED_DEMO=0 bun prisma/seed.ts     → crée uniquement l'admin et les plans
 *
 * Comptes créés (mot de passe unique démo : demo1234 — À CHANGER en production) :
 *   admin@demo.courtlink  (admin)   semevo@demo.courtlink (player)  tuteur@demo.courtlink (guardian)
 *   club@demo.courtlink (club)      scout@demo.courtlink (scout)    events@demo.courtlink (organizer)
 *   moderation@demo.courtlink (moderator)  support@demo.courtlink (support)
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Client lié au schéma disponible : sqlite local ou postgres selon la génération en cours.
const db = new PrismaClient();

const DEMO_PASSWORD = 'demo1234';

const demoUsers = [
  { email: 'admin@demo.courtlink', name: 'Admin général', role: 'admin' },
  { email: 'semevo@demo.courtlink', name: 'Sèmèvo Hountondji', role: 'player' },
  { email: 'tuteur@demo.courtlink', name: 'Gérard Ndiaye', role: 'guardian' },
  { email: 'club@demo.courtlink', name: 'Cotonou Hoopers', role: 'club' },
  { email: 'scout@demo.courtlink', name: 'Mamadou Bamba', role: 'scout' },
  { email: 'events@demo.courtlink', name: 'Bénin 3x3', role: 'organizer' },
  { email: 'moderation@demo.courtlink', name: 'Camille H.', role: 'moderator' },
  { email: 'support@demo.courtlink', name: 'Nadège S.', role: 'support' },
];

async function main() {
  const seedDemo = process.env.SEED_DEMO !== '0';
  const hash = bcrypt.hashSync(DEMO_PASSWORD, 10);

  /* ── Admin réel (à personnaliser via ADMIN_EMAIL / ADMIN_PASSWORD) ── */
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@courtlink.bj';
  const adminPassword = process.env.ADMIN_PASSWORD || 'courtlink-admin-2026';
  await db.user.upsert({
    where: { email: adminEmail },
    update: { isSuperAdmin: true },
    create: { email: adminEmail, name: 'Administrateur CourtLink', role: 'admin', isSuperAdmin: true, passwordHash: bcrypt.hashSync(adminPassword, 10) },
  });
  console.log(`✔ admin réel : ${adminEmail}`);

  /* ── Plans tarifaires ── */
  const plans = [
    { id: 'free', name: 'Découverte', audience: 'Joueurs & parents', price: 0, features: ['Profil sportif complet', '3 candidatures par mois', 'Messagerie limitée'] },
    { id: 'pro', name: 'Pro', audience: 'Joueurs sérieux', price: 3000, features: ['Candidatures illimitées', 'Badge « profil vérifiable »', 'Statistiques avancées', 'Priorité dans les recherches'], highlighted: true },
    { id: 'club', name: 'Club Pro', audience: 'Clubs & académies', price: 25000, features: ['Pipeline de recrutement illimité', 'Publication d\u2019opportunités', 'Comparateur & rapports', '5 comptes staff'] },
    { id: 'scout', name: 'Scout', audience: 'Recruteurs indépendants', price: 15000, features: ['Répertoire complet', 'Rapports & notes privées', 'Recherches sauvegardées avec alertes'] },
  ];
  for (const p of plans) {
    await db.plan.upsert({ where: { id: p.id }, update: {}, create: { ...p, features: JSON.stringify(p.features) } });
  }
  console.log('✔ plans tarifaires');

  await db.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { tagline: 'La plateforme de recrutement basketball de l\u2019Afrique de l\u2019Ouest' },
  });

  if (!seedDemo) {
    console.log('SEED_DEMO=0 → comptes démo et contenu ignorés.');
    return;
  }

  /* ── 8 comptes démo ── */
  const userIds: Record<string, string> = {};
  for (const u of demoUsers) {
    const row = await db.user.upsert({
      where: { email: u.email },
      update: { passwordHash: hash },
      create: { email: u.email, name: u.name, role: u.role, passwordHash: hash, country: 'Bénin' },
    });
    userIds[u.role] = row.id;
  }
  console.log('✔ 8 comptes démo (mot de passe : demo1234)');

  /* ── Contenu de démonstration (import des données du mode démo) ── */
  const { seedPlayers, seedOrganizations, seedOpportunities, seedEvents, seedApplications, seedRegistrations,
    seedConversations, seedVerifications, seedReports, seedTickets, seedPayments, seedAuditLogs,
    seedScoutingReports, seedSavedSearches, seedPrivateNotes, seedConsentRequests } = await import('../src/lib/demo-data');

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
    await db.player.update({ where: { id: 'p1' }, data: { ownerId: userIds.player } }).catch(() => {});
    console.log(`✔ ${seedPlayers.length} joueurs`);
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
    await db.organization.update({ where: { id: 'org1' }, data: { ownerId: userIds.club } }).catch(() => {});
    console.log(`✔ ${seedOrganizations.length} organisations`);
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
    console.log(`✔ ${seedOpportunities.length} opportunités`);
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
    console.log(`✔ ${seedEvents.length} événements`);
  }

  if ((await db.application.count()) === 0) {
    for (const a of seedApplications) {
      await db.application.create({ data: {
        id: a.id, playerId: a.playerId, playerName: a.playerName, opportunityId: a.opportunityId,
        opportunityTitle: a.opportunityTitle, orgId: a.orgId, status: a.status, updatedAt: a.updatedAt,
        motivation: a.motivation, history: JSON.stringify(a.history),
      } });
    }
    console.log(`✔ ${seedApplications.length} candidatures`);
  }

  if ((await db.eventRegistration.count()) === 0) {
    for (const r of seedRegistrations) {
      await db.eventRegistration.create({ data: {
        id: r.id, eventId: r.eventId, eventTitle: r.eventTitle, playerId: r.playerId, playerName: r.playerName,
        status: r.status, registeredAt: r.registeredAt, consent: r.consent,
      } });
    }
  }

  if ((await db.conversation.count()) === 0) {
    for (const c of seedConversations) {
      await db.conversation.create({ data: {
        id: c.id, participants: JSON.stringify(c.participants), participantNames: JSON.stringify(c.participantNames),
        subject: c.subject, messages: JSON.stringify(c.messages), unread: c.unread, updatedAt: c.updatedAt,
      } });
    }
  }

  if ((await db.verification.count()) === 0) {
    for (const v of seedVerifications) {
      await db.verification.create({ data: {
        id: v.id, subject: v.subject, subjectType: v.subjectType, subjectId: v.subjectId, status: v.status,
        submitted: v.submitted, documents: JSON.stringify(v.documents), reviewer: v.reviewer, justification: v.justification,
      } });
    }
  }

  if ((await db.report.count()) === 0) {
    for (const r of seedReports) {
      await db.report.create({ data: {
        id: r.id, subject: r.subject, target: r.target, reason: r.reason, details: r.details, status: r.status,
        priority: r.priority, submitted: r.submitted, reporter: r.reporter, action: r.action,
      } });
    }
  }

  if ((await db.ticket.count()) === 0) {
    for (const t of seedTickets) {
      await db.ticket.create({ data: {
        id: t.id, subject: t.subject, requester: t.requester, topic: t.topic, status: t.status,
        priority: t.priority, opened: t.opened, messages: JSON.stringify(t.messages),
      } });
    }
  }

  if ((await db.payment.count()) === 0) {
    for (const p of seedPayments) {
      await db.payment.create({ data: { ...p } });
    }
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
  }

  if ((await db.savedSearch.count()) === 0) {
    for (const s of seedSavedSearches) {
      await db.savedSearch.create({ data: {
        id: s.id, userId: userIds.scout, name: s.name, query: s.query, filters: JSON.stringify(s.filters), alerts: s.alerts,
      } });
    }
  }

  if ((await db.privateNote.count()) === 0) {
    for (const n of seedPrivateNotes) {
      await db.privateNote.create({ data: {
        id: n.id, userId: userIds.scout, targetId: n.targetId, targetName: n.targetName, body: n.body, date: n.date, author: n.author,
      } });
    }
  }

  if ((await db.consentRequest.count()) === 0) {
    for (const c of seedConsentRequests) {
      await db.consentRequest.create({ data: {
        id: c.id, guardianId: userIds.guardian, playerId: c.playerId, playerName: c.playerName,
        requester: c.requester, kind: c.kind, status: c.status, date: c.date,
      } });
    }
  }

  console.log('✔ contenu de démonstration importé — base réelle prête.');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
