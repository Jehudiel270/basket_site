'use client';

import { useState } from 'react';
import {
  HeartHandshake, UsersRound, FileCheck2, Eye, BellRing, TrendingUp, Plus,
  CalendarDays, ClipboardCheck, Trophy, ShieldCheck, Flag, EyeOff, UserX,
  ScrollText, LifeBuoy, CreditCard, Undo2, Send, Check, X, Ban, AlertTriangle,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { WorkspaceHeader } from './Shell';
import { EmptyState, PlayerMiniRow, BarChart } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

/* ═══════════ TUTEUR ═══════════ */

export function GuardianDashboard() {
  const { players, consentRequests, registrations, applications, suspendedAccounts } = useCourtLink();
  const kids = players.filter(p => p.guardianId === 'g1' || p.guardianId === 'g2' || p.isMinor);
  const myKids = kids.slice(0, 4);
  const pending = consentRequests.filter(c => c.status === 'En attente');
  return (
    <div>
      <WorkspaceHeader
        title="Tableau du représentant légal"
        sub="Vous contrôlez les données, la visibilité et les contacts de vos joueurs mineurs."
        actions={<button onClick={() => navigate('/app/alertes')} className="btn-ghosty !py-2 text-xs"><BellRing size={14} /> Signaler un problème</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Joueurs associés</p><p className="mt-2 font-display text-3xl font-black tnum">{myKids.length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Consentements en attente</p><p className="mt-2 font-display text-3xl font-black tnum text-[var(--ball)]">{pending.length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Candidatures actives</p><p className="mt-2 font-display text-3xl font-black tnum">{applications.filter(a => a.status !== 'Refusé').length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Comptes bloqués par vous</p><p className="mt-2 font-display text-3xl font-black tnum">{suspendedAccounts.length}</p></div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><UsersRound size={17} className="text-[var(--ball)]" /> Mes joueurs mineurs</h2>
          <div className="space-y-2.5">
            {myKids.map(k => (
              <div key={k.id} className="rounded-lg border border-border p-3">
                <PlayerMiniRow player={k} right={<button onClick={() => navigate(`/joueurs/${k.id}`)} className="btn-ghosty !px-2 !py-1 text-[11px]"><Eye size={11} /></button>} />
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span className="chip border-border">Visibilité : {k.visibility === 'public' ? 'Public (limité mineur)' : k.visibility === 'members' ? 'Membres' : 'Privé'}</span>
                  <span className="chip border-green-500/40 text-green-400">Consentement parental : accordé</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><FileCheck2 size={17} className="text-[var(--ball)]" /> Consentements à traiter</h2>
          {pending.length === 0 ? <EmptyState title="Aucune demande en attente" /> : (
            <div className="space-y-3">
              {pending.map(c => (
                <div key={c.id} className="rounded-lg border border-[var(--ball)]/40 p-3.5">
                  <p className="text-sm font-bold">{c.kind} — {c.requester}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Pour {c.playerName} · {c.date}</p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => useCourtLink.getState().decideConsent(c.id, 'Approuvée')} className="btn-ball flex-1 !py-1.5 text-xs"><Check size={12} /> Autoriser</button>
                    <button onClick={() => useCourtLink.getState().decideConsent(c.id, 'Refusée')} className="btn-ghosty flex-1 !py-1.5 text-xs"><X size={12} /> Refuser</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function GuardianKids() {
  const { players, updatePlayer } = useCourtLink();
  const kids = players.filter(p => p.isMinor);
  return (
    <div>
      <WorkspaceHeader title="Joueurs mineurs associés" sub="Un tuteur ne peut consulter que les données des mineurs qui lui sont rattachés." />
      <div className="space-y-4">
        {kids.map(k => (
          <div key={k.id} className="card-court p-5">
            <div className="flex flex-wrap items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={k.photo} alt={k.name} className="h-12 w-12 rounded-full object-cover object-top" />
              <div className="flex-1">
                <p className="font-display text-sm font-bold">{k.name}</p>
                <p className="text-xs text-muted-foreground">{k.position} · {k.city} · né(e) en {k.birthDate.slice(0, 4)}</p>
              </div>
              <button onClick={() => navigate(`/joueurs/${k.id}`)} className="btn-ghosty !py-1.5 text-xs"><Eye size={12} /> Profil public</button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Visibilité du profil</span>
                <select value={k.visibility} onChange={e => updatePlayer(k.id, { visibility: e.target.value as never })} className="h-10 w-full rounded-lg border border-input bg-background px-2 text-sm">
                  <option value="public">Public (coordonnées masquées)</option>
                  <option value="members">Membres connectés</option>
                  <option value="private">Privé</option>
                </select></label>
              <div className="flex items-end">
                <div className="w-full rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  Téléphone & e-mail : <strong className="text-foreground">jamais affichés</strong>. Contact uniquement via demandes approuvées.
                </div>
              </div>
              <div className="flex items-end">
                <div className="w-full rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                  Messagerie filtrée + journalisée. Tout abus est signalable en 1 clic.
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GuardianConsents() {
  const { consentRequests, decideConsent } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Consentements & autorisations" sub="Chaque demande de contact, d'essai ou de partage de données passe par vous." />
      <div className="space-y-3">
        {consentRequests.map(c => (
          <div key={c.id} className="card-court flex flex-wrap items-center gap-3 p-4">
            <FileCheck2 size={17} className={c.status === 'En attente' ? 'text-[var(--ball)]' : 'text-muted-foreground'} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{c.kind} — {c.requester}</p>
              <p className="text-xs text-muted-foreground">Pour {c.playerName} · demandé {c.date}</p>
            </div>
            {c.status === 'En attente' ? (
              <div className="flex gap-2">
                <button onClick={() => decideConsent(c.id, 'Approuvée')} className="btn-ball !py-1.5 text-xs"><Check size={12} /> Autoriser</button>
                <button onClick={() => decideConsent(c.id, 'Refusée')} className="btn-ghosty !py-1.5 text-xs"><X size={12} /> Refuser</button>
              </div>
            ) : (
              <span className={cn('chip', c.status === 'Approuvée' ? 'border-green-500/40 text-green-400' : 'border-red-500/40 text-red-300')}>{c.status}</span>
            )}
          </div>
        ))}
        {consentRequests.length === 0 && <EmptyState title="Aucune demande" hint="Les demandes des clubs et scouts apparaîtront ici." />}
      </div>
    </div>
  );
}

export function GuardianTracking() {
  const { applications, registrations } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Suivi des démarches" sub="Candidatures et inscriptions des joueurs dont vous êtes le représentant." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Candidatures</h2>
          <div className="space-y-2.5">
            {applications.map(a => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div><p className="font-semibold">{a.playerName}</p><p className="text-xs text-muted-foreground">{a.opportunityTitle}</p></div>
                <span className="chip border-[var(--ball)]/40 text-[var(--ball)]">{a.status}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Inscriptions à des événements</h2>
          <div className="space-y-2.5">
            {registrations.map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div><p className="font-semibold">{r.playerName}</p><p className="text-xs text-muted-foreground">{r.eventTitle}</p></div>
                <span className="chip border-border text-muted-foreground">{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function GuardianAlerts() {
  const { submitReport } = useCourtLink();
  const [sent, setSent] = useState(false);
  return (
    <div>
      <WorkspaceHeader title="Alertes & signalement" sub="Signalez tout comportement suspect : les cas impliquant des mineurs sont prioritaires (traitement < 2 h)." />
      {sent ? (
        <div className="card-court p-8 text-center">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400 pop-in"><Check size={26} /></span>
          <h2 className="font-display text-xl font-bold">Signalement transmis</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">La modération a été notifiée en priorité haute. Suivez l'évolution dans le journal des décisions.</p>
          <button onClick={() => setSent(false)} className="btn-ghosty mt-4">Nouveau signalement</button>
        </div>
      ) : (
        <form className="card-court max-w-xl p-6" onSubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget); submitReport(String(fd.get('target')), 'Contact mineur — signalement tuteur', String(fd.get('details'))); setSent(true); }}>
          <div className="mb-4 flex items-start gap-3 rounded-lg border border-[var(--amber-glow)]/40 bg-[color-mix(in_oklch,var(--amber-glow)_8%,transparent)] p-3.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--amber-glow)]" />
            <p className="text-xs leading-relaxed text-muted-foreground">En cas de danger immédiat, contactez d'abord les autorités locales. CourtLink se limite à la modération de la plateforme.</p>
          </div>
          <label className="block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Compte ou contenu visé *</span>
            <input name="target" required placeholder="Nom du profil, du compte…" className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Description des faits *</span>
            <textarea name="details" required rows={5} minLength={20} className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
          <button type="submit" className="btn-ball mt-4 w-full"><Flag size={14} /> Envoyer en priorité haute</button>
        </form>
      )}
    </div>
  );
}

/* ═══════════ ORGANISATEUR ═══════════ */

export function OrganizerDashboard() {
  const { events, registrations, players } = useCourtLink();
  const myEvents = events;
  return (
    <div>
      <WorkspaceHeader title="Mes événements" sub="Créez des combines, tournois et camps ; gérez les inscriptions et les présences."
        actions={<button onClick={() => navigate('/app/creer-evenement')} className="btn-ball !py-2 text-xs"><Plus size={14} /> Créer un événement</button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Événements publiés</p><p className="mt-2 font-display text-3xl font-black tnum">{myEvents.length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Inscriptions totales</p><p className="mt-2 font-display text-3xl font-black tnum">{registrations.length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Taux de remplissage</p><p className="mt-2 font-display text-3xl font-black tnum">{Math.round((myEvents.reduce((s, e) => s + e.participants, 0) / myEvents.reduce((s, e) => s + e.capacity, 0)) * 100)}%</p></div>
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {myEvents.map(e => (
          <div key={e.id} className="card-court overflow-hidden">
            <div className="relative h-36">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.image} alt={e.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.9)] to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="font-display text-base font-bold text-white">{e.title}</h3>
                <p className="text-xs text-white/70">{e.date} · {e.city} · {e.participants}/{e.capacity} inscrits</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4">
              <span className="chip border-[var(--ball)]/40 text-[var(--ball)]">{e.kind}</span>
              <div className="flex gap-2">
                <button onClick={() => navigate('/app/inscriptions')} className="btn-ghosty !py-1.5 text-xs"><ClipboardCheck size={12} /> Inscriptions</button>
                <button onClick={() => navigate(`/evenements/${e.id}`)} className="btn-ghosty !py-1.5 text-xs">Page publique</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreateEvent() {
  const { createEvent } = useCourtLink();
  const [form, setForm] = useState({ title: '', kind: 'Combine', city: 'Cotonou', country: 'Bénin', venue: '', date: '12 juillet 2026', endDate: '12 juillet 2026', capacity: 80, description: '', price: 'Gratuit', ageRange: '16-21 ans' });
  const [done, setDone] = useState(false);
  if (done) {
    return (
      <div className="card-court mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400 pop-in"><Check size={26} /></span>
        <h2 className="font-display text-xl font-bold">Événement créé !</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">Il est visible dans le calendrier public. Les joueurs peuvent s'inscrire immédiatement.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => setDone(false)} className="btn-ghosty">Créer un autre</button>
          <button onClick={() => navigate('/evenements')} className="btn-ball">Voir le calendrier</button>
        </div>
      </div>
    );
  }
  return (
    <div>
      <WorkspaceHeader title="Créer un événement" sub="Les événements donnent de la visibilité : chaque participant repart avec des données mesurées." />
      <form className="card-court max-w-2xl p-6" onSubmit={e => { e.preventDefault(); createEvent({ ...form, organizer: 'Bénin 3x3', organizerId: 'org5', program: form.description.split('\n').slice(0, 4).filter(Boolean) } as never); setDone(true); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs sm:col-span-2"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Titre *</span>
            <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex : CourtLink Combine Parakou" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Format *</span>
            <select value={form.kind} onChange={e => setForm({ ...form, kind: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              {['Combine', 'Showcase', 'Tournoi 3x3', 'Clinic', 'Camp'].map(k => <option key={k}>{k}</option>)}
            </select></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Lieu (salle) *</span>
            <input required value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Ville *</span>
            <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Pays</span>
            <select value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              {['Bénin', "Côte d'Ivoire", 'Togo', 'Sénégal', 'Burkina Faso', 'Cameroun', 'Guinée', 'Mali'].map(c => <option key={c}>{c}</option>)}
            </select></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Date *</span>
            <input required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Date de fin</span>
            <input value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Capacité</span>
            <input type="number" min={10} max={500} value={form.capacity} onChange={e => setForm({ ...form, capacity: +e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm tnum" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Participation</span>
            <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Âges</span>
            <input value={form.ageRange} onChange={e => setForm({ ...form, ageRange: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs sm:col-span-2"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Description & programme (1 ligne = 1 étape) *</span>
            <textarea required rows={4} minLength={30} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
        </div>
        <button type="submit" className="btn-ball mt-5 w-full"><CalendarDays size={15} /> Publier l'événement</button>
      </form>
    </div>
  );
}

export function OrganizerRegistrations() {
  const { registrations, setRegistrationStatus, events } = useCourtLink();
  const [filter, setFilter] = useState('Tous les événements');
  const list = registrations.filter(r => filter === 'Tous les événements' || r.eventTitle === filter);
  return (
    <div>
      <WorkspaceHeader title="Inscriptions" sub="Confirmez, marquez les présences : chaque changement est visible du joueur." />
      <select value={filter} onChange={e => setFilter(e.target.value)} className="mb-4 h-11 rounded-lg border border-input bg-background px-3 text-sm">
        <option>Tous les événements</option>{events.map(e => <option key={e.id}>{e.title}</option>)}
      </select>
      <div className="space-y-3">
        {list.map(r => (
          <div key={r.id} className="card-court flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{r.playerName}</p>
              <p className="text-xs text-muted-foreground">{r.eventTitle} · inscrit {r.registeredAt} · consentement : {r.consent ? 'OK' : 'à vérifier'}</p>
            </div>
            <span className={cn('chip', r.status === 'Présent' ? 'border-green-500/40 text-green-400' : r.status === 'Confirmée' ? 'border-[var(--ball)]/40 text-[var(--ball)]' : r.status === 'Annulée' ? 'border-red-500/40 text-red-300' : 'border-amber-500/40 text-amber-300')}>{r.status}</span>
            <div className="flex gap-2">
              {r.status === 'En attente' && <button onClick={() => setRegistrationStatus(r.id, 'Confirmée')} className="btn-ball !py-1.5 text-xs"><Check size={12} /> Confirmer</button>}
              {r.status === 'Confirmée' && <button onClick={() => setRegistrationStatus(r.id, 'Présent')} className="btn-ball !py-1.5 text-xs"><Check size={12} /> Présent</button>}
              {r.status !== 'Annulée' && <button onClick={() => setRegistrationStatus(r.id, 'Annulée')} className="btn-ghosty !py-1.5 text-xs"><X size={12} /></button>}
            </div>
          </div>
        ))}
        {list.length === 0 && <EmptyState title="Aucune inscription" hint="Partagez la page publique de votre événement pour recruter des participants." />}
      </div>
    </div>
  );
}

export function OrganizerResults() {
  const { events } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Résultats & statistiques" sub="Publiez résultats, liens vidéo et rapports : ils alimentent les profils des participants." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Remplissage par événement</h2>
          <BarChart data={events.map(e => ({ label: e.kind.slice(0, 6), value: e.participants }))} />
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Liens vidéo & rapports</h2>
          <div className="space-y-2.5">
            {events.slice(0, 3).map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div><p className="font-semibold">{e.title}</p><p className="text-xs text-muted-foreground">Captation : 4 matchs filmés (démo)</p></div>
                <span className="chip border-border text-muted-foreground">Publié</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Les mineurs apparaissent uniquement avec le consentement média signé par leur tuteur.</p>
        </section>
      </div>
    </div>
  );
}

/* ═══════════ MODÉRATEUR ═══════════ */

export function ModeratorDashboard() {
  const { verifications, reports, hiddenContent } = useCourtLink();
  const pendingV = verifications.filter(v => v.status === 'En attente');
  const pendingR = reports.filter(r => r.status === 'À traiter');
  return (
    <div>
      <WorkspaceHeader title="File de travail — modération" sub="Vérifications, signalements et contenus : chaque décision requiert une justification journalisée." />
      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={() => navigate('/app/verifications')} className="card-court p-5 text-left"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Vérifications en attente</span><FileCheck2 size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{pendingV.length}</p></button>
        <button onClick={() => navigate('/app/signalements')} className="card-court p-5 text-left"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Signalements à traiter</span><Flag size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{pendingR.length}</p></button>
        <button onClick={() => navigate('/app/masques')} className="card-court p-5 text-left"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Contenus masqués</span><EyeOff size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{hiddenContent.length}</p></button>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Priorités du jour</h2>
          <div className="space-y-2.5">
            {[...pendingR.slice(0, 2), ...pendingV.slice(0, 2)].slice(0, 4).map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div className="min-w-0"><p className="truncate font-semibold">{(item as typeof pendingR[0]).subject ?? (item as typeof pendingV[0]).subject}</p><p className="text-xs text-muted-foreground">{(item as typeof pendingR[0]).priority ?? 'Vérification documentaire'}</p></div>
                <span className="chip border-[var(--ball)]/40 text-[var(--ball)]">{(item as typeof pendingR[0]).status ? 'Signalement' : 'Vérification'}</span>
              </div>
            ))}
            {pendingR.length === 0 && pendingV.length === 0 && <EmptyState title="Tout est traité !" hint="Aucun dossier en attente. Bravo." />}
          </div>
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><ScrollText size={17} className="text-[var(--ball)]" /> Dernières décisions</h2>
          <ModeratorJournal compact />
        </section>
      </div>
    </div>
  );
}

export function ModeratorVerifications() {
  const { verifications, decideVerification } = useCourtLink();
  const [active, setActive] = useState<string | null>(null);
  const [justification, setJustification] = useState('');
  const v = verifications.find(x => x.id === active);
  return (
    <div>
      <WorkspaceHeader title="Demandes de vérification" sub="Examinez les documents transmis et prenez une décision justifiée. Le badge se met à jour automatiquement." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)]">
        <div className="space-y-3">
          {verifications.map(x => (
            <button key={x.id} onClick={() => { setActive(x.id); setJustification(x.justification ?? ''); }}
              className={cn('card-court flex w-full flex-wrap items-center gap-3 !translate-y-0 p-4 text-left', active === x.id && 'border-[var(--ball)]')}>
              <ShieldCheck size={17} className={x.status === 'Approuvée' ? 'text-green-400' : x.status === 'En attente' ? 'text-[var(--ball)]' : 'text-muted-foreground'} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{x.subject}</p>
                <p className="text-xs text-muted-foreground">{x.subjectType} · soumis {x.submitted} · {x.documents.length} document(s)</p>
              </div>
              <span className={cn('chip', x.status === 'Approuvée' ? 'border-green-500/40 text-green-400' : x.status === 'Refusée' ? 'border-red-500/40 text-red-300' : x.status === 'Correction demandée' ? 'border-amber-500/40 text-amber-300' : 'border-[var(--ball)]/40 text-[var(--ball)]')}>{x.status}</span>
            </button>
          ))}
        </div>
        <div className="card-court h-fit p-5 lg:sticky lg:top-32">
          {v ? (
            <>
              <h3 className="font-display text-base font-bold">{v.subject}</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">{v.subjectType} · {v.submitted}</p>
              <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Documents transmis</p>
              <div className="space-y-2">
                {v.documents.map(d => (
                  <div key={d} className="flex items-center justify-between rounded-lg border border-border p-2.5 text-xs">
                    <span>{d}</span>
                    <button onClick={() => alert(`Ouverture simulée : ${d}\n\nEn production : lecteur sécurisé avec filigrane, sans téléchargement pour les documents d'identité.`)} className="font-semibold text-[var(--ball)] hover:underline">Consulter</button>
                  </div>
                ))}
              </div>
              {v.status === 'En attente' ? (
                <>
                  <label className="mb-1.5 mt-4 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Justification (obligatoire)</label>
                  <textarea value={justification} onChange={e => setJustification(e.target.value)} rows={3} placeholder="Ex : documents cohérents, vérifiés auprès du club…" className="mb-3 w-full rounded-lg border border-input bg-background p-2.5 text-sm" />
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => { if (justification.trim().length < 5) return alert('Justification requise.'); decideVerification(v.id, 'Approuvée', justification); setActive(null); }} className="btn-ball !px-2 !py-2 text-[11px]">Approuver</button>
                    <button onClick={() => { if (justification.trim().length < 5) return alert('Justification requise.'); decideVerification(v.id, 'Correction demandée', justification); setActive(null); }} className="btn-ghosty !px-2 !py-2 text-[11px]">Corrections</button>
                    <button onClick={() => { if (justification.trim().length < 5) return alert('Justification requise.'); decideVerification(v.id, 'Refusée', justification); setActive(null); }} className="btn-ghosty !border-destructive/50 !px-2 !py-2 text-[11px] !text-destructive">Refuser</button>
                  </div>
                </>
              ) : (
                <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs">
                  <p className="font-semibold">Décision : {v.status}</p>
                  <p className="mt-1 text-muted-foreground">Par {v.reviewer} — {v.justification}</p>
                </div>
              )}
            </>
          ) : (
            <EmptyState title="Sélectionnez un dossier" hint="Chaque décision (approbation, refus, correction) exige une justification qui entre au journal d'audit." />
          )}
        </div>
      </div>
    </div>
  );
}

export function ModeratorReports() {
  const { reports, decideReport, hideContent } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Signalements" sub="Traitez, masquez un contenu si nécessaire, et justifiez chaque action." />
      <div className="space-y-3">
        {reports.map(r => (
          <div key={r.id} className="card-court p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Flag size={15} className={r.priority === 'Haute' ? 'text-red-400' : 'text-[var(--ball)]'} />
              <h3 className="flex-1 font-display text-sm font-bold">{r.subject}</h3>
              <span className={cn('chip', r.priority === 'Haute' ? 'border-red-500/40 text-red-300' : 'border-border text-muted-foreground')}>{r.priority}</span>
              <span className={cn('chip', r.status === 'À traiter' ? 'border-[var(--ball)]/40 text-[var(--ball)]' : r.status === 'Résolu' ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{r.status}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{r.details}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">Cible : {r.target} · par {r.reporter} · {r.submitted}</p>
            {r.action && <p className="mt-2 rounded-lg bg-muted/50 p-2.5 text-xs">Action : {r.action}</p>}
            {r.status === 'À traiter' && (
              <div className="mt-3 flex flex-wrap gap-2">
                <button onClick={() => decideReport(r.id, 'En revue')} className="btn-ghosty !py-1.5 text-xs">Prendre en revue</button>
                <button onClick={() => decideReport(r.id, 'Résolu', 'Contenu vérifié, auteur averti.')} className="btn-ball !py-1.5 text-xs">Résoudre</button>
                <button onClick={() => { hideContent(r.target); decideReport(r.id, 'Résolu', `Contenu masqué : ${r.target}`); }} className="btn-ghosty !py-1.5 text-xs !border-amber-500/40 !text-amber-300"><EyeOff size={12} /> Masquer le contenu</button>
                <button onClick={() => decideReport(r.id, 'Rejeté', 'Signalement non fondé.')} className="btn-ghosty !py-1.5 text-xs !border-destructive/40 !text-destructive">Rejeter</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ModeratorHidden() {
  const { hiddenContent, unhideContent } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Contenus masqués" sub="Les contenus masqués restent invisibles du public jusqu'à réaffichage ou suppression définitive." />
      {hiddenContent.length === 0 ? (
        <EmptyState title="Aucun contenu masqué" hint="Les contenus masqués depuis les signalements apparaîtront ici." />
      ) : (
        <div className="space-y-3">
          {hiddenContent.map(h => (
            <div key={h} className="card-court flex items-center gap-3 p-4">
              <EyeOff size={16} className="text-amber-300" />
              <p className="flex-1 text-sm font-semibold">{h}</p>
              <button onClick={() => unhideContent(h)} className="btn-ghosty !py-1.5 text-xs">Réafficher</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModeratorSuspects() {
  const { players, suspendedAccounts, suspendAccount, unsuspendAccount } = useCourtLink();
  const suspects = players.filter(p => p.id === 'p18' || p.id === 's14').concat(players.slice(0, 2));
  const uniq = [...new Map(suspects.map(s => [s.id, s])).values()];
  return (
    <div>
      <WorkspaceHeader title="Comptes suspects" sub="Suspension temporaire possible — l'état se répercute partout sur la plateforme." />
      <div className="space-y-3">
        {uniq.map(p => {
          const suspended = suspendedAccounts.includes(p.id) || p.suspended;
          return (
            <div key={p.id} className="card-court flex flex-wrap items-center gap-3 p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photo} alt={p.name} className="h-10 w-10 rounded-full object-cover object-top" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold">{p.name} <span className="ml-1 text-xs font-normal text-muted-foreground">#{p.id}</span></p>
                <p className="text-xs text-muted-foreground">{p.suspended ? 'Signalé : statistiques suspectes' : 'Activité normale — contrôle aléatoire'}</p>
              </div>
              {suspended ? (
                <>
                  <span className="chip border-destructive/50 text-red-300"><Ban size={11} /> Suspendu</span>
                  <button onClick={() => unsuspendAccount(p.id)} className="btn-ghosty !py-1.5 text-xs">Réactiver</button>
                </>
              ) : (
                <button onClick={() => suspendAccount(p.id, p.name)} className="btn-ghosty !py-1.5 text-xs !border-destructive/40 !text-destructive"><Ban size={12} /> Suspendre</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModeratorJournal({ compact }: { compact?: boolean }) {
  const { auditLogs } = useCourtLink();
  return (
    <div className="space-y-2">
      {auditLogs.slice(0, compact ? 6 : 30).map(l => (
        <div key={l.id} className="flex items-start gap-3 rounded-lg border border-border/60 p-3 text-sm">
          <span className="mt-0.5 font-mono2 text-[10px] text-muted-foreground">{l.time}</span>
          <div className="min-w-0 flex-1"><p className="text-sm">{l.action}</p><p className="text-[11px] text-muted-foreground">{l.actor} · {l.scope}</p></div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ SUPPORT ═══════════ */

export function SupportDashboard() {
  const { tickets, payments } = useCourtLink();
  const open = tickets.filter(t => t.status !== 'Résolu');
  return (
    <div>
      <WorkspaceHeader title="Centre de support" sub="Tickets, paiements simulés et litiges : accès limité aux données strictement nécessaires." />
      <div className="grid gap-4 sm:grid-cols-3">
        <button onClick={() => navigate('/app/tickets')} className="card-court p-5 text-left"><p className="text-xs uppercase tracking-wider text-muted-foreground">Tickets ouverts</p><p className="mt-2 font-display text-3xl font-black tnum">{open.length}</p></button>
        <button onClick={() => navigate('/app/paiements')} className="card-court p-5 text-left"><p className="text-xs uppercase tracking-wider text-muted-foreground">Paiements simulés</p><p className="mt-2 font-display text-3xl font-black tnum">{payments.length}</p></button>
        <button onClick={() => navigate('/app/litiges')} className="card-court p-5 text-left"><p className="text-xs uppercase tracking-wider text-muted-foreground">Litiges en cours</p><p className="mt-2 font-display text-3xl font-black tnum">{payments.filter(p => p.status === 'Litige' || p.status === 'Remboursé').length}</p></button>
      </div>
      <section className="card-court mt-6 p-6">
        <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><LifeBuoy size={17} className="text-[var(--ball)]" /> Tickets récents</h2>
        <SupportTickets compact />
      </section>
    </div>
  );
}

export function SupportTickets({ compact }: { compact?: boolean }) {
  const { tickets, replyTicket, setTicketStatus } = useCourtLink();
  const [active, setActive] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const t = tickets.find(x => x.id === active);
  return (
    <div className={cn(compact ? 'grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]' : '')}>
      <div className="space-y-2.5">
        {tickets.slice(0, compact ? 4 : 20).map(x => (
          <button key={x.id} onClick={() => setActive(x.id)} className={cn('card-court flex w-full flex-wrap items-center gap-3 !translate-y-0 p-3.5 text-left', active === x.id && 'border-[var(--ball)]')}>
            <LifeBuoy size={15} className={x.status === 'Ouvert' ? 'text-[var(--ball)]' : 'text-muted-foreground'} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{x.subject}</p>
              <p className="text-xs text-muted-foreground">{x.requester} · {x.topic} · ouvert {x.opened}</p>
            </div>
            <span className={cn('chip', x.priority === 'Haute' ? 'border-red-500/40 text-red-300' : 'border-border text-muted-foreground')}>{x.priority}</span>
            <span className={cn('chip', x.status === 'Résolu' ? 'border-green-500/40 text-green-400' : x.status === 'En cours' ? 'border-[var(--ball)]/40 text-[var(--ball)]' : 'border-amber-500/40 text-amber-300')}>{x.status}</span>
          </button>
        ))}
      </div>
      {t && (
        <div className="card-court h-fit p-5 lg:sticky lg:top-32">
          <h3 className="font-display text-base font-bold">{t.subject}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{t.requester} · {t.topic}</p>
          <div className="mt-4 max-h-64 space-y-2.5 overflow-y-auto">
            {t.messages.map((m, i) => (
              <div key={i} className={cn('rounded-lg p-3 text-sm', m.from === 'support' ? 'bg-[color-mix(in_oklch,var(--ball)_10%,transparent)]' : 'bg-muted/60')}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{m.from === 'support' ? 'Support' : t.requester} · {m.time}</p>
                <p className="mt-1">{m.body}</p>
              </div>
            ))}
          </div>
          <textarea value={reply} onChange={e => setReply(e.target.value)} rows={3} placeholder="Votre réponse…" className="mt-3 w-full rounded-lg border border-input bg-background p-2.5 text-sm" />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => { if (!reply.trim()) return; replyTicket(t.id, reply); setReply(''); }} className="btn-ball !py-2 text-xs"><Send size={12} /> Répondre</button>
            <button onClick={() => setTicketStatus(t.id, t.status === 'Résolu' ? 'En cours' : 'Résolu')} className="btn-ghosty !py-2 text-xs">
              {t.status === 'Résolu' ? 'Réouvrir' : 'Marquer résolu'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function SupportPayments() {
  const { payments, resolvePayment } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Abonnements & paiements" sub="Vue simulée — le support n'accède jamais aux données sportives des joueurs." />
      <div className="card-court overflow-x-auto p-6">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Facture</th><th className="pb-2">Utilisateur</th><th className="pb-2">Offre</th><th className="pb-2">Montant</th><th className="pb-2">Moyen</th><th className="pb-2">Statut</th><th className="pb-2 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-mono2 text-xs">{p.invoice}</td>
                <td className="py-2.5">{p.user}</td>
                <td className="py-2.5">{p.plan}</td>
                <td className="py-2.5 tnum font-semibold">{p.amount}</td>
                <td className="py-2.5 text-xs text-muted-foreground">{p.method}</td>
                <td className="py-2.5"><span className={cn('chip', p.status === 'Confirmé' ? 'border-green-500/40 text-green-400' : p.status === 'Litige' ? 'border-red-500/40 text-red-300' : p.status === 'Remboursé' ? 'border-border text-muted-foreground' : 'border-amber-500/40 text-amber-300')}>{p.status}</span></td>
                <td className="py-2.5 text-right">
                  {p.status === 'En attente' && <button onClick={() => resolvePayment(p.id, 'Confirmé')} className="text-xs font-semibold text-[var(--ball)] hover:underline">Confirmer</button>}
                  {p.status === 'Litige' && <button onClick={() => resolvePayment(p.id, 'Remboursé')} className="text-xs font-semibold text-[var(--ball)] hover:underline">Rembourser</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SupportDisputes() {
  const { payments, resolvePayment } = useCourtLink();
  const disputes = payments.filter(p => p.status === 'Litige' || p.status === 'Remboursé');
  return (
    <div>
      <WorkspaceHeader title="Remboursements & litiges" sub="Examinez les demandes et décidez : chaque action est journalisée." />
      {disputes.length === 0 ? <EmptyState title="Aucun litige en cours" /> : (
        <div className="space-y-3">
          {disputes.map(p => (
            <div key={p.id} className="card-court p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Undo2 size={16} className="text-[var(--ball)]" />
                <h3 className="flex-1 font-display text-sm font-bold">{p.plan} — {p.user}</h3>
                <span className="tnum font-bold">{p.amount}</span>
                <span className={cn('chip', p.status === 'Litige' ? 'border-red-500/40 text-red-300' : 'border-border text-muted-foreground')}>{p.status}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Facture {p.invoice} du {p.date} via {p.method}. Motif déclaré : double prélèvement simulé.</p>
              {p.status === 'Litige' && (
                <div className="mt-3 flex gap-2">
                  <button onClick={() => resolvePayment(p.id, 'Remboursé')} className="btn-ball !py-1.5 text-xs">Rembourser (simulé)</button>
                  <button onClick={() => resolvePayment(p.id, 'Confirmé')} className="btn-ghosty !py-1.5 text-xs">Rejeter la demande</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
