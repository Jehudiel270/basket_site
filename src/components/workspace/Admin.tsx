'use client';

import { useState } from 'react';
import {
  Gauge, UsersRound, Building2, FileCheck2, UserRound, Target, CalendarDays,
  Flag, LifeBuoy, CreditCard, Newspaper, Bell, Settings, ScrollText, Crown,
  Plus, Save, Search, Ban, Check, X, ShieldCheck, Trash2, Download, Pencil, AlertTriangle,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { WorkspaceHeader } from './Shell';
import { BarChart, Donut, EmptyState, ProgressBar } from '@/components/common/Bits';
import { SupportTickets, SupportPayments } from './Others';
import { ModeratorJournal, ModeratorVerifications, ModeratorReports } from './Others';
import { demoAccounts, roleLabels } from '@/lib/permissions';
import type { Role } from '@/lib/types';
import { cn } from '@/lib/utils';

/* ── Vue globale ── */
export function AdminOverview() {
  const { players, organizations, opportunities, events, applications, verifications, reports, tickets, payments } = useCourtLink();
  const stats = [
    { l: 'Joueurs', v: players.length, icon: UserRound },
    { l: 'Organisations', v: organizations.length, icon: Building2 },
    { l: 'Opportunités', v: opportunities.length, icon: Target },
    { l: 'Événements', v: events.length, icon: CalendarDays },
    { l: 'Candidatures', v: applications.length, icon: ScrollText },
    { l: 'Vérif. en attente', v: verifications.filter(x => x.status === 'En attente').length, icon: FileCheck2 },
    { l: 'Signalements', v: reports.filter(r => r.status === 'À traiter').length, icon: Flag },
    { l: 'Tickets ouverts', v: tickets.filter(t => t.status !== 'Résolu').length, icon: LifeBuoy },
  ];
  return (
    <div>
      <WorkspaceHeader
        title="Vue globale de la plateforme"
        sub="Pilotage complet : indicateurs calculés sur les données réelles de la démonstration (aucun chiffre inventé)."
        actions={<button onClick={() => { const data = JSON.stringify(useCourtLink.getState(), null, 2); const blob = new Blob([data], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'courtlink-admin-export.json'; a.click(); }} className="btn-ghosty !py-2 text-xs"><Download size={14} /> Exporter les données</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <div key={s.l} className="card-court p-5">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</span><s.icon size={15} className="text-[var(--ball)]" /></div>
            <p className="mt-2 font-display text-3xl font-black tnum">{s.v}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Répartition par pays</h2>
          <BarChart data={[...new Set(players.map(p => p.country))].map(c => ({ label: c.slice(0, 4), value: players.filter(p => p.country === c).length }))} />
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Pipeline des candidatures</h2>
          <div className="space-y-2.5">
            {['Nouveau', 'À examiner', 'Présélectionné', 'Contacté', 'Essai proposé', 'Retenu', 'Refusé'].map(st => {
              const n = applications.filter(a => a.status === st).length;
              return (
                <div key={st}>
                  <div className="mb-1 flex justify-between text-xs"><span>{st}</span><span className="tnum text-muted-foreground">{n}</span></div>
                  <ProgressBar value={(n / Math.max(1, applications.length)) * 100} />
                </div>
              );
            })}
          </div>
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Santé de la plateforme</h2>
          <div className="flex justify-around">
            <Donut value={72} label="Profils complétés" />
            <Donut value={86} label="Structures vérifiées" />
          </div>
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-muted/50 p-2.5"><span className="text-muted-foreground">Paiements simulés</span><span className="font-bold tnum">{payments.length}</span></div>
            <div className="flex justify-between rounded-lg bg-muted/50 p-2.5"><span className="text-muted-foreground">Revenu simulé (MRR)</span><span className="font-bold tnum">64 900 FCFA</span></div>
          </div>
        </section>
      </div>
      <section className="card-court mt-6 p-6">
        <h2 className="mb-4 font-display text-lg font-bold">Activité récente</h2>
        <ModeratorJournal />
      </section>
    </div>
  );
}

/* ── Utilisateurs & rôles ── */
export function AdminUsers() {
  const { players, organizations, suspendedAccounts, suspendAccount, unsuspendAccount } = useCourtLink();
  const [q, setQ] = useState('');
  const accounts = [
    ...demoAccounts.map(a => ({ id: a.role, name: a.name, role: a.role as Role, status: 'Actif', source: 'Compte démo' })),
    ...players.map(p => ({ id: p.id, name: p.name, role: 'player' as Role, status: suspendedAccounts.includes(p.id) || p.suspended ? 'Suspendu' : 'Actif', source: 'Joueur' })),
    ...organizations.slice(0, 4).map(o => ({ id: o.id, name: o.name, role: 'club' as Role, status: suspendedAccounts.includes(o.id) || o.suspended ? 'Suspendu' : o.verified ? 'Actif · vérifié' : 'Actif · non vérifié', source: o.type })),
  ].filter(a => !q || a.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <WorkspaceHeader title="Utilisateurs & rôles" sub="Gestion des comptes de démonstration et des profils. La suspension se répercute sur toute la plateforme." />
      <div className="relative mb-4 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un utilisateur…" className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]" />
      </div>
      <div className="card-court overflow-x-auto p-6">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Utilisateur</th><th className="pb-2">Rôle</th><th className="pb-2">Source</th><th className="pb-2">Statut</th><th className="pb-2 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id + a.name} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-semibold">{a.name}</td>
                <td className="py-2.5 text-muted-foreground">{roleLabels[a.role]}</td>
                <td className="py-2.5 text-xs text-muted-foreground">{a.source}</td>
                <td className="py-2.5">
                  <span className={cn('chip', a.status.includes('Suspendu') ? 'border-red-500/40 text-red-300' : a.status.includes('non vérifié') ? 'border-amber-500/40 text-amber-300' : 'border-green-500/40 text-green-400')}>{a.status}</span>
                </td>
                <td className="py-2.5 text-right">
                  {a.status.includes('Suspendu') ? (
                    <button onClick={() => unsuspendAccount(a.id)} className="text-xs font-semibold text-[var(--ball)] hover:underline">Réactiver</button>
                  ) : (
                    <button onClick={() => { if (confirm(`Suspendre ${a.name} ? L'état se répercute partout.`)) suspendAccount(a.id, a.name); }} className="text-xs font-semibold text-destructive hover:underline">Suspendre</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminOrganizations() {
  const { organizations, suspendAccount, unsuspendAccount } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Clubs, académies & structures" sub="Statuts de vérification et suspensions." />
      <div className="grid gap-4 md:grid-cols-2">
        {organizations.map(o => (
          <div key={o.id} className="card-court p-5">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.image} alt={o.name} className="h-11 w-11 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-display text-sm font-bold">{o.name}</p>
                <p className="text-xs text-muted-foreground">{o.type} · {o.city}, {o.country} · {o.playersCount} joueurs</p>
              </div>
              <span className={cn('chip', o.verified ? 'border-green-500/40 text-green-400' : 'border-amber-500/40 text-amber-300')}>{o.verificationStatus}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={() => navigate(`/organisations/${o.id}`)} className="btn-ghosty flex-1 !py-1.5 text-xs">Page publique</button>
              {(o.suspended || o.id === 'x') ? (
                <button onClick={() => unsuspendAccount(o.id)} className="btn-ball flex-1 !py-1.5 text-xs">Réactiver</button>
              ) : (
                <button onClick={() => { if (confirm(`Suspendre ${o.name} ?`)) suspendAccount(o.id, o.name); }} className="btn-ghosty flex-1 !py-1.5 text-xs !border-destructive/40 !text-destructive"><Ban size={12} /> Suspendre</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminPlayers() {
  const { players } = useCourtLink();
  const [q, setQ] = useState('');
  const list = players.filter(p => !q || p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <WorkspaceHeader title="Joueurs & profils" sub={`${players.length} profils · statistiques de consultation agrégées.`} />
      <div className="relative mb-4 max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher…" className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]" />
      </div>
      <div className="card-court overflow-x-auto p-6">
        <table className="w-full min-w-[720px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Joueur</th><th className="pb-2">Poste</th><th className="pb-2">Pays</th><th className="pb-2">Indice</th><th className="pb-2">Vues</th><th className="pb-2">Vérifié</th><th className="pb-2 text-right">Profil</th>
          </tr></thead>
          <tbody className="tnum">
            {list.map(p => (
              <tr key={p.id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-semibold">{p.name}{p.isMinor && <span className="ml-1.5 chip border-[var(--amber-glow)]/40 text-[var(--amber-glow)]">mineur</span>}</td>
                <td className="py-2.5">{p.position}</td>
                <td className="py-2.5 text-muted-foreground">{p.country}</td>
                <td className="py-2.5 font-bold text-[var(--ball)]">{p.rating}</td>
                <td className="py-2.5 text-muted-foreground">{p.views}</td>
                <td className="py-2.5">{p.verified ? <Check size={14} className="text-green-400" /> : <X size={14} className="text-muted-foreground" />}</td>
                <td className="py-2.5 text-right"><button onClick={() => navigate(`/joueurs/${p.id}`)} className="text-xs font-semibold text-[var(--ball)] hover:underline">Ouvrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminOpportunities() {
  const { opportunities, applications, updateOpportunity } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Opportunités & candidatures" sub="Vue transverse de toutes les annonces et du pipeline global." />
      <div className="card-court overflow-x-auto p-6">
        <table className="w-full min-w-[760px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Opportunité</th><th className="pb-2">Organisation</th><th className="pb-2">Statut</th><th className="pb-2">Candidats</th><th className="pb-2 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {opportunities.map(o => (
              <tr key={o.id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-semibold">{o.title}</td>
                <td className="py-2.5 text-muted-foreground">{o.org}</td>
                <td className="py-2.5"><span className={cn('chip', o.status === 'Ouverte' ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{o.status}</span></td>
                <td className="py-2.5 tnum">{applications.filter(a => a.opportunityId === o.id).length} / {o.applicants}</td>
                <td className="py-2.5 text-right">
                  {o.status === 'Ouverte' ? (
                    <button onClick={() => updateOpportunity(o.id, { status: 'Fermée' })} className="text-xs font-semibold text-destructive hover:underline">Fermer</button>
                  ) : (
                    <button onClick={() => updateOpportunity(o.id, { status: 'Ouverte' })} className="text-xs font-semibold text-[var(--ball)] hover:underline">Rouvrir</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminEvents() {
  const { events } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Événements" sub="Calendrier complet et remplissage." />
      <div className="card-court overflow-x-auto p-6">
        <table className="w-full min-w-[640px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Événement</th><th className="pb-2">Organisateur</th><th className="pb-2">Date</th><th className="pb-2">Remplissage</th><th className="pb-2 text-right">Page</th>
          </tr></thead>
          <tbody>
            {events.map(e => (
              <tr key={e.id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-semibold">{e.title}</td>
                <td className="py-2.5 text-muted-foreground">{e.organizer}</td>
                <td className="py-2.5">{e.date}</td>
                <td className="py-2.5 w-40"><ProgressBar value={(e.participants / e.capacity) * 100} /><span className="text-[11px] text-muted-foreground tnum">{e.participants}/{e.capacity}</span></td>
                <td className="py-2.5 text-right"><button onClick={() => navigate(`/evenements/${e.id}`)} className="text-xs font-semibold text-[var(--ball)] hover:underline">Ouvrir</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminModeration() {
  return (
    <div>
      <WorkspaceHeader title="Modération & signalements" sub="Console partagée avec le rôle modérateur (permissions distinctes du super-admin)." />
      <div className="space-y-8">
        <section><h2 className="mb-3 font-display text-lg font-bold">Signalements</h2><ModeratorReports /></section>
        <section><h2 className="mb-3 font-display text-lg font-bold">Journal des décisions</h2><ModeratorJournal /></section>
      </div>
    </div>
  );
}

export function AdminTickets() {
  return (
    <div>
      <WorkspaceHeader title="Support & tickets" sub="Console partagée avec le rôle support." />
      <div className="space-y-8">
        <section><h2 className="mb-3 font-display text-lg font-bold">Tickets</h2><SupportTickets /></section>
        <section><h2 className="mb-3 font-display text-lg font-bold">Paiements simulés</h2><SupportPayments /></section>
      </div>
    </div>
  );
}

export function AdminBilling() {
  const { plans, payments, updatePlan } = useCourtLink();
  const [editing, setEditing] = useState<string | null>(null);
  const [price, setPrice] = useState(0);
  return (
    <div>
      <WorkspaceHeader title="Plans tarifaires & paiements" sub="Les prix sont configurables : la page publique se met à jour instantanément." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plans.map(p => (
          <div key={p.id} className={cn('card-court p-5', !p.active && 'opacity-50')}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">{p.name}</h3>
              <button onClick={() => { setEditing(p.id); setPrice(p.price); }} className="text-muted-foreground hover:text-[var(--ball)]"><Pencil size={14} /></button>
            </div>
            <p className="text-xs text-muted-foreground">{p.audience}</p>
            {editing === p.id ? (
              <div className="mt-3 flex gap-2">
                <input type="number" value={price} onChange={e => setPrice(+e.target.value)} className="h-9 flex-1 rounded-lg border border-input bg-background px-2 text-sm tnum" />
                <button onClick={() => { updatePlan(p.id, { price }); setEditing(null); }} className="btn-ball !px-3 !py-1.5 text-xs"><Save size={12} /></button>
              </div>
            ) : (
              <p className="mt-3 font-display text-2xl font-black tnum">{p.price.toLocaleString('fr-FR')} F<span className="text-xs font-normal text-muted-foreground">/{p.period}</span></p>
            )}
            <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={p.active} onChange={e => updatePlan(p.id, { active: e.target.checked })} className="accent-[var(--ball)]" /> Offre visible publiquement
            </label>
          </div>
        ))}
      </div>
      <div className="card-court mt-6 overflow-x-auto p-6">
        <h3 className="mb-4 font-display text-lg font-bold">Paiements simulés</h3>
        <table className="w-full min-w-[620px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Facture</th><th className="pb-2">Utilisateur</th><th className="pb-2">Offre</th><th className="pb-2">Montant</th><th className="pb-2">Statut</th>
          </tr></thead>
          <tbody>
            {payments.map(p => (
              <tr key={p.id} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-mono2 text-xs">{p.invoice}</td><td className="py-2.5">{p.user}</td><td className="py-2.5">{p.plan}</td>
                <td className="py-2.5 tnum font-semibold">{p.amount}</td>
                <td className="py-2.5"><span className={cn('chip', p.status === 'Confirmé' ? 'border-green-500/40 text-green-400' : p.status === 'Litige' ? 'border-red-500/40 text-red-300' : 'border-amber-500/40 text-amber-300')}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminContent() {
  const [saved, setSaved] = useState(false);
  const { settings, updateSettings } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Contenus publics & FAQ" sub="Édition des pages éditoriales, de la FAQ et des messages clés." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Identité de marque</h2>
          <label className="block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Nom de la marque</span>
            <input value={settings.brandName} onChange={e => updateSettings({ brandName: e.target.value })} className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Accroche principale</span>
            <input value={settings.tagline} onChange={e => updateSettings({ tagline: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="mt-3 block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Couleur d'accent</span>
            <div className="flex gap-2">
              {['#FF6B1A', '#E11D48', '#22C55E', '#EAB308', '#FFFFFF'].map(c => (
                <button key={c} onClick={() => updateSettings({ accentColor: c })} className={cn('h-9 w-9 rounded-lg border-2', settings.accentColor === c ? 'border-foreground' : 'border-transparent')} style={{ background: c }} aria-label={c} />
              ))}
            </div>
          </label>
          {saved && <p className="mt-3 text-xs text-green-400">Enregistré.</p>}
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">FAQ publique</h2>
          <div className="space-y-2.5">
            {['Comment obtenir le badge vérifié ?', 'Les paiements sont-ils réels ?', 'Comment protéger un joueur mineur ?', 'CourtLink garantit-il un contrat ?'].map(q => (
              <div key={q} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <span>{q}</span>
                <button onClick={() => navigate('/aide')} className="text-xs font-semibold text-[var(--ball)]">Éditer</button>
              </div>
            ))}
          </div>
          <button onClick={() => alert('Éditeur FAQ complet disponible en production.')} className="btn-ghosty mt-4 w-full !py-2 text-xs"><Plus size={13} /> Ajouter une question</button>
        </section>
      </div>
    </div>
  );
}

export function AdminNotifications() {
  const { addNotification } = useCourtLink();
  const [form, setForm] = useState({ title: '', body: '' });
  const [sent, setSent] = useState(false);
  return (
    <div>
      <WorkspaceHeader title="Gestion des notifications" sub="Diffusez des annonces à tous les rôles de la démonstration." />
      <form className="card-court max-w-xl p-6" onSubmit={e => { e.preventDefault(); addNotification({ title: form.title, body: form.body, kind: 'info' }); setForm({ title: '', body: '' }); setSent(true); setTimeout(() => setSent(false), 2500); }}>
        <label className="block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Titre *</span>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
        <label className="block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Message *</span>
          <textarea required rows={3} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
        <button type="submit" className="btn-ball mt-4 w-full"><Bell size={14} /> Diffuser la notification</button>
        {sent && <p className="mt-3 text-center text-xs text-green-400">Notification ajoutée au flux de toutes les sessions démo.</p>}
      </form>
    </div>
  );
}

export function AdminSettings() {
  const { settings, updateSettings, resetDemo } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Paramètres généraux" sub="Configuration de la plateforme de démonstration." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Plateforme</h2>
          <div className="space-y-3">
            {([
              ['maintenance', 'Mode maintenance', 'Masque le site public'],
              ['newRegistrations', 'Inscriptions ouvertes', 'Autoriser la création de comptes'],
              ['autoVerifyPlayers', 'Auto-vérification des joueurs', 'Dangereux — à désactiver en production'],
            ] as const).map(([k, t, d]) => (
              <label key={k} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3.5 text-sm">
                <span><span className="block font-semibold">{t}</span><span className="block text-xs text-muted-foreground">{d}</span></span>
                <input type="checkbox" checked={settings[k] as boolean} onChange={e => updateSettings({ [k]: e.target.checked })} className="accent-[var(--ball)]" />
              </label>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Candidatures gratuites / mois</span>
              <input type="number" value={settings.maxFreeApplications} onChange={e => updateSettings({ maxFreeApplications: +e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-2 text-sm tnum" /></label>
            <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Slots « en vedette »</span>
              <input type="number" value={settings.featuredSlots} onChange={e => updateSettings({ featuredSlots: +e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-2 text-sm tnum" /></label>
          </div>
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Zone sensible</h2>
          <div className="rounded-lg border border-destructive/40 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-destructive"><AlertTriangle size={15} /> Réinitialisation des données</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Restaure toutes les entités (joueurs, candidatures, événements, paiements…) à leur état d'origine et déconnecte la session.
            </p>
            <button onClick={() => { if (confirm('Réinitialiser TOUTES les données de démonstration ?')) { resetDemo(); navigate('/'); } }} className="btn-ghosty mt-3 w-full !border-destructive/50 !text-destructive">
              <Trash2 size={13} /> Réinitialiser maintenant
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminAudit() {
  const { auditLogs } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Journal d'audit" sub="Toutes les décisions importantes de la démonstration, horodatées." />
      <div className="card-court p-6">
        <ModeratorJournal />
      </div>
    </div>
  );
}

export function AdminAdmins() {
  const { role, login } = useCourtLink();
  const admins = [
    { name: 'Admin général', email: 'admin@demo.courtlink', perms: 'Toutes permissions', active: true },
    { name: 'Camille H.', email: 'moderation@demo.courtlink', perms: 'Vérifications, modération, journal', active: true },
    { name: 'Nadège S.', email: 'support@demo.courtlink', perms: 'Tickets, paiements, litiges', active: true },
    { name: 'Compte à créer', email: '—', perms: 'Personnalisé', active: false },
  ];
  return (
    <div>
      <WorkspaceHeader title="Administrateurs & permissions" sub="Le moignon démo : chaque administrateur dispose de permissions explicites, pas de super-pouvoir par défaut." />
      <div className="card-court overflow-x-auto p-6">
        <table className="w-full min-w-[620px] text-sm">
          <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <th className="pb-2">Administrateur</th><th className="pb-2">E-mail</th><th className="pb-2">Permissions</th><th className="pb-2">État</th><th className="pb-2 text-right">Session</th>
          </tr></thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.name} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 font-semibold">{a.name}</td>
                <td className="py-2.5 text-muted-foreground">{a.email}</td>
                <td className="py-2.5 text-xs text-muted-foreground">{a.perms}</td>
                <td className="py-2.5"><span className={cn('chip', a.active ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{a.active ? 'Actif' : 'À créer'}</span></td>
                <td className="py-2.5 text-right">
                  <button onClick={() => login(a.name === 'Admin général' ? 'admin' : a.name.includes('Camille') ? 'moderator' : 'support')} className="text-xs font-semibold text-[var(--ball)] hover:underline">Ouvrir la session</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
          Séparation des pouvoirs : le modérateur et le support n'ont jamais automatiquement accès aux fonctions du super-administrateur (plans tarifaires, paramètres, gestion des admins).
        </p>
      </div>
    </div>
  );
}
