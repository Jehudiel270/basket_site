#!/usr/bin/env python3
# Patch de src/lib/store.ts : intégration du mode réel (api) sans casser le mode démo.
import io, sys

PATH = '/home/z/my-project/src/lib/store.ts'
src = io.open(PATH, encoding='utf-8').read()
orig = src

edits = [
    # 1) import du client api
    (
        "} from './demo-data';",
        "} from './demo-data';\nimport { isApiMode, pushAction } from './api-mode';",
    ),
    # 2) interface : champs du mode réel
    (
        "export interface CourtLinkStore extends DemoState {\n  hydrated: boolean;\n  flashToasted: string[];",
        "export interface CourtLinkStore extends DemoState {\n  hydrated: boolean;\n  flashToasted: string[];\n  dataSource: 'demo' | 'api';\n  enterApiSession: (user: { id: string; name: string; role: Role }) => void;\n  applyServerState: (data: Partial<DemoState>) => void;",
    ),
    # 3) état initial + implémentations
    (
        "      hydrated: false,\n      flashToasted: [],\n",
        "      hydrated: false,\n      flashToasted: [],\n      dataSource: 'demo',\n\n      enterApiSession: (user) => {\n        set({ role: user.role, loggedIn: true, currentUserId: user.id, dataSource: 'api', hydrated: true });\n        roleNames[user.role] = user.name;\n      },\n\n      applyServerState: (data) =>\n        set(s => ({ ...s, ...data, hydrated: true })),\n",
    ),
    # 4) updatePlayer
    (
        "      updatePlayer: (id, patch) => {\n        set(s => ({ players: s.players.map(p => (p.id === id ? { ...p, ...patch } : p)) }));",
        "      updatePlayer: (id, patch) => {\n        set(s => ({ players: s.players.map(p => (p.id === id ? { ...p, ...patch } : p)) }));\n        if (isApiMode()) void pushAction('updatePlayer', { id, patch });",
    ),
    # 5) addSeasonStat
    (
        "      addSeasonStat: (playerId, stat) => {\n        set(s => ({\n          players: s.players.map(p => (p.id === playerId ? { ...p, stats: [stat, ...p.stats] } : p)),\n        }));",
        "      addSeasonStat: (playerId, stat) => {\n        set(s => ({\n          players: s.players.map(p => (p.id === playerId ? { ...p, stats: [stat, ...p.stats] } : p)),\n        }));\n        if (isApiMode()) void pushAction('addSeasonStat', { playerId, stat });",
    ),
    # 6) createOpportunity (capture de l'objet créé)
    (
        "      createOpportunity: (opp) => {\n        const id = `o${Date.now()}`;\n        set(s => ({\n          opportunities: [{ ...opp, id, applicants: 0, status: 'Ouverte', createdAt: today() }, ...s.opportunities],\n        }));",
        "      createOpportunity: (opp) => {\n        const id = `o${Date.now()}`;\n        const created = { ...opp, id, applicants: 0, status: 'Ouverte' as const, createdAt: today() };\n        set(s => ({\n          opportunities: [created, ...s.opportunities],\n        }));\n        if (isApiMode()) void pushAction('createOpportunity', created);",
    ),
    # 7) updateOpportunity
    (
        "      updateOpportunity: (id, patch) => {\n        set(s => ({ opportunities: s.opportunities.map(o => (o.id === id ? { ...o, ...patch } : o)) }));",
        "      updateOpportunity: (id, patch) => {\n        set(s => ({ opportunities: s.opportunities.map(o => (o.id === id ? { ...o, ...patch } : o)) }));\n        if (isApiMode()) void pushAction('updateOpportunity', { id, patch });",
    ),
    # 8) applyToOpportunity
    (
        "        toast.success('Candidature envoyée — le club la voit dans son pipeline.');",
        "        if (isApiMode()) void pushAction('applyToOpportunity', { oppId, motivation });\n        toast.success('Candidature envoyée — le club la voit dans son pipeline.');",
    ),
    # 9) setApplicationStatus
    (
        "      setApplicationStatus: (appId, status) => {\n        const app = get().applications.find(a => a.id === appId);\n        set(s => ({\n          applications: s.applications.map(a => (a.id === appId ? { ...a, status, updatedAt: 'À l\\u2019instant', history: [...a.history, { status, date: today() }] } : a)),\n        }));",
        "      setApplicationStatus: (appId, status) => {\n        const app = get().applications.find(a => a.id === appId);\n        set(s => ({\n          applications: s.applications.map(a => (a.id === appId ? { ...a, status, updatedAt: 'À l\\u2019instant', history: [...a.history, { status, date: today() }] } : a)),\n        }));\n        if (isApiMode()) void pushAction('setApplicationStatus', { appId, status });",
    ),
    # 10) createEvent (capture de l'objet créé)
    (
        "      createEvent: (ev) => {\n        const id = `e${Date.now()}`;\n        set(s => ({ events: [{ ...ev, id, participants: 0, status: 'Ouvert', image: '/img/event-arena.jpg' }, ...s.events] }));",
        "      createEvent: (ev) => {\n        const id = `e${Date.now()}`;\n        const created = { ...ev, id, participants: 0, status: 'Ouvert' as const, image: '/img/event-arena.jpg' };\n        set(s => ({ events: [created, ...s.events] }));\n        if (isApiMode()) void pushAction('createEvent', created);",
    ),
    # 11) registerEvent
    (
        "        set(st => ({\n          registrations: [reg, ...st.registrations],\n          events: st.events.map(e => (e.id === eventId ? { ...e, participants: e.participants + 1 } : e)),\n        }));",
        "        set(st => ({\n          registrations: [reg, ...st.registrations],\n          events: st.events.map(e => (e.id === eventId ? { ...e, participants: e.participants + 1 } : e)),\n        }));\n        if (isApiMode()) void pushAction('registerEvent', { eventId });",
    ),
    # 12) setRegistrationStatus
    (
        "      setRegistrationStatus: (regId, status) => {\n        set(s => ({ registrations: s.registrations.map(r => (r.id === regId ? { ...r, status } : r)) }));",
        "      setRegistrationStatus: (regId, status) => {\n        set(s => ({ registrations: s.registrations.map(r => (r.id === regId ? { ...r, status } : r)) }));\n        if (isApiMode()) void pushAction('setRegistrationStatus', { regId, status });",
    ),
    # 13) toggleFavorite
    (
        "        set(s => ({ favorites: fav ? s.favorites.filter(f => f !== playerId) : [...s.favorites, playerId] }));",
        "        set(s => ({ favorites: fav ? s.favorites.filter(f => f !== playerId) : [...s.favorites, playerId] }));\n        if (isApiMode()) void pushAction('toggleFavorite', { playerId });",
    ),
    # 14) toggleFollow
    (
        "        set(s => ({ followedClubs: f ? s.followedClubs.filter(x => x !== orgId) : [...s.followedClubs, orgId] }));",
        "        set(s => ({ followedClubs: f ? s.followedClubs.filter(x => x !== orgId) : [...s.followedClubs, orgId] }));\n        if (isApiMode()) void pushAction('toggleFollow', { orgId });",
    ),
    # 15) sendMessage
    (
        "      sendMessage: (convId, body) => {\n        set(s => ({\n          conversations: s.conversations.map(c => (c.id === convId\n            ? { ...c, messages: [...c.messages, { from: 'Vous', body, time: now(), me: true }], unread: false, updatedAt: 'À l\\u2019instant' }\n            : c)),\n        }));",
        "      sendMessage: (convId, body) => {\n        set(s => ({\n          conversations: s.conversations.map(c => (c.id === convId\n            ? { ...c, messages: [...c.messages, { from: 'Vous', body, time: now(), me: true }], unread: false, updatedAt: 'À l\\u2019instant' }\n            : c)),\n        }));\n        if (isApiMode()) void pushAction('sendMessage', { convId, body });",
    ),
    # 16) startConversation
    (
        "        set(s => ({ conversations: [conv, ...s.conversations] }));\n        toast.success(`Message envoyé à ${targetName}.`);",
        "        set(s => ({ conversations: [conv, ...s.conversations] }));\n        if (isApiMode()) void pushAction('startConversation', { targetName, subject, body });\n        toast.success(`Message envoyé à ${targetName}.`);",
    ),
    # 17) markConversationRead
    (
        "      markConversationRead: (convId) => set(s => ({\n        conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: false } : c)),\n      })),",
        "      markConversationRead: (convId) => set(s => ({\n        conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: false } : c)),\n      }));\n      if (false) void 0;",
    ),
    # 18) notifications
    (
        "      markAllNotificationsRead: () => set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })),\n      markNotificationRead: (id) => set(s => ({ notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)) })),",
        "      markAllNotificationsRead: () => { set(s => ({ notifications: s.notifications.map(n => ({ ...n, read: true })) })); if (isApiMode()) void pushAction('markAllNotificationsRead', {}); },\n      markNotificationRead: (id) => { set(s => ({ notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)) })); if (isApiMode()) void pushAction('markNotificationRead', { id }); },",
    ),
    # 19) decideVerification
    (
        "      decideVerification: (id, decision, justification) => {\n        const v = get().verifications.find(x => x.id === id);\n        set(s => ({\n          verifications: s.verifications.map(x => (x.id === id ? { ...x, status: decision, justification, reviewer: roleNames[get().role] } : x)),\n        }));",
        "      decideVerification: (id, decision, justification) => {\n        const v = get().verifications.find(x => x.id === id);\n        set(s => ({\n          verifications: s.verifications.map(x => (x.id === id ? { ...x, status: decision, justification, reviewer: roleNames[get().role] } : x)),\n        }));\n        if (isApiMode()) void pushAction('decideVerification', { id, decision, justification });",
    ),
    # 20) submitVerification
    (
        "          verifications: [{ id: `v${Date.now()}`, subject, subjectType, subjectId: s.currentUserId || 'self', status: 'En attente', submitted: 'À l\\u2019instant', documents }, ...s.verifications],\n        }));",
        "          verifications: [{ id: `v${Date.now()}`, subject, subjectType, subjectId: s.currentUserId || 'self', status: 'En attente', submitted: 'À l\\u2019instant', documents }, ...s.verifications],\n        }));\n        if (isApiMode()) void pushAction('submitVerification', { subject, subjectType, documents });",
    ),
    # 21) decideReport
    (
        "      decideReport: (id, decision, action) => {\n        set(s => ({ reports: s.reports.map(r => (r.id === id ? { ...r, status: decision, action } : r)) }));",
        "      decideReport: (id, decision, action) => {\n        set(s => ({ reports: s.reports.map(r => (r.id === id ? { ...r, status: decision, action } : r)) }));\n        if (isApiMode()) void pushAction('decideReport', { id, decision, action });",
    ),
    # 22) submitReport
    (
        "          reports: [{ id: `rp${Date.now()}`, subject: reason, target, reason, details, status: 'À traiter', priority: 'Normale', submitted: 'À l\\u2019instant', reporter: 'Vous' }, ...s.reports],\n        }));",
        "          reports: [{ id: `rp${Date.now()}`, subject: reason, target, reason, details, status: 'À traiter', priority: 'Normale', submitted: 'À l\\u2019instant', reporter: 'Vous' }, ...s.reports],\n        }));\n        if (isApiMode()) void pushAction('submitReport', { target, reason, details });",
    ),
    # 23) hideContent / unhideContent
    (
        "      hideContent: (contentId) => {\n        set(s => ({ hiddenContent: [...s.hiddenContent, contentId] }));",
        "      hideContent: (contentId) => {\n        set(s => ({ hiddenContent: [...s.hiddenContent, contentId] }));\n        if (isApiMode()) void pushAction('hideContent', { contentId });",
    ),
    (
        "      unhideContent: (contentId) => {\n        set(s => ({ hiddenContent: s.hiddenContent.filter(c => c !== contentId) }));",
        "      unhideContent: (contentId) => {\n        set(s => ({ hiddenContent: s.hiddenContent.filter(c => c !== contentId) }));\n        if (isApiMode()) void pushAction('unhideContent', { contentId });",
    ),
    # 24) suspendAccount / unsuspendAccount
    (
        "      suspendAccount: (accountId, name) => {\n        set(s => ({ suspendedAccounts: [...s.suspendedAccounts, accountId] }));",
        "      suspendAccount: (accountId, name) => {\n        set(s => ({ suspendedAccounts: [...s.suspendedAccounts, accountId] }));\n        if (isApiMode()) void pushAction('suspendAccount', { accountId, name });",
    ),
    (
        "      unsuspendAccount: (accountId) => {\n        set(s => ({ suspendedAccounts: s.suspendedAccounts.filter(a => a !== accountId) }));",
        "      unsuspendAccount: (accountId) => {\n        set(s => ({ suspendedAccounts: s.suspendedAccounts.filter(a => a !== accountId) }));\n        if (isApiMode()) void pushAction('unsuspendAccount', { accountId });",
    ),
    # 25) addScoutingReport
    (
        "          scoutingReports: [{ ...r, id: `sr${Date.now()}`, date: today(), scout: roleNames[get().role] }, ...s.scoutingReports],\n        }));",
        "          scoutingReports: [{ ...r, id: `sr${Date.now()}`, date: today(), scout: roleNames[get().role] }, ...s.scoutingReports],\n        }));\n        if (isApiMode()) void pushAction('addScoutingReport', r);",
    ),
    # 26) addPrivateNote
    (
        "          privateNotes: [{ id: `pn${Date.now()}`, targetId, targetName, body, date: today(), author: roleNames[get().role] }, ...s.privateNotes],\n        }));",
        "          privateNotes: [{ id: `pn${Date.now()}`, targetId, targetName, body, date: today(), author: roleNames[get().role] }, ...s.privateNotes],\n        }));\n        if (isApiMode()) void pushAction('addPrivateNote', { targetId, targetName, body });",
    ),
    # 27) addSavedSearch / removeSavedSearch
    (
        "        set(s => ({ savedSearches: [...s.savedSearches, { id: `ss${Date.now()}`, name, query, filters, alerts: true }] }));",
        "        set(s => ({ savedSearches: [...s.savedSearches, { id: `ss${Date.now()}`, name, query, filters, alerts: true }] }));\n        if (isApiMode()) void pushAction('addSavedSearch', { name, query, filters });",
    ),
    (
        "      removeSavedSearch: (id) => {\n        set(s => ({ savedSearches: s.savedSearches.filter(s2 => s2.id !== id) }));",
        "      removeSavedSearch: (id) => {\n        set(s => ({ savedSearches: s.savedSearches.filter(s2 => s2.id !== id) }));\n        if (isApiMode()) void pushAction('removeSavedSearch', { id });",
    ),
    # 28) decideConsent
    (
        "      decideConsent: (id, decision) => {\n        set(s => ({ consentRequests: s.consentRequests.map(c => (c.id === id ? { ...c, status: decision } : c)) }));",
        "      decideConsent: (id, decision) => {\n        set(s => ({ consentRequests: s.consentRequests.map(c => (c.id === id ? { ...c, status: decision } : c)) }));\n        if (isApiMode()) void pushAction('decideConsent', { id, decision });",
    ),
    # 29) requestContact
    (
        "          consentRequests: [{ id: `cr${Date.now()}`, guardianId: 'g1', playerId, playerName, requester: roleNames[st.role], kind, status: 'En attente', date: 'À l\\u2019instant' }, ...st.consentRequests],\n        }));",
        "          consentRequests: [{ id: `cr${Date.now()}`, guardianId: 'g1', playerId, playerName, requester: roleNames[st.role], kind, status: 'En attente', date: 'À l\\u2019instant' }, ...st.consentRequests],\n        }));\n        if (isApiMode()) void pushAction('requestContact', { playerId, playerName, kind });",
    ),
    # 30) checkout
    (
        "        set(s => ({\n          payments: [payment, ...s.payments],\n          subscription: { planId: plan.id, status: 'Actif', renews: '30 juin 2027', since: today() },\n        }));",
        "        set(s => ({\n          payments: [payment, ...s.payments],\n          subscription: { planId: plan.id, status: 'Actif', renews: '30 juin 2027', since: today() },\n        }));\n        if (isApiMode()) void pushAction('checkout', { planId: plan.id, planName: plan.name, amount: payment.amount, method, renews: '30 juin 2027' });",
    ),
    # 31) cancelSubscription
    (
        "      cancelSubscription: () => {\n        set(s => ({ subscription: { planId: 'free', status: 'Expiré', renews: '—', since: today() } }));",
        "      cancelSubscription: () => {\n        set(s => ({ subscription: { planId: 'free', status: 'Expiré', renews: '—', since: today() } }));\n        if (isApiMode()) void pushAction('cancelSubscription', {});",
    ),
    # 32) updatePlan
    (
        "      updatePlan: (id, patch) => {\n        set(s => ({ plans: s.plans.map(p => (p.id === id ? { ...p, ...patch } : p)) }));",
        "      updatePlan: (id, patch) => {\n        set(s => ({ plans: s.plans.map(p => (p.id === id ? { ...p, ...patch } : p)) }));\n        if (isApiMode()) void pushAction('updatePlan', { id, patch });",
    ),
    # 33) resolvePayment
    (
        "      resolvePayment: (id, status) => {\n        set(s => ({ payments: s.payments.map(p => (p.id === id ? { ...p, status } : p)) }));",
        "      resolvePayment: (id, status) => {\n        set(s => ({ payments: s.payments.map(p => (p.id === id ? { ...p, status } : p)) }));\n        if (isApiMode()) void pushAction('resolvePayment', { id, status });",
    ),
    # 34) createTicket
    (
        "        set(s => ({\n          tickets: [{ id: `t${Date.now()}`, subject, requester: roleNames[s.role], topic, status: 'Ouvert', priority: 'Normale', opened: 'À l\\u2019instant', messages: [{ from: 'user', body, time: 'À l\\u2019instant' }] }, ...s.tickets],\n        }));",
        "        set(s => ({\n          tickets: [{ id: `t${Date.now()}`, subject, requester: roleNames[s.role], topic, status: 'Ouvert', priority: 'Normale', opened: 'À l\\u2019instant', messages: [{ from: 'user', body, time: 'À l\\u2019instant' }] }, ...s.tickets],\n        }));\n        if (isApiMode()) void pushAction('createTicket', { subject, topic, body });",
    ),
    # 35) replyTicket
    (
        "        set(s => ({\n          tickets: s.tickets.map(t => (t.id === id ? { ...t, messages: [...t.messages, { from: 'support', body, time: 'À l\\u2019instant' }], status: 'En cours' } : t)),\n        }));",
        "        set(s => ({\n          tickets: s.tickets.map(t => (t.id === id ? { ...t, messages: [...t.messages, { from: 'support', body, time: 'À l\\u2019instant' }], status: 'En cours' } : t)),\n        }));\n        if (isApiMode()) void pushAction('replyTicket', { id, body });",
    ),
    # 36) setTicketStatus
    (
        "      setTicketStatus: (id, status) => {\n        set(s => ({ tickets: s.tickets.map(t => (t.id === id ? { ...t, status } : t)) }));",
        "      setTicketStatus: (id, status) => {\n        set(s => ({ tickets: s.tickets.map(t => (t.id === id ? { ...t, status } : t)) }));\n        if (isApiMode()) void pushAction('setTicketStatus', { id, status });",
    ),
    # 37) updateSettings
    (
        "      updateSettings: (patch) => {\n        set(s => ({ settings: { ...s.settings, ...patch } }));",
        "      updateSettings: (patch) => {\n        set(s => ({ settings: { ...s.settings, ...patch } }));\n        if (isApiMode()) void pushAction('updateSettings', patch);",
    ),
    # 38) partialize : rien de persisté en mode api
    (
        "      partialize: (state) => {\n        const { hydrated, flashToasted, ...rest } = state;\n        return rest as CourtLinkStore;\n      },",
        "      partialize: (state) => {\n        if (isApiMode()) return {} as CourtLinkStore;\n        const { hydrated, flashToasted, dataSource, ...rest } = state;\n        return rest as CourtLinkStore;\n      },",
    ),
]

# Correction de l'édition 17 (markConversationRead) : version propre
edits[16] = (
    "      markConversationRead: (convId) => set(s => ({\n        conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: false } : c)),\n      })),",
    "      markConversationRead: (convId) => { set(s => ({\n        conversations: s.conversations.map(c => (c.id === convId ? { ...c, unread: false } : c)),\n      })); if (isApiMode()) void pushAction('markConversationRead', { convId }); },",
)

for i, (old, new) in enumerate(edits):
    if old not in src:
        print(f"ÉCHEC édition #{i} — motif introuvable :\n{old[:120]}...")
        sys.exit(1)
    if src.count(old) != 1:
        print(f"ÉCHEC édition #{i} — motif non unique ({src.count(old)} occurrences).")
        sys.exit(1)
    src = src.replace(old, new)

io.open(PATH, 'w', encoding='utf-8').write(src)
print(f"OK — {len(edits)} éditions appliquées ({len(orig)} → {len(src)} caractères).")
