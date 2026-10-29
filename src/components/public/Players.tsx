'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search, SlidersHorizontal, MapPin, Star, ChevronLeft, Ruler, Weight, Hand,
  Youtube, GraduationCap, Languages, CalendarDays, Target, Send, Eye, Play, BadgeCheck,
  TrendingUp, X, Bookmark, Mail, Flag, Ban,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { POSITIONS, COUNTRIES } from '@/lib/demo-data';
import { ageFrom, category } from '@/lib/router';
import { PlayerCard, VerifiedBadge, Stat, EmptyState, ProgressBar, BarChart, Donut, SectionHead } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

export interface SearchState {
  query: string; position: string; country: string; category: string;
  minHeight: number; verifiedOnly: boolean; availableOnly: boolean; sort: string;
}

export function PlayersDirectory() {
  const { players, favorites, toggleFavorite, role, loggedIn } = useCourtLink();
  const stored = typeof window !== 'undefined' ? sessionStorage.getItem('courtlink-search') : null;
  const [f, setF] = useState<SearchState>(stored
    ? { query: JSON.parse(stored).query ?? '', position: JSON.parse(stored).position ?? 'Tous les postes', country: JSON.parse(stored).country ?? 'Tous les pays', category: 'Toutes catégories', minHeight: 160, verifiedOnly: false, availableOnly: false, sort: 'Indice' }
    : { query: '', position: 'Tous les postes', country: 'Tous les pays', category: 'Toutes catégories', minHeight: 160, verifiedOnly: false, availableOnly: false, sort: 'Indice' });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (stored) sessionStorage.removeItem('courtlink-search');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const results = useMemo(() => {
    const q = f.query.trim().toLowerCase();
    let list = players.filter(p =>
      (!q || `${p.name} ${p.city} ${p.country} ${p.club} ${p.position}`.toLowerCase().includes(q)) &&
      (f.position === 'Tous les postes' || p.position === f.position || p.secondaryPositions.includes(f.position)) &&
      (f.country === 'Tous les pays' || p.country === f.country) &&
      (f.category === 'Toutes catégories' || category(p.birthDate) === f.category) &&
      p.height >= f.minHeight &&
      (!f.verifiedOnly || p.verified) &&
      (!f.availableOnly || p.available)
    );
    if (f.sort === 'Indice') list = [...list].sort((a, b) => b.rating - a.rating);
    if (f.sort === 'Taille') list = [...list].sort((a, b) => b.height - a.height);
    if (f.sort === 'Points') list = [...list].sort((a, b) => (b.stats[0]?.ppg ?? 0) - (a.stats[0]?.ppg ?? 0));
    if (f.sort === 'Nom') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [players, f]);

  const canCompare = ['club', 'scout'].includes(role) && loggedIn;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <div className="mb-6">
        <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
        <h1 className="font-display text-3xl font-black md:text-4xl">Annuaire des joueurs</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          {players.length} profils de démonstration issus de 10 pays — recherche multicritères, statistiques par saison et vérification visible sur chaque carte.
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="card-court !translate-y-0 sticky top-20 z-20 mb-6 !shadow-lg p-4 !hover:transform-none backdrop-blur-xl">
        <div className="grid gap-2.5 md:grid-cols-[1.5fr_1fr_1fr_auto]">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={f.query} onChange={e => setF({ ...f, query: e.target.value })}
              placeholder="Nom, ville, club, poste…"
              className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]"
            />
          </div>
          <select value={f.position} onChange={e => setF({ ...f, position: e.target.value })} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
            <option>Tous les postes</option>
            {POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={f.country} onChange={e => setF({ ...f, country: e.target.value })} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
            <option>Tous les pays</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className={cn('btn-ghosty h-11', showFilters && 'border-[var(--ball)] text-[var(--ball)]')}>
            <SlidersHorizontal size={15} /> Filtres
          </button>
        </div>
        {showFilters && (
          <div className="fade-up mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-4">
            <label className="text-xs">
              <span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Catégorie d&apos;âge</span>
              <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-2 text-sm">
                <option>Toutes catégories</option>
                {['U17', 'U19', 'U21', 'Espoir', 'Senior'].map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label className="text-xs">
              <span className="mb-1.5 flex justify-between font-semibold uppercase tracking-wider text-muted-foreground">
                Taille minimum <span className="tnum text-[var(--ball)]">{f.minHeight} cm</span>
              </span>
              <input type="range" min={160} max={215} value={f.minHeight} onChange={e => setF({ ...f, minHeight: +e.target.value })} className="mt-2 w-full accent-[var(--ball)]" />
            </label>
            <div className="flex flex-col justify-center gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={f.verifiedOnly} onChange={e => setF({ ...f, verifiedOnly: e.target.checked })} className="accent-[var(--ball)]" />
                Profils vérifiés uniquement
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={f.availableOnly} onChange={e => setF({ ...f, availableOnly: e.target.checked })} className="accent-[var(--ball)]" />
                Disponibles maintenant
              </label>
            </div>
            <label className="text-xs">
              <span className="mb-1.5 block font-semibold uppercase tracking-wider text-muted-foreground">Trier par</span>
              <select value={f.sort} onChange={e => setF({ ...f, sort: e.target.value })} className="h-10 w-full rounded-lg border border-input bg-background px-2 text-sm">
                {['Indice', 'Taille', 'Points', 'Nom'].map(s => <option key={s}>{s}</option>)}
              </select>
            </label>
          </div>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
        <span><strong className="tnum text-foreground">{results.length}</strong> joueur(s) trouvé(s)</span>
        {canCompare && <span className="text-xs">Astuce : activez « Comparer » sur les cartes puis rendez-vous dans votre espace.</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border">
              <div className="skeleton h-44" />
              <div className="space-y-2 p-4"><div className="skeleton h-4 w-2/3 rounded" /><div className="skeleton h-3 w-1/2 rounded" /></div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="Aucun joueur ne correspond à ces critères"
          hint="Essayez d'élargir la recherche : baissez la taille minimum, retirez le filtre de catégorie ou choisissez « Tous les pays »."
          action={<button onClick={() => setF({ query: '', position: 'Tous les postes', country: 'Tous les pays', category: 'Toutes catégories', minHeight: 160, verifiedOnly: false, availableOnly: false, sort: 'Indice' })} className="btn-ball">Réinitialiser les filtres</button>}
        />
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)] gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map((p, i) => (
            <div key={p.id} className="relative">
              <PlayerCard player={p} index={i} />
              {loggedIn && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                  className={cn(
                    'absolute right-3 top-14 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-sm transition-all',
                    favorites.includes(p.id) ? 'border-[var(--ball)] bg-[var(--ball)] text-black' : 'border-white/25 bg-black/40 text-white hover:border-[var(--ball)]'
                  )}
                  aria-label={favorites.includes(p.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Star size={14} className={favorites.includes(p.id) ? 'fill-black' : ''} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────── Profil détaillé ─────────── */

export function PlayerProfile({ id }: { id: string }) {
  const { players, organizations, favorites, toggleFavorite, followedClubs, toggleFollow, role, loggedIn, applyToOpportunity, startConversation, submitReport, requestContact, opportunities } = useCourtLink();
  const player = players.find(p => p.id === id);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyOpp, setApplyOpp] = useState('');
  const [motivation, setMotivation] = useState('');
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgBody, setMsgBody] = useState('');
  const [reportOpen, setReportOpen] = useState(false);

  if (!player) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState title="Joueur introuvable" hint="Ce profil n'existe pas ou a été retiré de l'annuaire."
          action={<button onClick={() => navigate('/joueurs')} className="btn-ball">Retour à l'annuaire</button>} />
      </div>
    );
  }

  const org = organizations.find(o => o.name === player.club);
  const age = ageFrom(player.birthDate);
  const isFav = favorites.includes(player.id);
  const canScout = ['club', 'scout'].includes(role) && loggedIn;
  const visibleStats = player.visibility === 'private' && !loggedIn ? [] : player.stats;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/joueurs')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Annuaire des joueurs</button>

      {/* Bannière */}
      <div className="card-court overflow-hidden">
        <div className="relative h-56 md:h-72">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={player.photo} alt={player.name} className="h-full w-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.96)] via-[rgba(10,10,12,0.4)] to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-4 md:left-8 md:bottom-6">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <VerifiedBadge verified={player.verified && !player.suspended} />
                {player.isMinor && <span className="chip border-[var(--amber-glow)]/50 bg-[color-mix(in_oklch,var(--amber-glow)_15%,transparent)] text-[var(--amber-glow)]">Profil protégé (mineur)</span>}
                {player.available ? <span className="chip border-green-500/50 bg-green-500/15 text-green-400">Disponible</span> : <span className="chip border-border bg-muted text-muted-foreground">Non disponible</span>}
                {player.suspended && <span className="chip border-destructive/60 bg-destructive/20 text-red-300"><Ban size={11} /> Suspendu par l'administration</span>}
              </div>
              <h1 className="font-display text-3xl font-black text-white md:text-5xl">{player.name}</h1>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/75">
                <span>#{player.number} · {player.position}{player.secondaryPositions.length > 0 && ` / ${player.secondaryPositions.join(', ')}`}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={13} /> {player.city}, {player.country}</span>
                {org && <button onClick={() => navigate(`/organisations/${org.id}`)} className="inline-flex items-center gap-1 text-[var(--ball)] hover:underline">{player.club}</button>}
              </p>
            </div>
            <div className="flex items-center gap-6 text-white">
              <div className="text-right">
                <div className="font-score text-4xl md:text-5xl text-[var(--ball)] tnum">{player.rating}</div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">Indice CourtLink</div>
              </div>
              <div className="hidden h-12 w-px bg-white/15 md:block" />
              <div className="hidden text-right md:block">
                <div className="font-display text-2xl font-bold tnum">{player.height} cm</div>
                <div className="text-[10px] uppercase tracking-widest text-white/60">Taille</div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
          {loggedIn && (
            <>
              <button onClick={() => toggleFavorite(player.id)} className={cn('btn-ghosty !py-2 text-xs', isFav && 'border-[var(--ball)] text-[var(--ball)]')}>
                <Star size={14} className={isFav ? 'fill-[var(--ball)]' : ''} /> {isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              </button>
              {canScout && (
                <>
                  <button onClick={() => setMsgOpen(true)} className="btn-ball !py-2 text-xs"><Mail size={14} /> Contacter {player.isMinor ? 'via le tuteur' : 'le joueur'}</button>
                  {player.isMinor && (
                    <button onClick={() => requestContact(player.id, player.name, 'Essai')} className="btn-ghosty !py-2 text-xs">
                      <Send size={14} /> Demander un essai (consentement tuteur)
                    </button>
                  )}
                </>
              )}
              {!player.isMinor && role === 'player' && <span className="text-xs text-muted-foreground">Connecté comme joueur — vous voyez ce profil comme les recruteurs.</span>}
            </>
          )}
          {!loggedIn && <button onClick={() => navigate('/connexion')} className="btn-ball !py-2 text-xs">Connectez-vous pour contacter</button>}
          <div className="ml-auto flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1"><Eye size={12} /> {player.views} consultations</span>
            <button onClick={() => setReportOpen(true)} className="inline-flex items-center gap-1 hover:text-destructive"><Flag size={12} /> Signaler</button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        {/* Colonne principale */}
        <div className="space-y-6">
          {/* Bio */}
          <section className="card-court p-6">
            <h2 className="mb-3 font-display text-lg font-bold">Présentation</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{player.bio}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat value={`${age} ans`} label={`Né en ${player.birthDate.slice(0, 4)}`} />
              <Stat value={category(player.birthDate)} label="Catégorie" accent />
              <Stat value={`${player.height} cm`} label="Taille" />
              <Stat value={`${player.weight} kg`} label="Poids" />
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
              <p className="flex items-center gap-2 text-muted-foreground"><Hand size={14} className="text-[var(--ball)]" /> {player.dominantHand}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><Languages size={14} className="text-[var(--ball)]" /> {player.languages.join(', ')}</p>
              <p className="flex items-center gap-2 text-muted-foreground"><GraduationCap size={14} className="text-[var(--ball)]" /> {player.education}</p>
            </div>
          </section>

          {/* Statistiques */}
          <section className="card-court p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold"><TrendingUp size={17} className="text-[var(--ball)]" /> Statistiques par saison</h2>
            <p className="mb-4 text-xs text-muted-foreground">Moyennes par match, vérifiées auprès des compétitions officielles de démonstration.</p>
            {visibleStats.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Statistiques visibles uniquement par les membres connectés pour ce profil.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 pr-3">Saison</th><th className="pb-2 pr-3">Compétition</th>
                        <th className="pb-2 pr-3 text-right">PTS</th><th className="pb-2 pr-3 text-right">REB</th>
                        <th className="pb-2 pr-3 text-right">PAS</th><th className="pb-2 pr-3 text-right">INT</th>
                        <th className="pb-2 pr-3 text-right">CTR</th><th className="pb-2 pr-3 text-right">%TIR</th>
                        <th className="pb-2 text-right">3P</th><th className="pb-2 text-right">MJ</th>
                      </tr>
                    </thead>
                    <tbody className="tnum">
                      {visibleStats.map((s, i) => (
                        <tr key={i} className="border-b border-border/60 last:border-0">
                          <td className="py-2.5 pr-3 font-semibold">{s.season}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{s.competition}</td>
                          <td className="py-2.5 pr-3 text-right font-bold text-[var(--ball)]">{s.ppg}</td>
                          <td className="py-2.5 pr-3 text-right">{s.rpg}</td>
                          <td className="py-2.5 pr-3 text-right">{s.apg}</td>
                          <td className="py-2.5 pr-3 text-right">{s.spg}</td>
                          <td className="py-2.5 pr-3 text-right">{s.bpg}</td>
                          <td className="py-2.5 pr-3 text-right">{s.fgPct}%</td>
                          <td className="py-2.5 pr-3 text-right">{s.tpPct}%</td>
                          <td className="py-2.5 text-right">{s.games}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-6 grid gap-6 border-t border-border pt-5 md:grid-cols-[1fr_auto]">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Évolution des points — {visibleStats[0]?.competition}</p>
                    <BarChart height={110} data={visibleStats.map(s => ({ label: s.season.slice(2, 7), value: s.ppg }))} />
                  </div>
                  <div className="flex gap-4">
                    <Donut value={visibleStats[0]?.fgPct ?? 0} label="% aux tirs" />
                    <Donut value={visibleStats[0]?.tpPct ?? 0} label="% à 3 points" />
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Vidéos */}
          <section className="card-court p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold"><Youtube size={17} className="text-[var(--ball)]" /> Vidéos & highlights</h2>
            <p className="mb-4 text-xs text-muted-foreground">{player.videoViews} vues cumulées sur les extraits de démonstration.</p>
            {player.videos.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Aucune vidéo publiée pour l'instant.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {player.videos.map(v => (
                  <a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3 transition-colors hover:border-[var(--ball)]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[color-mix(in_oklch,var(--ball)_15%,transparent)] text-[var(--ball)]"><Play size={16} /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{v.label}</span>
                      <span className="text-xs text-muted-foreground capitalize">{v.kind} · lien de démonstration</span>
                    </span>
                    <span className="text-xs font-semibold text-[var(--ball)] opacity-0 transition-opacity group-hover:opacity-100">Regarder</span>
                  </a>
                ))}
              </div>
            )}
          </section>

          {/* Parcours */}
          <section className="card-court p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><CalendarDays size={17} className="text-[var(--ball)]" /> Parcours & expériences</h2>
            <div className="space-y-4">
              {player.experience.map((x, i) => (
                <div key={i} className="relative border-l-2 border-[var(--ball)]/40 pl-4">
                  <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-[var(--ball)] bg-background" />
                  <p className="text-sm font-bold">{x.team}</p>
                  <p className="text-xs text-[var(--ball)]">{x.years}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{x.note}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Objectifs & disponibilité</h2>
            <div className="space-y-4 text-sm">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Objectifs</p>
                <div className="flex flex-wrap gap-1.5">{player.goals.map(g => <span key={g} className="chip border-[var(--ball)]/40 bg-[color-mix(in_oklch,var(--ball)_10%,transparent)] text-[var(--ball)]"><Target size={10} /> {g}</span>)}</div>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Zones géographiques visées</p>
                <div className="flex flex-wrap gap-1.5">{player.targetZones.map(z => <span key={z} className="chip border-border bg-muted text-muted-foreground"><MapPin size={10} /> {z}</span>)}</div>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                <span className="text-muted-foreground">Disponibilité</span>
                <span className="font-semibold">{player.availability}</span>
              </div>
              {player.wingspan && (
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <span className="text-muted-foreground">Envergure / Prise</span>
                  <span className="font-semibold tnum">{player.wingspan} cm / {player.verticalReach} cm</span>
                </div>
              )}
            </div>
          </section>

          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Références d'entraîneurs</h2>
            {player.references.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune référence renseignée.</p>
            ) : (
              <div className="space-y-3">
                {player.references.map(r => (
                  <div key={r.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ball)_15%,transparent)] font-display text-xs font-bold text-[var(--ball)]">
                      {r.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.role} · {r.org}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Contact : {r.verified ? r.contact : 'vérification en cours'}</p>
                    </div>
                    {r.verified && <BadgeCheck className="ml-auto h-4 w-4 shrink-0 text-[var(--ball)]" />}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Transparence du profil</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="mb-1.5 flex justify-between"><span className="text-muted-foreground">Profil complété</span><span className="tnum font-semibold">{Math.min(98, 55 + player.stats.length * 15 + player.videos.length * 12 + player.references.length * 8)}%</span></div>
                <ProgressBar value={Math.min(98, 55 + player.stats.length * 15 + player.videos.length * 12 + player.references.length * 8)} />
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Visibilité actuelle : <strong className="text-foreground">{player.visibility === 'public' ? 'Public' : player.visibility === 'members' ? 'Membres connectés' : 'Privé'}</strong>.
                {player.isMinor && ' Les coordonnées de ce mineur ne sont partagées qu\u2019après consentement du représentant légal.'}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Opportunités compatibles */}
      <section className="mt-10">
        <SectionHead eyebrow="Pour aller plus loin" title="Opportunités ouvertes compatibles" />
        <div className="grid gap-4 md:grid-cols-3">
          {opportunities.filter(o => o.status === 'Ouverte' && (o.position === player.position || o.position === 'Tous postes')).slice(0, 3).map(o => (
            <div key={o.id} className="card-court p-5">
              <div className="mb-2 flex items-center justify-between"><span className="chip border-[var(--ball)]/40 text-[var(--ball)]">{o.type}</span><span className="text-[11px] text-muted-foreground">{o.deadline}</span></div>
              <h3 className="font-display text-base font-bold">{o.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{o.org} · {o.city}</p>
              <div className="mt-3 flex gap-2">
                <button onClick={() => navigate(`/opportunites/${o.id}`)} className="btn-ghosty flex-1 !py-2 text-xs">Détails</button>
                {role === 'player' && loggedIn && (
                  <button onClick={() => { setApplyOpp(o.id); setApplyOpen(true); }} className="btn-ball flex-1 !py-2 text-xs"><Send size={12} /> Postuler</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dialog candidature */}
      {applyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setApplyOpen(false)}>
          <div className="card-court w-full max-w-md !translate-y-0 p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Postuler à l'opportunité</h3>
              <button onClick={() => setApplyOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">Votre profil vérifié sera transmis avec votre message de motivation.</p>
            <select value={applyOpp} onChange={e => setApplyOpp(e.target.value)} className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option value="">Choisir une opportunité…</option>
              {opportunities.filter(o => o.status === 'Ouverte').map(o => <option key={o.id} value={o.id}>{o.title} — {o.org}</option>)}
            </select>
            <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={4} placeholder="Quelques lignes sur votre profil et votre motivation…"
              className="mb-4 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-[var(--ball)]" />
            <div className="flex gap-2">
              <button onClick={() => setApplyOpen(false)} className="btn-ghosty flex-1">Annuler</button>
              <button
                onClick={() => { if (!applyOpp || motivation.trim().length < 10) return; applyToOpportunity(applyOpp, motivation); setApplyOpen(false); setMotivation(''); }}
                className="btn-ball flex-1" disabled={!applyOpp || motivation.trim().length < 10}
              >
                Envoyer la candidature
              </button>
            </div>
            {!applyOpp && <p className="mt-2 text-xs text-destructive">Choisissez d'abord une opportunité.</p>}
            {applyOpp && motivation.trim().length < 10 && <p className="mt-2 text-xs text-muted-foreground">Message de motivation : 10 caractères minimum.</p>}
          </div>
        </div>
      )}

      {/* Dialog message */}
      {msgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setMsgOpen(false)}>
          <div className="card-court w-full max-w-md !translate-y-0 p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Message à {player.name}</h3>
              <button onClick={() => setMsgOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            {player.isMinor && (
              <p className="mb-3 rounded-lg border border-[var(--amber-glow)]/40 bg-[color-mix(in_oklch,var(--amber-glow)_10%,transparent)] p-3 text-xs text-[var(--amber-glow)]">
                Joueur mineur : votre message sera transmis au représentant légal, qui donnera ou non son accord. Les coordonnées restent masquées.
              </p>
            )}
            <input defaultValue={`Intérêt pour votre profil — ${player.position}`} className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
            <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={4} placeholder="Votre message…" className="mb-4 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-[var(--ball)]" />
            <div className="flex gap-2">
              <button onClick={() => setMsgOpen(false)} className="btn-ghosty flex-1">Annuler</button>
              <button onClick={() => { if (msgBody.trim().length < 5) return; startConversation(player.name, `Intérêt pour votre profil — ${player.position}`, msgBody); setMsgOpen(false); setMsgBody(''); }} className="btn-ball flex-1">Envoyer</button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog signalement */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setReportOpen(false)}>
          <div className="card-court w-full max-w-md !translate-y-0 p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Signaler ce profil</h3>
              <button onClick={() => setReportOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <select id="report-reason" className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm">
              <option>Statistiques suspectes</option><option>Usurpation d'identité</option><option>Contenu inapproprié</option><option>Comportement abusif</option>
            </select>
            <textarea id="report-details" rows={3} placeholder="Décrivez précisément le problème…" className="mb-4 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-[var(--ball)]" />
            <div className="flex gap-2">
              <button onClick={() => setReportOpen(false)} className="btn-ghosty flex-1">Annuler</button>
              <button onClick={() => { submitReport(player.name, (document.getElementById('report-reason') as HTMLSelectElement).value, (document.getElementById('report-details') as HTMLTextAreaElement).value || 'Sans détails'); setReportOpen(false); }} className="btn-ball flex-1">Transmettre</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
