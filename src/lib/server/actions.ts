/**
 * CourtLink — bus d'actions serveur (« mode réel »).
 * Chaque mutation du client arrive ici via POST /api/actions/[action],
 * est validée par session + ownership, puis écrite dans Prisma.
 */
import { db } from '@/lib/db';
import type { SessionUser } from '@/lib/server/data';

const J = (v: unknown): string => JSON.stringify(v ?? []);
const now = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ' · ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const today = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

class ActionError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

const staff = (u: SessionUser) => ['moderator', 'support', 'admin'].includes(u.role);

/** Serialise un patch : tableaux/objets → JSON, booléens/nombres/texte → brut. */
function serializePatch(patch: Record<string, unknown>, allowed: string[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of allowed) {
    if (!(k in patch)) continue;
    const v = patch[k];
    out[k] = (Array.isArray(v) || (v && typeof v === 'object')) ? J(v) : v;
  }
  return out;
}

async function myPlayer(userId: string) {
  const p = await db.player.findFirst({ where: { ownerId: userId } });
  if (!p) throw new ActionError('Aucun profil joueur associé à ce compte.', 403);
  return p;
}

async function myOrg(userId: string) {
  const o = await db.organization.findFirst({ where: { ownerId: userId } });
  if (!o) throw new ActionError('Aucune organisation associée à ce compte.', 403);
  return o;
}

async function audit(actor: string, action: string, scope: string) {
  await db.auditLog.create({ data: { id: `l-${Date.now()}-${Math.floor(Math.random() * 1e4)}`, time: now(), actor, action, scope } });
}

async function notify(userId: string, title: string, body: string, kind = 'info') {
  await db.notification.create({ data: { id: `n-${Date.now()}-${Math.floor(Math.random() * 1e4)}`, userId, title, body, time: 'À l\u2019instant', kind } });
}

const PLAYER_FIELDS = ['name', 'photo', 'country', 'city', 'birthDate', 'height', 'weight', 'position', 'secondaryPositions', 'dominantHand', 'club', 'number', 'rating', 'verified', 'available', 'visibility', 'bio', 'languages', 'availability', 'goals', 'targetZones', 'education', 'experience', 'stats', 'videos', 'references', 'isMinor', 'suspended', 'wingspan', 'verticalReach'];
const ORG_FIELDS = ['name', 'type', 'country', 'city', 'logoSeed', 'image', 'verified', 'verificationStatus', 'members', 'playersCount', 'founded', 'description', 'divisions', 'achievements', 'staff', 'suspended'];
const OPP_FIELDS = ['title', 'type', 'country', 'city', 'position', 'ageRange', 'level', 'deadline', 'startDate', 'status', 'description', 'requirements', 'conditions', 'slots', 'salary'];
const EVENT_FIELDS = ['title', 'kind', 'city', 'country', 'venue', 'date', 'endDate', 'capacity', 'description', 'program', 'price', 'ageRange', 'status', 'image', 'results'];
const PLAN_FIELDS = ['name', 'audience', 'price', 'currency', 'period', 'features', 'highlighted', 'active'];

export async function applyAction(user: SessionUser | null, action: string, payload: Record<string, never> | any): Promise<{ ok: true }> {
  const u = user;
  const p = (payload ?? {}) as Record<string, any>;

  /* ── Actions publiques (sans session) ── */
  if (action === 'submitReport') {
    await db.report.create({ data: {
      id: `rp-${Date.now()}`, subject: String(p.reason ?? 'Signalement'), target: String(p.target ?? ''),
      reason: String(p.reason ?? ''), details: String(p.details ?? ''), status: 'À traiter',
      priority: 'Normale', submitted: 'À l\u2019instant', reporter: u?.name ?? 'Visiteur',
    } });
    await audit(u?.name ?? 'Visiteur', `Nouveau signalement sur ${p.target}`, 'Modération');
    if (u) await notify(u.id, 'Signalement transmis', 'La modération prend le relais. Merci.', 'success');
    return { ok: true };
  }

  if (!u) throw new ActionError('Session requise.', 401);
  const isStaff = staff(u);

  switch (action) {
    /* ── Joueurs ── */
    case 'updatePlayer': {
      if (typeof p.id !== 'string' || !p.id) throw new ActionError('Identifiant joueur manquant.', 400);
      const pl = await db.player.findUnique({ where: { id: p.id } });
      if (!pl || (pl.ownerId !== u.id && !isStaff)) throw new ActionError('Profil non autorisé.', 403);
      await db.player.update({ where: { id: p.id }, data: serializePatch(p.patch, PLAYER_FIELDS) });
      break;
    }
    case 'addSeasonStat': {
      const pl = await myPlayer(u.id);
      const stats = JSON.parse(pl.stats || '[]');
      stats.unshift(p.stat);
      await db.player.update({ where: { id: pl.id }, data: { stats: J(stats) } });
      break;
    }

    /* ── Opportunités ── */
    case 'createOpportunity': {
      const org = await myOrg(u.id);
      await db.opportunity.create({ data: {
        id: String(p.id ?? `o-${Date.now()}`), orgId: org.id, org: org.name,
        title: String(p.title ?? 'Sans titre'), type: String(p.type ?? ''), country: String(p.country ?? org.country),
        city: String(p.city ?? org.city), position: String(p.position ?? ''), ageRange: String(p.ageRange ?? ''),
        level: String(p.level ?? ''), deadline: String(p.deadline ?? ''), startDate: String(p.startDate ?? ''),
        status: 'Ouverte', description: String(p.description ?? ''),
        requirements: J(p.requirements), conditions: J(p.conditions),
        slots: Number(p.slots ?? 1), applicants: 0, salary: String(p.salary ?? ''), createdAt: today(),
      } });
      await audit(u.name, `Publication de l\u2019opportunité « ${p.title} »`, 'Opportunités');
      break;
    }
    case 'updateOpportunity': {
      const opp = await db.opportunity.findUnique({ where: { id: p.id } });
      if (!opp) throw new ActionError('Opportunité introuvable.', 404);
      const org = await db.organization.findUnique({ where: { id: opp.orgId } });
      if (!org || (org.ownerId !== u.id && !isStaff)) throw new ActionError('Opportunité non autorisée.', 403);
      await db.opportunity.update({ where: { id: p.id }, data: serializePatch(p.patch, OPP_FIELDS) });
      break;
    }

    /* ── Candidatures ── */
    case 'applyToOpportunity': {
      const pl = await myPlayer(u.id);
      const opp = await db.opportunity.findUnique({ where: { id: p.oppId } });
      if (!opp) throw new ActionError('Opportunité introuvable.', 404);
      const dup = await db.application.findFirst({ where: { playerId: pl.id, opportunityId: opp.id } });
      if (dup) break;
      await db.application.create({ data: {
        id: `a-${Date.now()}`, playerId: pl.id, playerName: pl.name, opportunityId: opp.id,
        opportunityTitle: opp.title, orgId: opp.orgId, status: 'Nouveau', updatedAt: 'À l\u2019instant',
        motivation: String(p.motivation ?? ''), history: J([{ status: 'Nouveau', date: today() }]),
      } });
      await db.opportunity.update({ where: { id: opp.id }, data: { applicants: { increment: 1 } } });
      await audit(u.name, `Candidature sur « ${opp.title} »`, 'Candidatures');
      await notify(u.id, 'Candidature envoyée', `Votre dossier pour « ${opp.title} » est en attente d\u2019examen.`, 'success');
      break;
    }
    case 'setApplicationStatus': {
      const app = await db.application.findUnique({ where: { id: p.appId } });
      if (!app) throw new ActionError('Candidature introuvable.', 404);
      const org = await db.organization.findUnique({ where: { id: app.orgId } });
      if (!org || (org.ownerId !== u.id && !isStaff)) throw new ActionError('Pipeline non autorisé.', 403);
      const history = JSON.parse(app.history || '[]');
      history.push({ status: p.status, date: today() });
      await db.application.update({ where: { id: app.id }, data: { status: String(p.status), updatedAt: 'À l\u2019instant', history: J(history) } });
      await audit(u.name, `Statut candidature ${app.id} → ${p.status}`, 'Recrutement');
      break;
    }

    /* ── Événements ── */
    case 'createEvent': {
      await db.courtEvent.create({ data: {
        id: String(p.id ?? `e-${Date.now()}`), title: String(p.title ?? 'Événement'), kind: String(p.kind ?? 'Tournoi 3x3'),
        city: String(p.city ?? ''), country: String(p.country ?? 'Bénin'), venue: String(p.venue ?? ''),
        date: String(p.date ?? ''), endDate: String(p.endDate ?? ''), participants: 0,
        capacity: Number(p.capacity ?? 0), description: String(p.description ?? ''),
        program: J(p.program), price: String(p.price ?? 'Gratuit'), ageRange: String(p.ageRange ?? ''),
        status: 'Ouvert', image: String(p.image ?? '/img/event-arena.jpg'), organizerId: u.id, organizer: u.name,
      } });
      await audit(u.name, `Création de l\u2019événement « ${p.title} »`, 'Événements');
      break;
    }
    case 'registerEvent': {
      const pl = await myPlayer(u.id);
      const ev = await db.courtEvent.findUnique({ where: { id: p.eventId } });
      if (!ev) throw new ActionError('Événement introuvable.', 404);
      const dup = await db.eventRegistration.findFirst({ where: { eventId: ev.id, playerId: pl.id } });
      if (dup) break;
      if (ev.participants >= ev.capacity) throw new ActionError('Événement complet.', 409);
      await db.eventRegistration.create({ data: {
        id: `er-${Date.now()}`, eventId: ev.id, eventTitle: ev.title, playerId: pl.id, playerName: pl.name,
        status: 'En attente', registeredAt: 'À l\u2019instant', consent: !pl.isMinor,
      } });
      await db.courtEvent.update({ where: { id: ev.id }, data: { participants: { increment: 1 } } });
      await audit(u.name, `Inscription à « ${ev.title} »`, 'Événements');
      break;
    }
    case 'setRegistrationStatus': {
      const reg = await db.eventRegistration.findUnique({ where: { id: p.regId } });
      if (!reg) throw new ActionError('Inscription introuvable.', 404);
      const ev = await db.courtEvent.findUnique({ where: { id: reg.eventId } });
      if (!ev || (ev.organizerId !== u.id && !isStaff)) throw new ActionError('Non autorisé.', 403);
      await db.eventRegistration.update({ where: { id: reg.id }, data: { status: String(p.status) } });
      break;
    }

    /* ── Favoris & suivis ── */
    case 'toggleFavorite': {
      const key = { userId: u.id, playerId: String(p.playerId) };
      if (await db.favorite.findUnique({ where: { userId_playerId: key } })) await db.favorite.delete({ where: { userId_playerId: key } });
      else await db.favorite.create({ data: key });
      break;
    }
    case 'toggleFollow': {
      const key = { userId: u.id, orgId: String(p.orgId) };
      if (await db.follow.findUnique({ where: { userId_orgId: key } })) await db.follow.delete({ where: { userId_orgId: key } });
      else await db.follow.create({ data: key });
      break;
    }

    /* ── Messagerie ── */
    case 'sendMessage': {
      const conv = await db.conversation.findUnique({ where: { id: p.convId } });
      if (!conv) throw new ActionError('Conversation introuvable.', 404);
      const parts = JSON.parse(conv.participants || '[]') as string[];
      if (!parts.includes(u.id) && !parts.includes('me')) throw new ActionError('Conversation non autorisée.', 403);
      const messages = JSON.parse(conv.messages || '[]');
      messages.push({ from: u.name, body: String(p.body ?? ''), time: now(), me: true });
      await db.conversation.update({ where: { id: conv.id }, data: { messages: J(messages), unread: false, updatedAt: 'À l\u2019instant' } });
      break;
    }
    case 'startConversation': {
      const target = await db.player.findFirst({ where: { name: String(p.targetName ?? '') } });
      const targetUserId = target?.ownerId ?? null;
      await db.conversation.create({ data: {
        id: `c-${Date.now()}`,
        participants: J(targetUserId ? [u.id, targetUserId] : [u.id]),
        participantNames: J([u.name, String(p.targetName ?? '')]),
        subject: String(p.subject ?? 'Contact CourtLink'),
        messages: J([{ from: u.name, body: String(p.body ?? ''), time: now(), me: true }]),
        unread: false, updatedAt: 'À l\u2019instant',
      } });
      await audit(u.name, `Nouveau message à ${p.targetName}`, 'Messagerie');
      break;
    }
    case 'markConversationRead': {
      const conv = await db.conversation.findUnique({ where: { id: p.convId } });
      if (conv) await db.conversation.update({ where: { id: conv.id }, data: { unread: false } });
      break;
    }

    /* ── Notifications ── */
    case 'markAllNotificationsRead':
      await db.notification.updateMany({ where: { userId: u.id }, data: { read: true } });
      break;
    case 'markNotificationRead':
      await db.notification.updateMany({ where: { id: String(p.id), userId: u.id }, data: { read: true } });
      break;

    /* ── Vérifications & modération ── */
    case 'decideVerification': {
      if (!['moderator', 'admin'].includes(u.role)) throw new ActionError('Réservé à la modération.', 403);
      const v = await db.verification.findUnique({ where: { id: p.id } });
      if (!v) throw new ActionError('Dossier introuvable.', 404);
      await db.verification.update({ where: { id: v.id }, data: { status: String(p.decision), justification: String(p.justification ?? ''), reviewer: u.name } });
      if (p.decision === 'Approuvée') {
        if (v.subjectType === 'Organisation') await db.organization.update({ where: { id: v.subjectId }, data: { verified: true, verificationStatus: 'vérifiée' } }).catch(() => {});
        if (v.subjectType === 'Joueur') await db.player.update({ where: { id: v.subjectId }, data: { verified: true } }).catch(() => {});
      }
      if (p.decision === 'Correction demandée' && v.subjectType === 'Organisation') {
        await db.organization.update({ where: { id: v.subjectId }, data: { verificationStatus: 'correction demandée' } }).catch(() => {});
      }
      await audit(u.name, `Vérification ${v.id} : ${p.decision} — ${v.subject}`, 'Vérification');
      break;
    }
    case 'submitVerification': {
      const ids: string[] = [];
      const pl = await db.player.findFirst({ where: { ownerId: u.id } });
      if (pl) ids.push(pl.id);
      const org = await db.organization.findFirst({ where: { ownerId: u.id } });
      if (org) ids.push(org.id);
      await db.verification.create({ data: {
        id: `v-${Date.now()}`, subject: String(p.subject ?? u.name), subjectType: String(p.subjectType ?? 'Joueur'),
        subjectId: ids[0] ?? `u-${u.id}`, status: 'En attente', submitted: 'À l\u2019instant', documents: J(p.documents),
      } });
      await audit(u.name, `Demande de vérification : ${p.subject}`, 'Vérification');
      break;
    }
    case 'decideReport': {
      if (!isStaff) throw new ActionError('Réservé à la modération.', 403);
      await db.report.update({ where: { id: p.id }, data: { status: String(p.decision), action: p.action ? String(p.action) : null } }).catch(() => {});
      await audit(u.name, `Signalement ${p.id} → ${p.decision}`, 'Modération');
      break;
    }
    case 'hideContent': {
      await db.hiddenContent.upsert({ where: { userId_contentId: { userId: u.id, contentId: String(p.contentId) } }, update: {}, create: { userId: u.id, contentId: String(p.contentId) } });
      await audit(u.name, `Masquage du contenu ${p.contentId}`, 'Modération');
      break;
    }
    case 'unhideContent': {
      await db.hiddenContent.deleteMany({ where: { userId: u.id, contentId: String(p.contentId) } });
      break;
    }
    case 'suspendAccount': {
      if (!isStaff) throw new ActionError('Réservé à la modération.', 403);
      await db.suspendedAccount.upsert({ where: { accountId: String(p.accountId) }, update: {}, create: { accountId: String(p.accountId), name: String(p.name ?? '') } });
      await db.player.update({ where: { id: String(p.accountId) }, data: { suspended: true } }).catch(() => {});
      await db.organization.update({ where: { id: String(p.accountId) }, data: { suspended: true } }).catch(() => {});
      await audit(u.name, `Suspension du compte ${p.name} (${p.accountId})`, 'Administration');
      break;
    }
    case 'unsuspendAccount': {
      if (!isStaff) throw new ActionError('Réservé à la modération.', 403);
      await db.suspendedAccount.deleteMany({ where: { accountId: String(p.accountId) } });
      await db.player.update({ where: { id: String(p.accountId) }, data: { suspended: false } }).catch(() => {});
      await db.organization.update({ where: { id: String(p.accountId) }, data: { suspended: false } }).catch(() => {});
      await audit(u.name, `Réactivation du compte ${p.accountId}`, 'Administration');
      break;
    }

    /* ── Scouting & notes ── */
    case 'addScoutingReport': {
      await db.scoutingReport.create({ data: {
        id: `sr-${Date.now()}`, playerId: String(p.playerId ?? ''), playerName: String(p.playerName ?? ''),
        scout: u.name, strengths: J(p.strengths), improvements: J(p.improvements),
        confidence: String(p.confidence ?? 'Moyenne'), observations: String(p.observations ?? ''),
        date: today(), rating: Number(p.rating ?? 0),
      } });
      await audit(u.name, `Rapport de scouting sur ${p.playerName}`, 'Scouting');
      break;
    }
    case 'addPrivateNote': {
      await db.privateNote.create({ data: {
        id: `pn-${Date.now()}`, userId: u.id, targetId: String(p.targetId ?? ''), targetName: String(p.targetName ?? ''),
        body: String(p.body ?? ''), date: today(), author: u.name,
      } });
      break;
    }
    case 'addSavedSearch': {
      await db.savedSearch.create({ data: {
        id: `ss-${Date.now()}`, userId: u.id, name: String(p.name ?? 'Recherche'), query: String(p.query ?? ''),
        filters: J(p.filters ?? {}), alerts: true,
      } });
      break;
    }
    case 'removeSavedSearch':
      await db.savedSearch.deleteMany({ where: { id: String(p.id), userId: u.id } });
      break;

    /* ── Consentements (mineurs) ── */
    case 'decideConsent': {
      const c = await db.consentRequest.findUnique({ where: { id: p.id } });
      if (!c || c.guardianId !== u.id) throw new ActionError('Consentement non autorisé.', 403);
      await db.consentRequest.update({ where: { id: c.id }, data: { status: String(p.decision) } });
      await audit(u.name, `Consentement ${c.id} : ${p.decision}`, 'Consentements');
      break;
    }
    case 'requestContact': {
      const pl = await db.player.findUnique({ where: { id: String(p.playerId) } });
      await db.consentRequest.create({ data: {
        id: `cr-${Date.now()}`, guardianId: pl?.guardianId ?? '', playerId: String(p.playerId ?? ''),
        playerName: String(p.playerName ?? ''), requester: u.name, kind: String(p.kind ?? 'Contact'),
        status: 'En attente', date: 'À l\u2019instant',
      } });
      await audit(u.name, `Demande de contact (${p.kind}) sur ${p.playerName}`, 'Consentements');
      break;
    }

    /* ── Facturation (paiements toujours simulés — aucun encaissement réel) ── */
    case 'checkout': {
      const invoice = `CL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      await db.payment.create({ data: {
        id: `pay-${Date.now()}`, userId: u.id, user: u.name, plan: String(p.planName ?? ''),
        amount: String(p.amount ?? ''), method: `${String(p.method ?? '')} (simulé)`,
        status: 'Confirmé', date: today(), invoice,
      } });
      await db.user.update({ where: { id: u.id }, data: {
        subPlanId: String(p.planId ?? 'free'), subStatus: 'Actif',
        subRenews: String(p.renews ?? '30 juin 2027'), subSince: today(),
      } });
      await audit(u.name, `Abonnement ${p.planName} activé (${invoice})`, 'Facturation');
      await notify(u.id, 'Abonnement activé', `${p.planName} est actif — paiement simulé, aucun encaissement réel.`, 'success');
      break;
    }
    case 'cancelSubscription':
      await db.user.update({ where: { id: u.id }, data: { subStatus: 'Expiré', subRenews: '—' } });
      await audit(u.name, 'Résiliation d\u2019abonnement', 'Facturation');
      break;
    case 'updatePlan': {
      if (u.role !== 'admin') throw new ActionError('Réservé à l\u2019administration.', 403);
      await db.plan.update({ where: { id: String(p.id) }, data: serializePatch(p.patch, PLAN_FIELDS) }).catch(() => {});
      await audit(u.name, `Modification du plan ${p.id}`, 'Administration');
      break;
    }
    case 'resolvePayment': {
      if (!isStaff) throw new ActionError('Réservé au support.', 403);
      await db.payment.update({ where: { id: String(p.id) }, data: { status: String(p.status) } }).catch(() => {});
      await audit(u.name, `Paiement ${p.id} → ${p.status}`, 'Facturation');
      break;
    }

    /* ── Support ── */
    case 'createTicket': {
      await db.ticket.create({ data: {
        id: `t-${Date.now()}`, subject: String(p.subject ?? 'Demande'), requester: u.name,
        topic: String(p.topic ?? ''), status: 'Ouvert', priority: 'Normale', opened: 'À l\u2019instant',
        messages: J([{ from: 'user', body: String(p.body ?? ''), time: 'À l\u2019instant' }]),
      } });
      await audit(u.name, `Nouveau ticket : ${p.subject}`, 'Support');
      break;
    }
    case 'replyTicket': {
      const t = await db.ticket.findUnique({ where: { id: p.id } });
      if (!t || (t.requester !== u.name && !isStaff)) throw new ActionError('Ticket non autorisé.', 403);
      const messages = JSON.parse(t.messages || '[]');
      messages.push({ from: isStaff && t.requester !== u.name ? 'support' : 'user', body: String(p.body ?? ''), time: 'À l\u2019instant' });
      await db.ticket.update({ where: { id: t.id }, data: { messages: J(messages), status: isStaff && t.requester !== u.name ? 'En cours' : t.status } });
      break;
    }
    case 'setTicketStatus': {
      if (!isStaff) throw new ActionError('Réservé au support.', 403);
      await db.ticket.update({ where: { id: String(p.id) }, data: { status: String(p.status) } }).catch(() => {});
      await audit(u.name, `Ticket ${p.id} → ${p.status}`, 'Support');
      break;
    }

    /* ── Staff & super administration ── */
    case 'setStaffRole': {
      const actorRow = await db.user.findUnique({ where: { id: u.id } });
      if (!actorRow?.isSuperAdmin) throw new ActionError('Réservé aux super administrateurs.', 403);
      const newRole = String(p.role);
      if (!['admin', 'moderator', 'support', 'visitor'].includes(newRole)) throw new ActionError('Rôle cible invalide.', 400);
      const targetUser = await db.user.findUnique({ where: { id: String(p.userId) } });
      if (!targetUser) throw new ActionError('Compte introuvable.', 404);
      if (targetUser.id === u.id && newRole !== 'admin') throw new ActionError('Vous ne pouvez pas retirer vos propres accès.', 400);
      if (targetUser.isSuperAdmin && newRole === 'visitor') {
        const supers = await db.user.count({ where: { isSuperAdmin: true } });
        if (supers <= 1) throw new ActionError('Impossible de retirer le dernier super administrateur.', 400);
      }
      await db.user.update({
        where: { id: targetUser.id },
        data: newRole === 'visitor' ? { role: 'visitor', isSuperAdmin: false } : { role: newRole },
      });
      await audit(u.name, `Rôle staff : ${targetUser.email} → ${newRole}`, 'Administration');
      await notify(targetUser.id, 'Vos accès ont été mis à jour', newRole === 'visitor' ? 'Votre accès staff a été retiré par un super administrateur.' : `Votre nouveau rôle : ${newRole}.`, newRole === 'visitor' ? 'warning' : 'success');
      break;
    }
    case 'setSuperAdmin': {
      const actorRow = await db.user.findUnique({ where: { id: u.id } });
      if (!actorRow?.isSuperAdmin) throw new ActionError('Réservé aux super administrateurs.', 403);
      if (String(p.userId) === u.id) throw new ActionError('Vous ne pouvez pas modifier votre propre statut super admin.', 400);
      const targetUser = await db.user.findUnique({ where: { id: String(p.userId) } });
      if (!targetUser) throw new ActionError('Compte introuvable.', 404);
      const on = !!p.on;
      if (!on) {
        const supers = await db.user.count({ where: { isSuperAdmin: true } });
        if (supers <= 1) throw new ActionError('Impossible de retirer le dernier super administrateur.', 400);
      }
      await db.user.update({
        where: { id: targetUser.id },
        data: { isSuperAdmin: on, ...(on && !['admin', 'moderator', 'support'].includes(targetUser.role) ? { role: 'admin' } : {}) },
      });
      await audit(u.name, `Super admin ${on ? 'accordé' : 'retiré'} : ${targetUser.email}`, 'Administration');
      await notify(targetUser.id, on ? 'Statut super administrateur accordé' : 'Statut super administrateur retiré', on ? 'Un super administrateur vous a nommé super administrateur.' : 'Votre statut de super administrateur a été retiré.', on ? 'success' : 'warning');
      break;
    }

    /* ── Paramètres plateforme ── */
    case 'updateSettings': {
      if (u.role !== 'admin') throw new ActionError('Réservé à l\u2019administration.', 403);
      const data: Record<string, unknown> = {};
      const keys = ['brandName', 'tagline', 'accentColor', 'maintenance', 'newRegistrations', 'autoVerifyPlayers', 'maxFreeApplications', 'featuredSlots'];
      for (const k of keys) if (k in p) data[k] = p[k];
      await db.platformSettings.upsert({
        where: { id: 'singleton' }, update: data,
        create: { id: 'singleton', ...data },
      });
      await audit(u.name, `Paramètres mis à jour : ${Object.keys(data).join(', ')}`, 'Administration');
      break;
    }

    default:
      throw new ActionError(`Action inconnue : ${action}`, 404);
  }

  return { ok: true };
}
