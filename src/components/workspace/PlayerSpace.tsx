'use client';

import { useRef, useState } from 'react';
import {
  Eye, Play, Send, Star, TrendingUp, User, Plus, Trash2, Check, Clock,
  XCircle, CalendarDays, CreditCard, Settings, Bell, Globe, UsersRound,
  MailOpen, Mail, Download, Search, ImageIcon, Video, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { uploadMedia } from '@/lib/api-mode';
import type { ApplicationStatus, Visibility } from '@/lib/types';
import { POSITIONS } from '@/lib/demo-data';
import { WorkspaceHeader } from './Shell';
import { Stat, ProgressBar, BarChart, Donut, EmptyState, PlayerMiniRow } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

const statusColor: Record<ApplicationStatus, string> = {
  Nouveau: 'border-blue-400/40 text-blue-300',
  'À examiner': 'border-amber-400/40 text-amber-300',
  'Présélectionné': 'border-[var(--ball)]/50 text-[var(--ball)]',
  'Contacté': 'border-violet-400/40 text-violet-300',
  'Essai proposé': 'border-cyan-400/40 text-cyan-300',
  Retenu: 'border-green-400/50 text-green-400',
  'Refusé': 'border-red-400/40 text-red-300',
};

/* ── Dashboard joueur ── */
export function PlayerDashboard() {
  const { players, applications, opportunities, notifications, conversations, profileViews, videoViews, favorites, followedClubs, currentUserId } = useCourtLink();
  const me = players.find(p => p.id === (currentUserId || 'p1')) ?? players[0];
  const myApps = applications.filter(a => a.playerId === me.id || a.playerName === me.name);
  const latestOpps = opportunities.filter(o => o.status === 'Ouverte').slice(0, 3);

  return (
    <div>
      <WorkspaceHeader
        title={`Bonjour, ${me.name.split(' ')[0]} 🏀`}
        sub="Voici l'état de votre visibilité et de vos démarches de recrutement aujourd'hui."
        actions={<button onClick={() => navigate('/app/profil')} className="btn-ball !py-2 text-xs">Compléter mon profil</button>}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Consultations profil</span><Eye size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{profileViews}</p><p className="mt-1 text-xs text-green-400">+18 cette semaine</p></div>
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Vues des vidéos</span><Play size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{videoViews}</p><p className="mt-1 text-xs text-green-400">+11 cette semaine</p></div>
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Candidatures actives</span><Send size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{myApps.filter(a => a.status !== 'Refusé').length}</p><p className="mt-1 text-xs text-muted-foreground">{myApps.length} au total</p></div>
        <div className="card-court p-5"><div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">Indice CourtLink</span><TrendingUp size={15} className="text-[var(--ball)]" /></div><p className="mt-2 font-display text-3xl font-black tnum">{me.rating}</p><p className="mt-1 text-xs text-muted-foreground">Top 15% de votre catégorie</p></div>
      </div>

      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="card-court p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Suivi de mes candidatures</h2>
              <button onClick={() => navigate('/app/candidatures')} className="text-xs font-semibold text-[var(--ball)] hover:underline">Tout voir</button>
            </div>
            {myApps.length === 0 ? (
              <EmptyState title="Aucune candidature pour l'instant" hint="Parcourez les opportunités ouvertes et postulez : le club verra votre profil vérifié." action={<button onClick={() => navigate('/app/opportunites')} className="btn-ball !py-2 text-xs">Voir les opportunités</button>} />
            ) : (
              <div className="space-y-3">
                {myApps.slice(0, 4).map(a => (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{a.opportunityTitle}</p>
                      <p className="text-xs text-muted-foreground">{a.opportunityId.startsWith('o') ? 'Organisation' : ''} · mise à jour {a.updatedAt}</p>
                    </div>
                    <span className={cn('chip', statusColor[a.status])}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Opportunités recommandées</h2>
            <div className="space-y-3">
              {latestOpps.map(o => (
                <div key={o.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:border-[var(--ball)]">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{o.title}</p>
                    <p className="text-xs text-muted-foreground">{o.org} · {o.city} · {o.position} · échéance {o.deadline}</p>
                  </div>
                  <button onClick={() => navigate(`/opportunites/${o.id}`)} className="btn-ghosty !py-1.5 text-xs">Détails</button>
                </div>
              ))}
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Complétude du profil</h2>
            <div className="flex items-center justify-around">
              <Donut value={92} label="Complété" />
              <div className="space-y-2 text-xs">
                <p className="flex items-center gap-2"><Check size={13} className="text-green-400" /> Statistiques 2 saisons</p>
                <p className="flex items-center gap-2"><Check size={13} className="text-green-400" /> 2 vidéos publiées</p>
                <p className="flex items-center gap-2"><Check size={13} className="text-green-400" /> 1 référence vérifiée</p>
                <p className="flex items-center gap-2 text-muted-foreground"><Clock size={13} /> Photo secondaire manquante</p>
              </div>
            </div>
            <button onClick={() => navigate('/app/profil')} className="btn-ghosty mt-5 w-full !py-2 text-xs">Modifier mon profil</button>
          </section>
          <section className="card-court p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Bell size={16} className="text-[var(--ball)]" /> Notifications récentes</h2>
            <div className="space-y-2.5">
              {notifications.slice(0, 4).map(n => (
                <div key={n.id} className={cn('rounded-lg border p-3', n.read ? 'border-border' : 'border-[var(--ball)]/40 bg-[color-mix(in_oklch,var(--ball)_6%,transparent)]')}>
                  <p className="text-xs font-bold">{n.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="card-court p-6">
            <h2 className="mb-3 font-display text-lg font-bold">Réseau</h2>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-muted/50 p-3"><p className="font-display text-xl font-black tnum">{favorites.length}</p><p className="text-[10px] uppercase text-muted-foreground">favoris scouts</p></div>
              <div className="rounded-lg bg-muted/50 p-3"><p className="font-display text-xl font-black tnum">{followedClubs.length}</p><p className="text-[10px] uppercase text-muted-foreground">clubs suivis</p></div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ── Éditeur de profil joueur ── */
export function PlayerProfileEdit() {
  const { players, currentUserId, updatePlayer, addSeasonStat } = useCourtLink();
  const me = players.find(p => p.id === (currentUserId || 'p1')) ?? players[0];
  const [form, setForm] = useState({ bio: me.bio, city: me.city, height: me.height, position: me.position, availability: me.availability, education: me.education, visibility: me.visibility as Visibility, club: me.club, number: me.number });
  const [stat, setStat] = useState({ season: '2026-27', competition: 'Championnat Littoral', ppg: 12, rpg: 4, apg: 3, games: 10 });
  const [upBusy, setUpBusy] = useState<'photo' | 'video' | null>(null);
  const [upErr, setUpErr] = useState('');
  const photoRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const sendMedia = async (file: File, kind: 'photos' | 'videos') => {
    setUpBusy(kind === 'photos' ? 'photo' : 'video'); setUpErr('');
    try {
      const out = await uploadMedia(file, kind);
      if (kind === 'photos') {
        updatePlayer(me.id, { photo: out.url });
        toast.success('Photo mise en ligne (Cloudinary — dossier courtlink/photos).');
      } else {
        updatePlayer(me.id, { videos: [{ id: `v${Date.now()}`, label: file.name.slice(0, 42), url: out.url, kind: 'highlights' }, ...me.videos] });
        toast.success('Vidéo ajoutée à votre profil (Cloudinary — dossier courtlink/videos).');
      }
    } catch (e) {
      setUpErr((e as Error).message);
    }
    setUpBusy(null);
  };

  const upd = (patch: Partial<typeof form>) => setForm(f => ({ ...f, ...patch }));

  return (
    <div>
      <WorkspaceHeader title="Mon profil sportif" sub="Chaque modification se répercute immédiatement sur votre profil public et dans les recherches des recruteurs." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><User size={17} className="text-[var(--ball)]" /> Informations sportives</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Club actuel</span>
                <input value={form.club} onChange={e => upd({ club: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Numéro de maillot</span>
                <input type="number" min={0} max={99} value={form.number} onChange={e => upd({ number: +e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm tnum" /></label>
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Poste principal</span>
                <select value={form.position} onChange={e => upd({ position: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {POSITIONS.map(p => <option key={p}>{p}</option>)}
                </select></label>
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Taille (cm)</span>
                <input type="number" min={150} max={230} value={form.height} onChange={e => upd({ height: +e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm tnum" /></label>
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Ville</span>
                <input value={form.city} onChange={e => upd({ city: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
              <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Disponibilité</span>
                <select value={form.availability} onChange={e => upd({ availability: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  {['Immédiate', 'Dans 1 mois', 'Fin de saison', 'Sur discussion'].map(a => <option key={a}>{a}</option>)}
                </select></label>
              <label className="text-xs sm:col-span-2"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Biographie publique</span>
                <textarea rows={4} value={form.bio} onChange={e => upd({ bio: e.target.value })} className="w-full rounded-lg border border-input bg-background p-3 text-sm" /></label>
              <label className="text-xs sm:col-span-2"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Formation scolaire / universitaire</span>
                <input value={form.education} onChange={e => upd({ education: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
            </div>
          </section>

          <section className="card-court p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold"><TrendingUp size={17} className="text-[var(--ball)]" /> Statistiques par saison</h2>
            <p className="mb-4 text-xs text-muted-foreground">Ajoutez une ligne par saison et compétition : elles alimentent le tableau public et les filtres des recruteurs.</p>
            <div className="mb-5 grid gap-2 rounded-lg border border-dashed border-border p-4 sm:grid-cols-3 lg:grid-cols-6">
              <input value={stat.season} onChange={e => setStat({ ...stat, season: e.target.value })} placeholder="Saison" className="h-10 rounded-lg border border-input bg-background px-2 text-sm" />
              <input value={stat.competition} onChange={e => setStat({ ...stat, competition: e.target.value })} placeholder="Compétition" className="h-10 rounded-lg border border-input bg-background px-2 text-sm sm:col-span-2" />
              {([['ppg', 'PTS'], ['rpg', 'REB'], ['apg', 'PAS'], ['games', 'MJ']] as const).map(([k, l]) => (
                <input key={k} type="number" value={stat[k]} onChange={e => setStat({ ...stat, [k]: +e.target.value })} placeholder={l} className="h-10 rounded-lg border border-input bg-background px-2 text-sm tnum" />
              ))}
              <button onClick={() => addSeasonStat(me.id, { ...stat, spg: 1, bpg: 0.3, fgPct: 44, tpPct: 31 })} className="btn-ball !py-2 text-xs"><Plus size={13} /> Ajouter</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2">Saison</th><th className="pb-2">Compétition</th><th className="pb-2 text-right">PTS</th><th className="pb-2 text-right">REB</th><th className="pb-2 text-right">PAS</th><th className="pb-2 text-right">MJ</th>
                </tr></thead>
                <tbody className="tnum">
                  {me.stats.map((s, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="py-2 font-semibold">{s.season}</td><td className="py-2 text-muted-foreground">{s.competition}</td>
                      <td className="py-2 text-right font-bold text-[var(--ball)]">{s.ppg}</td><td className="py-2 text-right">{s.rpg}</td>
                      <td className="py-2 text-right">{s.apg}</td><td className="py-2 text-right">{s.games}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><ImageIcon size={17} className="text-[var(--ball)]" /> Photo & vidéos</h2>
            <p className="mb-4 text-xs text-muted-foreground">Upload réel vers Cloudinary (dossier « courtlink/ ») : photo de profil et extrait vidéo de highlights.</p>
            <div className="flex flex-wrap items-center gap-3">
              {me.photo
                ? <img src={me.photo} alt="Photo de profil" className="h-16 w-16 rounded-xl border border-border object-cover" />
                : <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-border text-[10px] text-muted-foreground">Aucune</span>}
              <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void sendMedia(f, 'photos'); e.target.value = ''; }} />
              <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) void sendMedia(f, 'videos'); e.target.value = ''; }} />
              <button onClick={() => photoRef.current?.click()} disabled={upBusy !== null} className="btn-ghosty !py-2 text-xs disabled:opacity-60">
                {upBusy === 'photo' ? <Loader2 size={13} className="animate-spin" /> : <ImageIcon size={13} />} Photo
              </button>
              <button onClick={() => videoRef.current?.click()} disabled={upBusy !== null} className="btn-ghosty !py-2 text-xs disabled:opacity-60">
                {upBusy === 'video' ? <Loader2 size={13} className="animate-spin" /> : <Video size={13} />} Vidéo
              </button>
            </div>
            {upErr && <p className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 p-2.5 text-[11px] text-red-400">{upErr}</p>}
            {me.videos.length > 0 && (
              <div className="mt-4 space-y-1.5">
                {me.videos.slice(0, 4).map(v => (
                  <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs hover:border-[var(--ball)]">
                    <Video size={13} className="text-[var(--ball)]" /> <span className="truncate">{v.label}</span>
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">{v.kind}</span>
                  </a>
                ))}
              </div>
            )}
          </section>
          <section className="card-court p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Globe size={17} className="text-[var(--ball)]" /> Visibilité & confidentialité</h2>
            <div className="space-y-2">
              {([
                ['public', 'Public', 'Visible par tous, y compris les visiteurs non connectés'],
                ['members', 'Membres connectés', 'Visible uniquement par les comptes inscrits'],
                ['private', 'Privé', 'Profil masqué des annuaires ; accès direct uniquement'],
              ] as const).map(([v, t, d]) => (
                <button key={v} onClick={() => upd({ visibility: v })} className={cn('flex w-full items-start gap-3 rounded-lg border p-3 text-left', form.visibility === v ? 'border-[var(--ball)] bg-[color-mix(in_oklch,var(--ball)_8%,transparent)]' : 'border-border')}>
                  <span className={cn('mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border', form.visibility === v ? 'border-[var(--ball)]' : 'border-border')}>
                    {form.visibility === v && <span className="h-2 w-2 rounded-full bg-[var(--ball)]" />}
                  </span>
                  <span><span className="block text-sm font-semibold">{t}</span><span className="block text-xs text-muted-foreground">{d}</span></span>
                </button>
              ))}
            </div>
            <p className="mt-3 rounded-lg bg-muted/50 p-3 text-[11px] leading-relaxed text-muted-foreground">
              Astuce : un profil « Public » avec vidéos complètes reçoit 3× plus de consultations. Les mineurs restent limités automatiquement.
            </p>
          </section>
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Prévisualisation publique</h2>
            <div className="rounded-lg border border-border">
              <div className="flex h-28 items-end overflow-hidden bg-[var(--court)] p-3" style={{ backgroundImage: 'linear-gradient(rgba(255,107,26,.15),rgba(0,0,0,.6))' }}>
                <div>
                  <p className="font-display text-lg font-bold text-white">{me.name}</p>
                  <p className="text-xs text-white/70">{form.position} · {form.height} cm · {form.club}</p>
                </div>
              </div>
              <p className="p-3 text-xs text-muted-foreground">{form.bio || 'Aucune biographie pour l\'instant.'}</p>
            </div>
            <button onClick={() => navigate(`/joueurs/${me.id}`)} className="btn-ghosty mt-4 w-full !py-2 text-xs">Voir mon profil public</button>
          </section>
          <button onClick={() => updatePlayer(me.id, form)} className="btn-ball w-full !py-3">Enregistrer les modifications</button>
        </div>
      </div>
    </div>
  );
}

/* ── Opportunités côté joueur ── */
export function PlayerOpportunities() {
  const { opportunities, applyToOpportunity, applications } = useCourtLink();
  const [q, setQ] = useState('');
  const list = opportunities.filter(o => o.status === 'Ouverte' && (!q || o.title.toLowerCase().includes(q.toLowerCase())));
  return (
    <div>
      <WorkspaceHeader title="Répertoire des opportunités" sub="Toutes les offres publiées par les structures vérifiées." />
      <div className="mb-4 flex gap-2">
        <div className="relative max-w-md flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Filtrer par titre…" className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]" />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map(o => {
          const applied = applications.some(a => a.opportunityId === o.id && (a.playerId === 'p1' || a.playerName === 'Vous'));
          return (
            <div key={o.id} className="card-court p-5">
              <div className="mb-2 flex items-center justify-between"><span className="chip border-[var(--ball)]/40 text-[var(--ball)]">{o.type}</span><span className="text-[11px] text-muted-foreground">{o.deadline}</span></div>
              <h3 className="font-display text-base font-bold">{o.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{o.org} · {o.city}, {o.country}</p>
              <p className="mt-2 text-xs text-muted-foreground">{o.position} · {o.ageRange} · {o.slots} place(s)</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigate(`/opportunites/${o.id}`)} className="btn-ghosty flex-1 !py-2 text-xs">Détails</button>
                {applied ? <span className="flex flex-1 items-center justify-center rounded-lg border border-green-500/40 bg-green-500/10 text-xs font-semibold text-green-400"><Check size={12} /> Postulé</span>
                  : <button onClick={() => applyToOpportunity(o.id, `Candidature depuis mon espace — profil complet à jour.`)} className="btn-ball flex-1 !py-2 text-xs"><Send size={12} /> Postuler</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Candidatures joueur ── */
export function PlayerApplications() {
  const { applications, players, currentUserId } = useCourtLink();
  const me = players.find(p => p.id === (currentUserId || 'p1'));
  const mine = applications.filter(a => a.playerId === (me?.id ?? 'p1') || a.playerName === me?.name);
  return (
    <div>
      <WorkspaceHeader title="Mes candidatures" sub="Suivi en temps réel des statuts définis par les clubs : chaque changement notifie votre tableau de bord." />
      {mine.length === 0 ? (
        <EmptyState title="Aucune candidature envoyée" hint="Rendez-vous dans le répertoire des opportunités pour postuler."
          action={<button onClick={() => navigate('/app/opportunites')} className="btn-ball">Voir les opportunités</button>} />
      ) : (
        <div className="space-y-4">
          {mine.map(a => (
            <div key={a.id} className="card-court p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold">{a.opportunityTitle}</h3>
                  <p className="text-xs text-muted-foreground">Motivation : « {a.motivation.slice(0, 80)}… »</p>
                </div>
                <span className={cn('chip', statusColor[a.status])}>{a.status}</span>
              </div>
              <div className="mt-4 flex items-center gap-1 overflow-x-auto pb-1">
                {['Nouveau', 'À examiner', 'Présélectionné', 'Contacté', 'Essai proposé', 'Retenu'].map((s, i) => {
                  const reached = a.history.some(h => h.status === s) || a.status === s || (a.status === 'Refusé' && a.history.some(h => h.status === s));
                  const idx = a.history.findIndex(h => h.status === s);
                  return (
                    <div key={s} className="flex min-w-24 flex-1 items-center">
                      <div className="flex-1">
                        <div className={cn('mb-1.5 h-1 rounded-full', reached ? 'bg-[var(--ball)]' : 'bg-muted')} />
                        <p className={cn('text-[10px] leading-tight', idx >= 0 || a.status === s ? 'font-semibold text-foreground' : 'text-muted-foreground')}>{s}</p>
                        {idx >= 0 && <p className="text-[9px] text-muted-foreground">{a.history[idx].date}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {a.status === 'Refusé' && (
                <p className="mt-3 rounded-lg border border-red-400/30 bg-red-400/5 p-3 text-xs text-red-300">
                  Cette candidature a été refusée. Le club n'a pas fourni de motif public — cela arrive : continuez à postuler, votre profil reste visible.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Invitations reçues ── */
export function PlayerInvitations() {
  const { consentRequests, players, currentUserId } = useCourtLink();
  const me = players.find(p => p.id === (currentUserId || 'p1'));
  const invites = consentRequests.filter(c => c.playerName === me?.name || c.playerId === me?.id);
  return (
    <div>
      <WorkspaceHeader title="Invitations & demandes reçues" sub="Clubs, scouts et organisateurs qui souhaitent vous contacter. Vous gardez le contrôle." />
      {invites.length === 0 ? (
        <EmptyState title="Aucune invitation pour le moment" hint="Quand un recruteur vous contactera, la demande apparaîtra ici avec son identité vérifiée." />
      ) : (
        <div className="space-y-3">
          {invites.map(c => (
            <div key={c.id} className="card-court flex flex-wrap items-center gap-3 p-4">
              <Mail size={18} className="text-[var(--ball)]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{c.kind} — {c.requester}</p>
                <p className="text-xs text-muted-foreground">{c.date} · statut : {c.status}</p>
              </div>
              <span className={cn('chip', c.status === 'Approuvée' ? 'border-green-500/40 text-green-400' : c.status === 'Refusée' ? 'border-red-500/40 text-red-300' : 'border-amber-500/40 text-amber-300')}>{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Clubs suivis ── */
export function PlayerFollows() {
  const { followedClubs, organizations, toggleFollow, opportunities } = useCourtLink();
  const list = organizations.filter(o => followedClubs.includes(o.id));
  return (
    <div>
      <WorkspaceHeader title="Clubs suivis" sub="Vous recevez leurs nouvelles opportunités dans vos notifications." />
      {list.length === 0 ? (
        <EmptyState title="Vous ne suivez aucune structure" hint="Suivez vos clubs préférés depuis leur page publique."
          action={<button onClick={() => navigate('/organisations')} className="btn-ball">Explorer les clubs</button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map(o => {
            const opps = opportunities.filter(x => x.orgId === o.id && x.status === 'Ouverte');
            return (
              <div key={o.id} className="card-court p-5">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={o.image} alt={o.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-display text-sm font-bold">{o.name}</p>
                    <p className="text-xs text-muted-foreground">{o.city}, {o.country}</p>
                  </div>
                  <button onClick={() => toggleFollow(o.id)} className="btn-ghosty !py-1.5 text-xs"><XCircle size={12} /> Ne plus suivre</button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{opps.length} opportunité(s) ouverte(s) actuellement.</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Paramètres compte ── */
export function PlayerSettings() {
  const { settings, updateSettings, resetDemo } = useCourtLink();
  return (
    <div>
      <WorkspaceHeader title="Paramètres du compte" sub="Préférences de compte — la version production inclura 2FA et gestion des sessions." />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Notifications</h2>
          <div className="space-y-3">
            {[['Nouvelles opportunités correspondant à mon poste', true], ['Changements de statut de candidature', true], ['Messages de recruteurs vérifiés', true], ['Consultations de profil (résumé hebdo)', false]].map(([t, on]) => (
              <label key={t as string} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border p-3 text-sm">
                {t as string}
                <input type="checkbox" defaultChecked={on as boolean} className="accent-[var(--ball)]" />
              </label>
            ))}
          </div>
        </section>
        <section className="card-court p-6">
          <h2 className="mb-4 font-display text-lg font-bold">Sécurité & données</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div><p className="font-semibold">Changer le mot de passe</p><p className="text-xs text-muted-foreground">Simulation — aucune authentification réelle</p></div>
              <button className="btn-ghosty !py-1.5 text-xs" onClick={() => alert('Simulation : un e-mail de changement serait envoyé.')}>Modifier</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div><p className="font-semibold">Exporter mes données</p><p className="text-xs text-muted-foreground">JSON des données démo</p></div>
              <button className="btn-ghosty !py-1.5 text-xs" onClick={() => { const data = JSON.stringify(useCourtLink.getState(), null, 2); const blob = new Blob([data], { type: 'application/json' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'courtlink-demo-export.json'; a.click(); }}>Télécharger</button>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-destructive/40 p-3">
              <div><p className="font-semibold text-destructive">Réinitialiser la démonstration</p><p className="text-xs text-muted-foreground">Restaure les données d'origine</p></div>
              <button className="btn-ghosty !py-1.5 text-xs !border-destructive !text-destructive" onClick={() => { if (confirm('Réinitialiser ?')) { resetDemo(); navigate('/'); } }}><Trash2 size={13} /> Réinitialiser</button>
            </div>
          </div>
        </section>
        <section className="card-court p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Settings size={17} className="text-[var(--ball)]" /> Paramètres de la plateforme (administration)</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Nom de la marque</span>
              <input value={settings.brandName} onChange={e => updateSettings({ brandName: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
            <label className="text-xs"><span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Accroche</span>
              <input value={settings.tagline} onChange={e => updateSettings({ tagline: e.target.value })} className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" /></label>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Éditable depuis le compte administrateur — la marque reste modifiable facilement (nom, logo, couleur d'accent).</p>
        </section>
      </div>
    </div>
  );
}
