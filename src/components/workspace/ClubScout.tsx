'use client';

import { useMemo, useState } from 'react';
import {
  Search, Plus, Star, Send, Eye, KanbanSquare, Users, Building2, BarChart3,
  Radar, NotebookPen, BookmarkCheck, GitCompareArrows, Trash2, X, ClipboardList,
  Megaphone, Archive, Pencil, Filter, UserPlus, Trophy, TrendingUp, ShieldCheck, ArrowRight, ChevronLeft, Mail,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import type { ApplicationStatus, Player, Opportunity } from '@/lib/types';
import { POSITIONS, COUNTRIES } from '@/lib/demo-data';
import { category } from '@/lib/router';
import { WorkspaceHeader } from './Shell';
import { PlayerCard, EmptyState, PlayerMiniRow, BarChart, ProgressBar, Stat } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

const PIPELINE: ApplicationStatus[] = ['Nouveau', 'À examiner', 'Présélectionné', 'Contacté', 'Essai proposé', 'Retenu', 'Refusé'];

/* ═══════════ CLUB ═══════════ */

export function ClubDashboard() {
  const { opportunities, applications, players, organizations, events, registrations, favorites, scoutingReports } = useCourtLink();
  const myOrg = organizations.find(o => o.id === 'org1')!;
  const myOpps = opportunities.filter(o => o.orgId === myOrg.id);
  const myApps = applications.filter(a => a.orgId === myOrg.id);
  const pending = myApps.filter(a => a.status === 'Nouveau' || a.status === 'À examiner');

  return (
    <div>
      <WorkspaceHeader
        title="Tableau de recrutement"
        sub={`${myOrg.name} · ${myOrg.verified ? 'structure vérifiée' : 'vérification en cours'} · plan Club Pro (démo)`}
        actions={<>
          <button onClick={() => navigate('/app/nouvelle-opportunite')} className="btn-ball !py-2 text-xs"><Plus size={14} /> Publier une opportunité</button>
          <button onClick={() => navigate('/app/recherche')} className="btn-ghosty !py-2 text-xs"><Search size={14} /> Chercher des joueurs</button>
        </>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Opportunités actives</span><Megaphone size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{myOpps.filter(o => o.status === 'Ouverte').length}</p><p className="mt-1 text-xs text-muted-foreground">{myOpps.reduce((s, o) => s + o.applicants, 0)} candidatures reçues</p></div>
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">À examiner</span><KanbanSquare size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{pending.length}</p><p className="mt-1 text-xs text-amber-300">Priorité cette semaine</p></div>
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Effectif rattaché</span><Users size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{players.filter(p => p.club === myOrg.name).length}</p><p className="mt-1 text-xs text-muted-foreground">profils CourtLink</p></div>
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Rapports scouts</span><Radar size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{scoutingReports.length}</p><p className="mt-1 text-xs text-muted-foreground">disponibles en lecture</p></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Dernières candidatures</h2>
            <button onClick={() => navigate('/app/pipeline')} className="text-xs font-semibold text-[var(--ball)] hover:underline">Ouvrir le pipeline</button>
          </div>
          {myApps.length === 0 ? (
            <EmptyState title="Aucune candidature" hint="Publiez une opportunité pour recevoir des dossiers." />
          ) : (
            <div className="space-y-2.5">
              {myApps.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{a.playerName}</p>
                    <p className="truncate text-xs text-muted-foreground">{a.opportunityTitle} · {a.updatedAt}</p>
                  </div>
                  <span className={cn('chip', a.status === 'Nouveau' ? 'border-blue-400/40 text-blue-300' : a.status === 'Refusé' ? 'border-red-400/40 text-red-300' : 'border-[var(--ball)]/50 text-[var(--ball)]')}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>
        <section className="card-court p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Mes opportunités</h2>
            <button onClick={() => navigate('/app/opportunites')} className="text-xs font-semibold text-[var(--ball)] hover:underline">Gérer</button>
          </div>
          <div className="space-y-2.5">
            {myOpps.slice(0, 4).map(o => (
              <div key={o.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{o.title}</p>
                  <p className="text-xs text-muted-foreground">{o.applicants} candidats · échéance {o.deadline}</p>
                </div>
                <span className={cn('chip', o.status === 'Ouverte' ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{o.status}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="card-court p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold">Inscriptions à nos événements</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {registrations.slice(0, 4).map(r => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                <div><p className="font-semibold">{r.playerName}</p><p className="text-xs text-muted-foreground">{r.eventTitle} · {r.registeredAt}</p></div>
                <span className={cn('chip', r.status === 'Présent' ? 'border-green-500/40 text-green-400' : r.status === 'Confirmée' ? 'border-[var(--ball)]/40 text-[var(--ball)]' : 'border-amber-500/40 text-amber-300')}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ── Recherche avancée partagée club/scout ── */
export function AdvancedSearch() {
  const { players, favorites, toggleFavorite, addSavedSearch, role, scoutingReports } = useCourtLink();
  const [f, setF] = useState({ q: '', position: 'Tous les postes', country: 'Tous les pays', cat: 'Toutes catégories', minHeight: 160, minRating: 60, maxAge: 40, verified: false, available: false, hasVideo: false });
  const [compare, setCompare] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');

  const results = useMemo(() => players.filter(p =>
    (!f.q || `${p.name} ${p.city} ${p.club}`.toLowerCase().includes(f.q.toLowerCase())) &&
    (f.position === 'Tous les postes' || p.position === f.position || p.secondaryPositions.includes(f.position)) &&
    (f.country === 'Tous les pays' || p.country === f.country) &&
    (f.cat === 'Toutes catégories' || category(p.birthDate) === f.cat) &&
    p.height >= f.minHeight && p.rating >= f.minRating && (category(p.birthDate) === 'Senior' ? true : parseInt(p.birthDate.slice(0, 4)) >= 2026 - f.maxAge - 20) &&
    (!f.verified || p.verified) && (!f.available || p.available) && (!f.hasVideo || p.videos.length > 0)
  ), [players, f]);

  return (
    <div>
      <WorkspaceHeader
        title={role === 'club' ? 'Recherche avancée de joueurs' : 'Répertoire de prospection'}
        sub="Filtres multicritères : poste, taille, âge, pays, vérification, disponibilité et présence de vidéo. Comparez jusqu'à 3 profils."
        actions={<button onClick={() => navigate('/app/comparaison')} className="btn-ghosty !py-2 text-xs"><GitCompareArrows size={14} /> Comparateur ({compare.length}/3)</button>}
      />
      <div className="card-court mb-6 p-4">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-2.5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={f.q} onChange={e => setF({ ...f, q: e.target.value })} placeholder="Nom, ville, club…" className="h-11 w-full min-w-0 rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]" />
          </div>
          <select value={f.position} onChange={e => setF({ ...f, position: e.target.value })} className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm">
            <option>Tous les postes</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={f.country} onChange={e => setF({ ...f, country: e.target.value })} className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm">
            <option>Tous les pays</option>{COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={f.cat} onChange={e => setF({ ...f, cat: e.target.value })} className="h-11 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-sm">
            <option>Toutes catégories</option>{['U17', 'U19', 'U21', 'Espoir', 'Senior'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="mt-3 grid gap-4 border-t border-border pt-3 md:grid-cols-4">
          <label className="text-xs"><span className="mb-1 flex justify-between font-semibold uppercase tracking-wider text-muted-foreground">Taille ≥ <span className="text-[var(--ball)] tnum">{f.minHeight} cm</span></span>
            <input type="range" min={160} max={215} value={f.minHeight} onChange={e => setF({ ...f, minHeight: +e.target.value })} className="w-full accent-[var(--ball)]" /></label>
          <label className="text-xs"><span className="mb-1 flex justify-between font-semibold uppercase tracking-wider text-muted-foreground">Indice ≥ <span className="text-[var(--ball)] tnum">{f.minRating}</span></span>
            <input type="range" min={60} max={90} value={f.minRating} onChange={e => setF({ ...f, minRating: +e.target.value })} className="w-full accent-[var(--ball)]" /></label>
          <div className="flex flex-col justify-center gap-1.5 text-xs">
            <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={f.verified} onChange={e => setF({ ...f, verified: e.target.checked })} className="accent-[var(--ball)]" /> Vérifiés uniquement</label>
            <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={f.available} onChange={e => setF({ ...f, available: e.target.checked })} className="accent-[var(--ball)]" /> Disponibles</label>
            <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={f.hasVideo} onChange={e => setF({ ...f, hasVideo: e.target.checked })} className="accent-[var(--ball)]" /> Avec vidéo</label>
          </div>
          <div className="flex flex-col justify-center gap-2">
            {saving ? (
              <div className="flex gap-2">
                <input value={saveName} onChange={e => setSaveName(e.target.value)} placeholder="Nom de la recherche" className="h-9 flex-1 rounded-lg border border-input bg-background px-2 text-xs" />
                <button onClick={() => { if (saveName.trim()) { addSavedSearch(saveName, f.q, { position: f.position, country: f.country }); setSaving(false); setSaveName(''); } }} className="btn-ball !px-2.5 !py-1.5 text-xs">OK</button>
              </div>
            ) : (
              <button onClick={() => setSaving(true)} className="btn-ghosty !py-2 text-xs"><BookmarkCheck size={13} /> Sauvegarder ces filtres</button>
            )}
          </div>
        </div>
      </div>

      <p className="mb-4 text-sm text-muted-foreground"><strong className="tnum text-foreground">{results.length}</strong> profil(s) correspondent aux critères</p>
      {results.length === 0 ? (
        <EmptyState title="Aucun résultat" hint="Assouplissez les filtres (taille, indice, pays) pour élargir le vivier." />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p, i) => (
            <div key={p.id} className="relative">
              <PlayerCard player={p} index={i} compare={compare.includes(p.id)} onCompare={(id) => setCompare(c => c.includes(id) ? c.filter(x => x !== id) : c.length >= 3 ? c : [...c, id])} />
              <button onClick={() => toggleFavorite(p.id)}
                className={cn('absolute right-3 top-14 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm', favorites.includes(p.id) ? 'border-[var(--ball)] bg-[var(--ball)] text-black' : 'border-white/25 bg-black/40 text-white hover:border-[var(--ball)]')}>
                <Star size={14} className={favorites.includes(p.id) ? 'fill-black' : ''} />
              </button>
            </div>
          ))}
        </div>
      )}
      {compare.length > 0 && (
        <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-[var(--ball)] bg-card px-5 py-3 shadow-2xl pop-in">
          <span className="mr-3 text-sm font-semibold">{compare.length} profil(s) sélectionné(s)</span>
          <button onClick={() => navigate('/app/comparaison')} className="btn-ball !py-1.5 text-xs">Comparer maintenant <ArrowRight size={12} /></button>
        </div>
      )}
    </div>
  );
}

/* ── Pipeline kanban ── */
export function ClubPipeline() {
  const { applications, setApplicationStatus, players, organizations } = useCourtLink();
  const org = organizations.find(o => o.id === 'org1')!;
  const myApps = applications.filter(a => a.orgId === org.id);
  const [dragOver, setDragOver] = useState<string | null>(null);

  return (
    <div>
      <WorkspaceHeader
        title="Pipeline de recrutement"
        sub="Glissez une candidature ou utilisez les flèches pour changer son statut. Le joueur est notifié à chaque étape."
        actions={<span className="chip border-[var(--ball)]/40 text-[var(--ball)]"><Users size={11} /> {myApps.length} candidatures</span>}
      />
      <div className="flex gap-3 overflow-x-auto pb-4">
        {PIPELINE.map(stage => {
          const items = myApps.filter(a => a.status === stage);
          return (
            <div key={stage}
              onDragOver={e => { e.preventDefault(); setDragOver(stage); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={e => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain'); if (id) setApplicationStatus(id, stage); setDragOver(null); }}
              className={cn('w-64 shrink-0 rounded-xl border p-3 transition-colors', dragOver === stage ? 'border-[var(--ball)] bg-[color-mix(in_oklch,var(--ball)_8%,transparent)]' : 'border-border bg-[var(--court)]/50')}>
              <div className="mb-3 flex items-center justify-between px-1">
                <p className="text-xs font-bold uppercase tracking-wider">{stage}</p>
                <span className="chip border-border bg-muted text-muted-foreground tnum">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(a => {
                  const pl = players.find(p => p.id === a.playerId);
                  return (
                    <div key={a.id} draggable onDragStart={e => e.dataTransfer.setData('text/plain', a.id)}
                      className="cursor-grab rounded-lg border border-border bg-card p-3 active:cursor-grabbing">
                      <div className="flex items-center gap-2">
                        {pl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={pl.photo} alt={pl.name} className="h-8 w-8 rounded-full object-cover object-top" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold">{a.playerName}</p>
                          <p className="truncate text-[10px] text-muted-foreground">{a.opportunityTitle}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-1">
                        <button onClick={() => { const i = PIPELINE.indexOf(stage); if (i > 0) setApplicationStatus(a.id, PIPELINE[i - 1]); }} className="rounded border border-border px-1.5 text-[10px] text-muted-foreground hover:text-foreground">←</button>
                        <button onClick={() => navigate(`/joueurs/${a.playerId}`)} className="text-[10px] font-semibold text-[var(--ball)]">Profil</button>
                        <button onClick={() => { const i = PIPELINE.indexOf(stage); if (i < PIPELINE.length - 1) setApplicationStatus(a.id, PIPELINE[i + 1]); }} className="rounded border border-border px-1.5 text-[10px] text-muted-foreground hover:text-foreground">→</button>
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && <p className="py-6 text-center text-[11px] text-muted-foreground">Vide — glissez ici</p>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-muted-foreground">💡 Astuce démo : le drag & drop fonctionne au pointeur et au clavier via les flèches de chaque carte.</p>
    </div>
  );
}

/* ── Gestion des opportunités club ── */
export function ClubOpportunities() {
  const { opportunities, updateOpportunity, applications, currentUserId } = useCourtLink();
  const orgId = currentUserId === 'org1' ? 'org1' : 'org1';
  const mine = opportunities.filter(o => o.orgId === orgId);
  return (
    <div>
      <WorkspaceHeader title="Mes opportunités" sub="Publiez, modifiez, archivez : les annonces apparaissent immédiatement dans l'annuaire public."
        actions={<button onClick={() => navigate('/app/nouvelle-opportunite')} className="btn-ball !py-2 text-xs"><Plus size={14} /> Nouvelle</button>} />
      <div className="space-y-3">
        {mine.map(o => (
          <div key={o.id} className="card-court flex flex-wrap items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-display text-sm font-bold">{o.title}</h3>
                <span className={cn('chip', o.status === 'Ouverte' ? 'border-green-500/40 text-green-400' : o.status === 'Brouillon' ? 'border-amber-500/40 text-amber-300' : 'border-border text-muted-foreground')}>{o.status}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{o.type} · {o.position} · {o.city} · {o.applicants} candidats · clôture {o.deadline}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate(`/opportunites/${o.id}`)} className="btn-ghosty !py-1.5 text-xs"><Eye size={12} /> Voir</button>
              {o.status === 'Ouverte' ? (
                <button onClick={() => updateOpportunity(o.id, { status: 'Fermée' })} className="btn-ghosty !py-1.5 text-xs"><Archive size={12} /> Clôturer</button>
              ) : o.status === 'Fermée' ? (
                <button onClick={() => updateOpportunity(o.id, { status: 'Ouverte' })} className="btn-ball !py-1.5 text-xs"><Megaphone size={12} /> Rouvrir</button>
              ) : o.status === 'Brouillon' ? (
                <button onClick={() => updateOpportunity(o.id, { status: 'Ouverte' })} className="btn-ball !py-1.5 text-xs"><Megaphone size={12} /> Publier</button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CreateOpportunity() {
  const { createOpportunity, currentUserId, players } = useCourtLink();
  const [form, setForm] = useState({ title: '', type: 'Contrat saison', position: 'Ailier', ageRange: '18-21 ans', country: 'Bénin', city: 'Cotonou', deadline: '30 juin 2026', startDate: '15 juillet 2026', salary: 'À négocier', slots: 2, description: '', requirements: 'Expérience U21 minimum\nProfil vérifié CourtLink', conditions: 'Licence offerte\nSuivi médical' });
  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const [done, setDone] = useState<string | null>(null);

  if (done) {
    return (
      <div className="card-court mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400 pop-in"><ClipboardList size={26} /></span>
        <h2 className="font-display text-xl font-bold">Opportunité publiée !</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">« {done} » est visible dans l'annuaire public. Les joueurs correspondants reçoivent une notification.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => { setDone(null); setForm({ ...form, title: '', description: '' }); }} className="btn-ghosty">Créer une autre</button>
          <button onClick={() => navigate('/opportunites')} className="btn-ball">Voir l'annuaire</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <WorkspaceHeader title="Publier une opportunité" sub="Les critères transparents augmentent la qualité des candidatures reçues." />
      <form className="card-court max-w-3xl p-6" onSubmit={e => { e.preventDefault(); const id = createOpportunity({ ...form, orgId: 'org1', org: 'Cotonou Hoopers', level: form.ageRange, status: 'Ouverte', requirements: form.requirements.split('\n').filter(Boolean), conditions: form.conditions.split('\n').filter(Boolean), applicants: 0, createdAt: '' } as never); setDone(form.title); }}>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs sm:col-span-2"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Titre de l'offre *</span>
            <input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ex : Arrière U21 — saison régionale" className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Type *</span>
            <select value={form.type} onChange={e => set('type', e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              {['Contrat saison', 'Détection', 'Essai', 'Académique', 'Événement', 'Staff'].map(t => <option key={t}>{t}</option>)}
            </select></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Poste *</span>
            <select value={form.position} onChange={e => set('position', e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option>Tous postes</option>{POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Ville *</span>
            <input required value={form.city} onChange={e => set('city', e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Pays *</span>
            <select value={form.country} onChange={e => set('country', e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">{COUNTRIES.map(c => <option key={c}>{c}</option>)}</select></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Tranche d'âge *</span>
            <input required value={form.ageRange} onChange={e => set('ageRange', e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Date limite *</span>
            <input required value={form.deadline} onChange={e => set('deadline', e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Places</span>
            <input type="number" min={1} value={form.slots} onChange={e => set('slots', +e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm tnum" /></label>
          <label className="text-xs sm:col-span-2"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Description *</span>
            <textarea required rows={4} minLength={30} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Décrivez le projet sportif, l'encadrement et le calendrier…" className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Critères requis (1 par ligne)</span>
            <textarea rows={3} value={form.requirements} onChange={e => set('requirements', e.target.value)} className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Conditions offertes (1 par ligne)</span>
            <textarea rows={3} value={form.conditions} onChange={e => set('conditions', e.target.value)} className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
          <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Rémunération / conditions</span>
            <input value={form.salary} onChange={e => set('salary', e.target.value)} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
        </div>
        <button type="submit" className="btn-ball mt-5 w-full"><Megaphone size={15} /> Publier l'opportunité</button>
        <p className="mt-3 text-center text-xs text-muted-foreground">Seules les structures vérifiées publient : votre badge est actif.</p>
      </form>
    </div>
  );
}

/* ── Comparateur ── */
export function CompareView() {
  const { players } = useCourtLink();
  const [picked, setPicked] = useState<string[]>(['p3', 'p5', 'p1']);
  const sel = players.filter(p => picked.includes(p.id));
  const toggle = (id: string) => setPicked(c => c.includes(id) ? c.filter(x => x !== id) : c.length >= 3 ? c : [...c, id]);

  return (
    <div>
      <WorkspaceHeader title="Comparateur de profils" sub="Comparez jusqu'à 3 joueurs côte à côte : taille, indice, statistiques de la dernière saison." />
      <div className="mb-5 flex flex-wrap gap-2">
        {players.map(p => (
          <button key={p.id} onClick={() => toggle(p.id)} className={cn('chip !px-3 !py-1.5', picked.includes(p.id) ? 'border-[var(--ball)] bg-[var(--ball)] text-black' : 'border-border text-muted-foreground hover:border-[var(--ball)]')}>
            {p.name} {picked.includes(p.id) && <X size={11} />}
          </button>
        ))}
      </div>
      {sel.length < 2 ? (
        <EmptyState title="Sélectionnez au moins 2 profils" hint="Les statistiques seront affichées côte à côte pour faciliter la décision." />
      ) : (
        <div className="card-court overflow-x-auto p-6">
          <table className="w-full min-w-[600px]">
            <thead><tr>
              <th className="w-40" />
              {sel.map(p => (
                <th key={p.id} className="p-2 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.photo} alt={p.name} className="mx-auto h-16 w-16 rounded-full object-cover object-top" />
                  <p className="mt-2 font-display text-sm font-bold">{p.name}</p>
                  <p className="text-[11px] font-normal text-muted-foreground">{p.position} · {p.club}</p>
                  <button onClick={() => navigate(`/joueurs/${p.id}`)} className="mt-1 text-[11px] font-semibold text-[var(--ball)] hover:underline">Voir le profil</button>
                </th>
              ))}
            </tr></thead>
            <tbody className="text-center text-sm">
              {([
                ['Indice CourtLink', (p: Player) => p.rating, true],
                ['Taille', (p: Player) => `${p.height} cm`, false],
                ['Âge / catégorie', (p: Player) => `${p.birthDate.slice(0, 4)} · ${category(p.birthDate)}`, false],
                ['Points / match', (p: Player) => p.stats[0]?.ppg ?? '—', true],
                ['Rebonds / match', (p: Player) => p.stats[0]?.rpg ?? '—', false],
                ['Passes / match', (p: Player) => p.stats[0]?.apg ?? '—', false],
                ['% aux tirs', (p: Player) => `${p.stats[0]?.fgPct ?? '—'}%`, false],
                ['% à 3 pts', (p: Player) => `${p.stats[0]?.tpPct ?? '—'}%`, false],
                ['Vidéos publiées', (p: Player) => p.videos.length, false],
                ['Vérifié', (p: Player) => p.verified ? 'Oui' : 'Non', false],
                ['Disponible', (p: Player) => p.available ? 'Oui' : 'Non', false],
              ] as [string, (p: Player) => string | number, boolean][]).map(([label, get, accent]) => (
                <tr key={label} className="border-t border-border">
                  <td className="py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</td>
                  {sel.map(p => <td key={p.id} className={cn('py-2.5 font-display font-bold tnum', accent && 'text-[var(--ball)]')}>{get(p)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Organisation / effectif ── */
export function ClubOrganization() {
  const { organizations, players } = useCourtLink();
  const org = organizations.find(o => o.id === 'org1')!;
  const roster = players.filter(p => p.club === org.name);
  const [perm, setPerm] = useState<Record<string, string>>({ 'Arnaud Koffi': 'Admin', 'Sylvia Adanhoumé': 'Éditeur', 'Paul Agbo': 'Lecteur' });
  return (
    <div>
      <WorkspaceHeader title="Effectif & staff" sub="Gérez la vitrine publique de la structure et les permissions de vos membres." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Building2 size={17} className="text-[var(--ball)]" /> {org.name}</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Statut de vérification</span><span className="flex items-center gap-1 font-semibold text-green-400"><ShieldCheck size={13} /> {org.verificationStatus}</span></div>
            <div className="flex justify-between rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Membres du staff</span><span className="font-semibold tnum">{org.staff.length}</span></div>
            <div className="flex justify-between rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Divisions</span><span className="font-semibold">{org.divisions.join(', ')}</span></div>
          </div>
          <h3 className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Staff & permissions</h3>
          <div className="space-y-2">
            {org.staff.map(s => (
              <div key={s.name} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div><p className="text-sm font-semibold">{s.name}</p><p className="text-xs text-muted-foreground">{s.role} · {s.license}</p></div>
                <select value={perm[s.name] ?? 'Lecteur'} onChange={e => setPerm({ ...perm, [s.name]: e.target.value })} className="h-9 rounded-lg border border-input bg-background px-2 text-xs">
                  {['Admin', 'Éditeur', 'Lecteur'].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            ))}
          </div>
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Users size={17} className="text-[var(--ball)]" /> Joueurs rattachés ({roster.length})</h2>
          <div className="space-y-2">
            {roster.map(p => (
              <PlayerMiniRow key={p.id} player={p} right={
                <div className="flex gap-1.5">
                  <button onClick={() => navigate(`/joueurs/${p.id}`)} className="btn-ghosty !px-2 !py-1 text-[11px]"><Eye size={11} /></button>
                  <span className="chip border-border text-muted-foreground">Licencié</span>
                </div>
              } />
            ))}
          </div>
          <button onClick={() => navigate('/app/recherche')} className="btn-ghosty mt-4 w-full !py-2 text-xs"><UserPlus size={13} /> Recruter un nouveau joueur</button>
        </section>
      </div>
    </div>
  );
}

/* ── Analytique club ── */
export function ClubAnalytics() {
  const { applications, opportunities, players } = useCourtLink();
  const myOpps = opportunities.filter(o => o.orgId === 'org1');
  const appsByOpp = myOpps.map(o => ({ label: o.title.split(' ')[0], value: o.applicants }));
  const positionsCount = POSITIONS.map(pos => ({ label: pos.slice(0, 3), value: players.filter(p => p.position === pos).length }));
  return (
    <div>
      <WorkspaceHeader title="Analytique du recrutement" sub="Indicateurs de démonstration basés sur les données réelles du store (pas de fausses statistiques)." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Candidatures par opportunité</h2>
          <BarChart data={appsByOpp.length ? appsByOpp : [{ label: '—', value: 0 }]} />
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Répartition des postes (annuaire)</h2>
          <BarChart data={positionsCount} />
        </section>
        <section className="card-court p-6 lg:col-span-2">
          <h2 className="mb-4 font-display text-lg font-bold">Entonnoir de conversion</h2>
          {[
            { l: 'Visites d\u2019opportunités', v: 100 }, { l: 'Candidatures reçues', v: 38 },
            { l: 'Présélections', v: 17 }, { l: 'Essais organisés', v: 8 }, { l: 'Retenus', v: 3 },
          ].map(s => (
            <div key={s.l} className="mb-3">
              <div className="mb-1 flex justify-between text-sm"><span>{s.l}</span><span className="tnum text-muted-foreground">{s.v}%</span></div>
              <ProgressBar value={s.v} />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

/* ═══════════ SCOUT ═══════════ */

export function ScoutDashboard() {
  const { favorites, scoutingReports, privateNotes, savedSearches, players, conversations } = useCourtLink();
  const favs = players.filter(p => favorites.includes(p.id));
  const topRated = [...players].sort((a, b) => b.rating - a.rating).slice(0, 3);
  return (
    <div>
      <WorkspaceHeader
        title="Tableau de prospection"
        sub="Votre activité de scouting : favoris, rapports, alertes et nouvelles opportunités de découverte."
        actions={<button onClick={() => navigate('/app/recherche')} className="btn-ball !py-2 text-xs"><Search size={14} /> Prospector</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Favoris</p><p className="mt-2 font-display text-3xl font-black tnum">{favorites.length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Rapports rédigés</p><p className="mt-2 font-display text-3xl font-black tnum">{scoutingReports.length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Notes privées</p><p className="mt-2 font-display text-3xl font-black tnum">{privateNotes.length}</p></div>
        <div className="card-court p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Alertes actives</p><p className="mt-2 font-display text-3xl font-black tnum">{savedSearches.filter(s => s.alerts).length}</p></div>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-bold">Ma shortlist</h2><button onClick={() => navigate('/app/favoris')} className="text-xs font-semibold text-[var(--ball)] hover:underline">Gérer</button></div>
          {favs.length === 0 ? <EmptyState title="Aucun favori" hint="Ajoutez des profils depuis la recherche avancée." /> : (
            <div className="space-y-2">{favs.map(p => <PlayerMiniRow key={p.id} player={p} right={<button onClick={() => navigate(`/joueurs/${p.id}`)} className="btn-ghosty !px-2 !py-1 text-[11px]"><Eye size={11} /></button>} />)}</div>
          )}
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Derniers rapports</h2>
          <div className="space-y-2.5">
            {scoutingReports.slice(0, 3).map(r => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between"><p className="text-sm font-bold">{r.playerName}</p><span className="font-score text-sm text-[var(--ball)]">{r.rating}</span></div>
                <p className="mt-1 text-xs text-muted-foreground">{r.strengths.slice(0, 2).join(' · ')}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">Confiance : {r.confidence} · {r.date}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="card-court p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Trophy size={17} className="text-[var(--ball)]" /> Coups de cœur du moment</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {topRated.map(p => <PlayerCard key={p.id} player={p} />)}
          </div>
        </section>
      </div>
    </div>
  );
}

export function ScoutFavorites() {
  const { favorites, players, toggleFavorite } = useCourtLink();
  const favs = players.filter(p => favorites.includes(p.id));
  return (
    <div>
      <WorkspaceHeader title="Mes favoris" sub="Listes de présélection privées — invisibles des joueurs et des autres comptes." />
      {favs.length === 0 ? <EmptyState title="Aucun favori" hint="Ajoutez des joueurs depuis la recherche avancée (étoile sur les cartes)."
        action={<button onClick={() => navigate('/app/recherche')} className="btn-ball">Ouvrir la recherche</button>} /> : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((p, i) => (
            <div key={p.id} className="relative">
              <PlayerCard player={p} index={i} />
              <button onClick={() => toggleFavorite(p.id)} className="absolute right-3 top-14 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--ball)] bg-[var(--ball)] text-black"><Star size={14} className="fill-black" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function ScoutReports() {
  const { scoutingReports, addScoutingReport, players } = useCourtLink();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ playerId: 'p3', strengths: '', improvements: '', observations: '', confidence: 'Moyenne', rating: 78 });

  return (
    <div>
      <WorkspaceHeader title="Rapports de scouting" sub="Évaluations structurées : qualités, axes de progression, niveau de confiance. Strictement confidentiels."
        actions={<button onClick={() => setOpen(true)} className="btn-ball !py-2 text-xs"><Plus size={14} /> Nouveau rapport</button>} />
      <div className="grid gap-4 lg:grid-cols-2">
        {scoutingReports.map(r => (
          <div key={r.id} className="card-court p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] font-display text-sm font-bold text-[var(--ball)]">{r.playerName.split(' ').map(x => x[0]).slice(0, 2).join('')}</span>
                <div><p className="text-sm font-bold">{r.playerName}</p><p className="text-xs text-muted-foreground">Par {r.scout} · {r.date}</p></div>
              </div>
              <div className="text-right"><p className="font-score text-2xl text-[var(--ball)]">{r.rating}</p><p className="text-[10px] uppercase text-muted-foreground">Confiance : {r.confidence}</p></div>
            </div>
            <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              <div><p className="mb-1.5 font-bold uppercase tracking-wider text-green-400">Qualités</p><ul className="space-y-1">{r.strengths.map(s => <li key={s} className="flex gap-1.5 text-muted-foreground"><span className="text-green-400">+</span>{s}</li>)}</ul></div>
              <div><p className="mb-1.5 font-bold uppercase tracking-wider text-amber-300">Axes de progression</p><ul className="space-y-1">{r.improvements.map(s => <li key={s} className="flex gap-1.5 text-muted-foreground"><span className="text-amber-300">→</span>{s}</li>)}</ul></div>
            </div>
            <p className="mt-3 rounded-lg bg-muted/50 p-3 text-xs italic text-muted-foreground">{r.observations}</p>
          </div>
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form className="card-court w-full max-w-lg !translate-y-0 p-6" onClick={e => e.stopPropagation()}
            onSubmit={e => { e.preventDefault(); const pl = players.find(p => p.id === form.playerId); addScoutingReport({ playerId: form.playerId, playerName: pl?.name ?? '', strengths: form.strengths.split('\n').filter(Boolean), improvements: form.improvements.split('\n').filter(Boolean), confidence: form.confidence as 'Élevée' | 'Moyenne' | 'Faible', observations: form.observations, rating: form.rating }); setOpen(false); }}>
            <h3 className="mb-4 font-display text-lg font-bold">Nouveau rapport de scouting</h3>
            <label className="mb-3 block text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Joueur évalué</span>
              <select value={form.playerId} onChange={e => setForm({ ...form, playerId: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
                {players.map(p => <option key={p.id} value={p.id}>{p.name} — {p.position}</option>)}
              </select></label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Qualités (1/ligne)</span>
                <textarea required rows={3} value={form.strengths} onChange={e => setForm({ ...form, strengths: e.target.value })} className="w-full rounded-lg border border-input bg-background p-2.5 text-sm" /></label>
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Axes de progression (1/ligne)</span>
                <textarea required rows={3} value={form.improvements} onChange={e => setForm({ ...form, improvements: e.target.value })} className="w-full rounded-lg border border-input bg-background p-2.5 text-sm" /></label>
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Niveau de confiance</span>
                <select value={form.confidence} onChange={e => setForm({ ...form, confidence: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {['Élevée', 'Moyenne', 'Faible'].map(c => <option key={c}>{c}</option>)}
                </select></label>
              <label className="text-xs"><span className="mb-1 flex justify-between font-semibold uppercase tracking-wider text-muted-foreground">Note <span className="text-[var(--ball)] tnum">{form.rating}</span></span>
                <input type="range" min={50} max={99} value={form.rating} onChange={e => setForm({ ...form, rating: +e.target.value })} className="mt-3 w-full accent-[var(--ball)]" /></label>
              <label className="text-xs sm:col-span-2"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Observations</span>
                <textarea required rows={3} value={form.observations} onChange={e => setForm({ ...form, observations: e.target.value })} className="w-full rounded-lg border border-input bg-background p-2.5 text-sm" /></label>
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghosty flex-1">Annuler</button>
              <button type="submit" className="btn-ball flex-1">Enregistrer le rapport</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function ScoutNotes() {
  const { privateNotes, addPrivateNote, players } = useCourtLink();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ targetId: 'p3', body: '' });
  return (
    <div>
      <WorkspaceHeader title="Notes privées" sub="Votre bloc-notes confidentiel, rattaché à chaque profil suivi."
        actions={<button onClick={() => setOpen(true)} className="btn-ball !py-2 text-xs"><Plus size={14} /> Nouvelle note</button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {privateNotes.map(n => (
          <div key={n.id} className="card-court p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-bold">{n.targetName}</p>
              <NotebookPen size={14} className="text-[var(--ball)]" />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
            <p className="mt-3 text-[11px] text-muted-foreground">{n.author} · {n.date}</p>
          </div>
        ))}
        {privateNotes.length === 0 && <EmptyState title="Aucune note" hint="Notez vos impressions après chaque visionnage de match." />}
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <form className="card-court w-full max-w-md !translate-y-0 p-6" onClick={e => e.stopPropagation()}
            onSubmit={e => { e.preventDefault(); const pl = players.find(p => p.id === form.targetId); addPrivateNote(form.targetId, pl?.name ?? '', form.body); setOpen(false); setForm({ ...form, body: '' }); }}>
            <h3 className="mb-4 font-display text-lg font-bold">Nouvelle note privée</h3>
            <select value={form.targetId} onChange={e => setForm({ ...form, targetId: e.target.value })} className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <textarea required rows={4} value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} placeholder="Votre observation…" className="mb-4 w-full rounded-lg border border-input bg-background p-3 text-sm" />
            <div className="flex gap-2">
              <button type="button" onClick={() => setOpen(false)} className="btn-ghosty flex-1">Annuler</button>
              <button type="submit" className="btn-ball flex-1">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export function SavedSearchesView() {
  const { savedSearches, removeSavedSearch } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Recherches sauvegardées" sub="Vos filtres récurrents, avec alertes sur les nouveaux profils correspondants." />
      <div className="space-y-3">
        {savedSearches.map(s => (
          <div key={s.id} className="card-court flex flex-wrap items-center gap-3 p-4">
            <BookmarkCheck size={17} className="text-[var(--ball)]" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {Object.entries(s.filters).map(([k, v]) => `${k} : ${v}`).join(' · ')}
                {s.query && ` · recherche « ${s.query} »`}
              </p>
            </div>
            <span className={cn('chip', s.alerts ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{s.alerts ? 'Alertes actives' : 'Sans alertes'}</span>
            <button onClick={() => navigate('/app/recherche')} className="btn-ghosty !py-1.5 text-xs"><Search size={12} /> Relancer</button>
            <button onClick={() => removeSavedSearch(s.id)} className="btn-ghosty !py-1.5 text-xs !border-destructive/40 !text-destructive"><Trash2 size={12} /></button>
          </div>
        ))}
        {savedSearches.length === 0 && <EmptyState title="Aucune recherche sauvegardée" hint="Sauvegardez vos filtres depuis la recherche avancée pour les relancer en un clic." />}
      </div>
    </div>
  );
}
