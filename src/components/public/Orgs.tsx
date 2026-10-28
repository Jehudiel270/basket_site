'use client';

import { useState } from 'react';
import {
  Search, MapPin, ChevronLeft, Building2, Users, Trophy, CalendarDays,
  BadgeCheck, Star, Mail, X, ArrowUpRight,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { EmptyState, VerifiedBadge, SectionHead } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

export function OrgsDirectory() {
  const { organizations, followedClubs, toggleFollow } = useCourtLink();
  const [q, setQ] = useState('');
  const [type, setType] = useState('Tous les types');
  const [country, setCountry] = useState('Tous les pays');

  const results = organizations.filter(o =>
    (!q || `${o.name} ${o.city} ${o.country}`.toLowerCase().includes(q.toLowerCase())) &&
    (type === 'Tous les types' || o.type === type) &&
    (country === 'Tous les pays' || o.country === country)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Clubs & académies</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Structures de démonstration : statut de vérification, effectifs, divisions et staff. Seules les structures vérifiées peuvent publier des opportunités.
      </p>

      <div className="card-court mb-6 mt-6 grid gap-2.5 !translate-y-0 !hover:transform-none p-4 md:grid-cols-[1.5fr_1fr_1fr]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Nom de structure, ville…" className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]" />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
          <option>Tous les types</option>{['Club', 'Académie', 'Organisation'].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
          <option>Tous les pays</option>{['Bénin', "Côte d'Ivoire", 'Togo', 'Sénégal', 'Burkina Faso', 'Cameroun', 'Guinée'].map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {results.length === 0 ? (
        <EmptyState title="Aucune structure trouvée" hint="Modifiez la recherche ou choisissez « Tous les pays »." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((o, i) => (
            <article key={o.id} className="card-court group cursor-pointer overflow-hidden" style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => navigate(`/organisations/${o.id}`)} role="link" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate(`/organisations/${o.id}`)}>
              <div className="relative h-40 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={o.image} alt={o.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.9)] to-transparent" />
                <div className="absolute left-3 top-3"><VerifiedBadge verified={o.verified && !o.suspends} className="backdrop-blur-sm" /></div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-display text-lg font-bold text-white">{o.name}</h3>
                  <p className="text-xs text-white/70">{o.type} · {o.city}, {o.country} · depuis {o.founded}</p>
                </div>
              </div>
              <div className="p-4">
                <p className="line-clamp-2 min-h-10 text-xs leading-relaxed text-muted-foreground">{o.description}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Users size={12} /> {o.playersCount} joueurs</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays size={12} /> {o.divisions.length} divisions</span>
                  {o.verificationStatus !== 'vérifiée' && <span className="text-[var(--amber-glow)]">{o.verificationStatus}</span>}
                </div>
                {o.suspends && <p className="mt-2 text-xs font-semibold text-destructive">Activité suspendue par l'administration.</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function OrgProfile({ id }: { id: string }) {
  const { organizations, players, opportunities, events, followedClubs, toggleFollow, role, loggedIn, startConversation } = useCourtLink();
  const org = organizations.find(o => o.id === id);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgBody, setMsgBody] = useState('');

  if (!org) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState title="Structure introuvable" hint="Cette organisation n'existe pas ou a été retirée."
          action={<button onClick={() => navigate('/organisations')} className="btn-ball">Retour à l'annuaire</button>} />
      </div>
    );
  }

  const roster = players.filter(p => p.club === org.name).slice(0, 6);
  const opps = opportunities.filter(o => o.orgId === org.id && o.status !== 'Brouillon');
  const orgEvents = events.filter(e => e.organizerId === org.id);
  const followed = followedClubs.includes(org.id);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/organisations')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Clubs & académies</button>

      <div className="card-court overflow-hidden">
        <div className="relative h-52 md:h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={org.image} alt={org.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.96)] via-[rgba(10,10,12,0.45)] to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 md:left-8">
            <div>
              <div className="mb-2 flex gap-2">
                <VerifiedBadge verified={org.verified} />
                <span className="chip border-border bg-black/40 text-white/80 backdrop-blur-sm">{org.type}</span>
                {org.verificationStatus !== 'vérifiée' && <span className="chip border-[var(--amber-glow)]/50 text-[var(--amber-glow)]">{org.verificationStatus}</span>}
              </div>
              <h1 className="font-display text-3xl font-black text-white md:text-4xl">{org.name}</h1>
              <p className="mt-1 text-sm text-white/75"><MapPin size={13} className="inline" /> {org.city}, {org.country} · fondée en {org.founded}</p>
            </div>
            <div className="flex gap-2">
              {loggedIn ? (
                <>
                  <button onClick={() => toggleFollow(org.id)} className={cn('btn-ghosty !py-2 text-xs', followed && 'border-[var(--ball)] text-[var(--ball)]')}>
                    <Star size={14} className={followed ? 'fill-[var(--ball)]' : ''} /> {followed ? 'Suivi' : 'Suivre'}
                  </button>
                  <button onClick={() => setMsgOpen(true)} className="btn-ball !py-2 text-xs"><Mail size={14} /> Contacter</button>
                </>
              ) : (
                <button onClick={() => navigate('/connexion')} className="btn-ball !py-2 text-xs">Connectez-vous pour suivre</button>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-border p-5 md:grid-cols-4">
          <div><p className="font-display text-2xl font-black tnum text-[var(--ball)]">{org.playersCount}</p><p className="text-xs uppercase tracking-wider text-muted-foreground">Joueurs licenciés</p></div>
          <div><p className="font-display text-2xl font-black tnum">{org.members}</p><p className="text-xs uppercase tracking-wider text-muted-foreground">Membres du staff</p></div>
          <div><p className="font-display text-2xl font-black tnum">{org.divisions.length}</p><p className="text-xs uppercase tracking-wider text-muted-foreground">Divisions</p></div>
          <div><p className="font-display text-2xl font-black tnum">{org.achievements.length}</p><p className="text-xs uppercase tracking-wider text-muted-foreground">Distinctions</p></div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Building2 size={17} className="text-[var(--ball)]" /> Présentation</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{org.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {org.divisions.map(d => <span key={d} className="chip border-[var(--ball)]/40 bg-[color-mix(in_oklch,var(--ball)_10%,transparent)] text-[var(--ball)]">{d}</span>)}
            </div>
            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Palmarès</p>
              {org.achievements.map(a => <p key={a} className="flex items-center gap-2 text-sm"><Trophy size={13} className="text-[var(--amber-glow)]" /> {a}</p>)}
            </div>
          </section>

          <section className="card-court p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Users size={17} className="text-[var(--ball)]" /> Joueurs du club sur CourtLink</h2>
            {roster.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun joueur rattaché pour le moment.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {roster.map(p => (
                  <button key={p.id} onClick={() => navigate(`/joueurs/${p.id}`)} className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-[var(--ball)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photo} alt={p.name} className="h-10 w-10 rounded-full object-cover object-top" loading="lazy" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.position} · {p.height} cm · indice {p.rating}</p>
                    </div>
                    <ArrowUpRight size={14} className="text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {opps.length > 0 && (
            <section className="card-court p-6">
              <h2 className="mb-4 font-display text-lg font-bold">Opportunités publiées</h2>
              <div className="space-y-3">
                {opps.map(o => (
                  <button key={o.id} onClick={() => navigate(`/opportunites/${o.id}`)} className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-[var(--ball)]">
                    <div>
                      <p className="text-sm font-semibold">{o.title}</p>
                      <p className="text-xs text-muted-foreground">{o.type} · {o.position} · échéance {o.deadline}</p>
                    </div>
                    <span className={cn('chip', o.status === 'Ouverte' ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{o.status}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Staff technique</h2>
            <div className="space-y-3">
              {org.staff.map(s => (
                <div key={s.name} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ball)_15%,transparent)] font-display text-xs font-bold text-[var(--ball)]">
                    {s.name.split(' ').map(x => x[0]).slice(0, 2).join('')}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.role} · {s.license}</p>
                  </div>
                  <BadgeCheck size={15} className="ml-auto text-[var(--ball)]" />
                </div>
              ))}
            </div>
          </section>

          {orgEvents.length > 0 && (
            <section className="card-court p-6">
              <h2 className="mb-4 font-display text-lg font-bold">Événements organisés</h2>
              <div className="space-y-3">
                {orgEvents.map(e => (
                  <button key={e.id} onClick={() => navigate(`/evenements/${e.id}`)} className="flex w-full items-center justify-between rounded-lg border border-border p-3 text-left hover:border-[var(--ball)]">
                    <div>
                      <p className="text-sm font-semibold">{e.title}</p>
                      <p className="text-xs text-muted-foreground">{e.date} · {e.city}</p>
                    </div>
                    <span className="chip border-border text-muted-foreground">{e.kind}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {msgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setMsgOpen(false)}>
          <div className="card-court w-full max-w-md !translate-y-0 p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Message à {org.name}</h3>
              <button onClick={() => setMsgOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <input defaultValue={`Contact — ${role === 'player' ? 'Joueur' : 'Partenaire'}`} className="mb-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm" />
            <textarea value={msgBody} onChange={e => setMsgBody(e.target.value)} rows={4} placeholder="Votre message…" className="mb-4 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-[var(--ball)]" />
            <div className="flex gap-2">
              <button onClick={() => setMsgOpen(false)} className="btn-ghosty flex-1">Annuler</button>
              <button onClick={() => { if (msgBody.trim().length < 5) return; startConversation(org.name, `Contact — ${org.name}`, msgBody); setMsgOpen(false); setMsgBody(''); }} className="btn-ball flex-1">Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
