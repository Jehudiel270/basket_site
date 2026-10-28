'use client';

import { useState } from 'react';
import {
  Search, MapPin, ChevronLeft, CalendarClock, Users, Send, CheckCircle2,
  Share2, Clock, X, Ticket, DollarSign, ListChecks,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { EmptyState, SectionHead } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

/* ── Liste des opportunités ── */
export function OpportunitiesPage() {
  const { opportunities, role, loggedIn, players } = useCourtLink();
  const [q, setQ] = useState('');
  const [type, setType] = useState('Tous les types');
  const [country, setCountry] = useState('Tous les pays');
  const [status, setStatus] = useState('Ouvertes');

  const types = [...new Set(opportunities.map(o => o.type))];
  const countries = [...new Set(opportunities.map(o => o.country))];
  const myApps = role === 'player' && loggedIn ? players : [];

  const results = opportunities.filter(o =>
    (!q || `${o.title} ${o.org} ${o.city} ${o.position}`.toLowerCase().includes(q.toLowerCase())) &&
    (type === 'Tous les types' || o.type === type) &&
    (country === 'Tous les pays' || o.country === country) &&
    (status === 'Tous les statuts' || o.status === (status === 'Ouvertes' ? 'Ouverte' : status))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-black md:text-4xl">Opportunités</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Contrats, essais, camps et bourses publiés par des structures vérifiées. Chaque annonce affiche ses critères, ses conditions et sa date limite.
          </p>
        </div>
        {role === 'club' && loggedIn && (
          <button onClick={() => navigate('/app/nouvelle-opportunite')} className="btn-ball">Publier une opportunité</button>
        )}
      </div>

      <div className="card-court mb-6 mt-6 grid gap-2.5 !translate-y-0 !hover:transform-none p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Titre, organisation, ville…" className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]" />
        </div>
        <select value={type} onChange={e => setType(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
          <option>Tous les types</option>{types.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
          <option>Tous les pays</option>{countries.map(c => <option key={c}>{c}</option>)}
        </select>
        <select value={status} onChange={e => setStatus(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]">
          <option>Ouvertes</option><option>Fermée</option><option>Tous les statuts</option>
        </select>
      </div>

      {results.length === 0 ? (
        <EmptyState title="Aucune opportunité trouvée" hint="Élargissez la recherche ou revenez plus tard : de nouvelles annonces arrivent chaque semaine." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {results.map((o, i) => (
            <article key={o.id} className="card-court group cursor-pointer p-5" style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate(`/opportunites/${o.id}`)} role="link" tabIndex={0} onKeyDown={e => e.key === 'Enter' && navigate(`/opportunites/${o.id}`)}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="chip border-[var(--ball)]/40 bg-[color-mix(in_oklch,var(--ball)_12%,transparent)] text-[var(--ball)]">{o.type}</span>
                <span className={cn('chip', o.status === 'Ouverte' ? 'border-green-500/40 text-green-400' : o.status === 'Brouillon' ? 'border-border text-muted-foreground' : 'border-border text-muted-foreground')}>{o.status}</span>
              </div>
              <h3 className="font-display text-lg font-bold leading-snug group-hover:text-[var(--ball)]">{o.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{o.org} · {o.city}, {o.country}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><Users size={12} /> {o.position} · {o.ageRange}</span>
                <span className="inline-flex items-center gap-1.5"><CalendarClock size={12} /> {o.deadline}</span>
                <span className="inline-flex items-center gap-1.5"><DollarSign size={12} /> {o.salary}</span>
                <span className="inline-flex items-center gap-1.5"><Send size={12} /> {o.applicants} candidats</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Détail d'une opportunité ── */
export function OpportunityDetail({ id }: { id: string }) {
  const { opportunities, applyToOpportunity, applications, role, loggedIn, players, organizations } = useCourtLink();
  const opp = opportunities.find(o => o.id === id);
  const [motivation, setMotivation] = useState('');
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(false);

  if (!opp) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState title="Opportunité introuvable" hint="Cette annonce a peut-être été archivée."
          action={<button onClick={() => navigate('/opportunites')} className="btn-ball">Voir toutes les opportunités</button>} />
      </div>
    );
  }

  const org = organizations.find(o => o.id === opp.orgId);
  const already = applications.some(a => a.opportunityId === opp.id && (a.playerId === 'p1' || a.playerName === 'Vous'));
  const candidates = players.filter(p => applications.some(a => a.opportunityId === opp.id && a.playerId === p.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/opportunites')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Opportunités</button>

      <div className="card-court p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="chip border-[var(--ball)]/40 bg-[color-mix(in_oklch,var(--ball)_12%,transparent)] text-[var(--ball)]">{opp.type}</span>
          <span className={cn('chip', opp.status === 'Ouverte' ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{opp.status}</span>
          <span className="chip border-border bg-muted text-muted-foreground"><Clock size={10} /> Clôture : {opp.deadline}</span>
        </div>
        <h1 className="font-display text-3xl font-black md:text-4xl">{opp.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {org && <button onClick={() => navigate(`/organisations/${org.id}`)} className="font-semibold text-[var(--ball)] hover:underline">{opp.org}</button>}
          {' '}· {opp.city}, {opp.country} · démarrage {opp.startDate}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: Users, l: 'Poste', v: opp.position }, { icon: ListChecks, l: 'Âge', v: opp.ageRange },
            { icon: Ticket, l: 'Places', v: String(opp.slots) }, { icon: DollarSign, l: 'Conditions', v: opp.salary },
          ].map(x => (
            <div key={x.l} className="rounded-lg border border-border bg-muted/40 p-3">
              <x.icon size={15} className="mb-1.5 text-[var(--ball)]" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{x.l}</p>
              <p className="text-sm font-bold">{x.v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-3 font-display text-lg font-bold">Description du poste</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{opp.description}</p>
          </section>
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Critères requis</h2>
            <ul className="space-y-2.5">
              {opp.requirements.map(r => (
                <li key={r} className="flex gap-2.5 text-sm"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--ball)]" /> {r}</li>
              ))}
            </ul>
          </section>
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Conditions offertes</h2>
            <ul className="space-y-2.5">
              {opp.conditions.map(r => (
                <li key={r} className="flex gap-2.5 text-sm"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--amber-glow)]" /> {r}</li>
              ))}
            </ul>
            <p className="mt-4 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              Rappel : CourtLink facilite la mise en relation. Aucune sélection, bourse ou contrat n'est garanti par la plateforme — la décision finale appartient exclusivement à l'organisation.
            </p>
          </section>
        </div>

        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Candidater</h2>
            {!loggedIn ? (
              <>
                <p className="mb-4 text-sm text-muted-foreground">Connectez-vous avec un compte joueur pour envoyer votre candidature avec votre profil vérifié.</p>
                <button onClick={() => navigate('/connexion')} className="btn-ball w-full">Se connecter</button>
              </>
            ) : role !== 'player' ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                Les candidatures sont réservées aux comptes joueurs. Connectez-vous avec le rôle « Joueur » pour postuler.
              </p>
            ) : already ? (
              <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-4 text-sm text-green-400">
                <CheckCircle2 size={16} className="mb-1" /> Votre candidature est enregistrée. Suivez son statut dans votre tableau de bord.
              </div>
            ) : opp.status !== 'Ouverte' ? (
              <p className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">Cette opportunité n'accepte plus de candidatures.</p>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">Votre profil complet (stats, vidéos, vérification) sera joint automatiquement.</p>
                <button onClick={() => setOpen(true)} className="btn-ball w-full"><Send size={15} /> Envoyer ma candidature</button>
              </>
            )}
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href).catch(() => {}); setShared(true); }} className="btn-ghosty mt-2 w-full !py-2 text-xs">
              <Share2 size={13} /> {shared ? 'Lien copié !' : 'Partager cette annonce'}
            </button>
          </section>

          <section className="card-court p-6">
            <h2 className="mb-3 font-display text-lg font-bold">Organisation</h2>
            {org && (
              <>
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={org.image} alt={org.name} className="h-12 w-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-bold">{org.name}</p>
                    <p className="text-xs text-muted-foreground">{org.type} · {org.playersCount} joueurs</p>
                  </div>
                </div>
                <button onClick={() => navigate(`/organisations/${org.id}`)} className="btn-ghosty mt-4 w-full !py-2 text-xs">Voir le profil complet</button>
              </>
            )}
          </section>

          {candidates.length > 0 && ['club', 'scout'].includes(role) && (
            <section className="card-court p-6">
              <h2 className="mb-3 font-display text-lg font-bold">Candidats visibles ({candidates.length})</h2>
              <div className="space-y-2">
                {candidates.map(c => (
                  <button key={c.id} onClick={() => navigate(`/joueurs/${c.id}`)} className="flex w-full items-center gap-2 rounded-lg border border-border p-2.5 text-left hover:border-[var(--ball)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.photo} alt={c.name} className="h-8 w-8 rounded-full object-cover object-top" />
                    <span className="text-sm font-semibold">{c.name}</span>
                    <span className="ml-auto text-xs text-muted-foreground">{c.position}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="card-court w-full max-w-md !translate-y-0 p-6" onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold">Votre motivation</h3>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <textarea value={motivation} onChange={e => setMotivation(e.target.value)} rows={5} placeholder="Pourquoi ce poste correspond à votre profil ? (10 caractères minimum)"
              className="mb-4 w-full rounded-lg border border-input bg-background p-3 text-sm outline-none focus:border-[var(--ball)]" />
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="btn-ghosty flex-1">Annuler</button>
              <button onClick={() => { if (motivation.trim().length < 10) return; applyToOpportunity(opp.id, motivation); setOpen(false); setMotivation(''); navigate('/app/candidatures'); }} className="btn-ball flex-1">Confirmer l'envoi</button>
            </div>
            {motivation.trim().length < 10 && <p className="mt-2 text-xs text-muted-foreground">10 caractères minimum pour que le club ait du contexte.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Événements ── */
export function EventsPage() {
  const { events } = useCourtLink();
  const [kind, setKind] = useState('Tous les formats');
  const kinds = [...new Set(events.map(e => e.kind))];
  const list = events.filter(e => kind === 'Tous les formats' || e.kind === kind);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <h1 className="font-display text-3xl font-black md:text-4xl">Calendrier des événements</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Combines, showcases, tournois 3x3 et clinics : les rendez-vous où se construisent les carrières. Inscrivez-vous depuis la page de chaque événement.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {['Tous les formats', ...kinds].map(k => (
          <button key={k} onClick={() => setKind(k)} className={cn('chip !px-3.5 !py-1.5', kind === k ? 'border-[var(--ball)] bg-[var(--ball)] text-black' : 'border-border bg-muted/50 text-muted-foreground hover:border-[var(--ball)]')}>{k}</button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {list.map((e, i) => (
          <article key={e.id} className="card-court group cursor-pointer overflow-hidden" onClick={() => navigate(`/evenements/${e.id}`)} role="link" tabIndex={0} onKeyDown={ev => ev.key === 'Enter' && navigate(`/evenements/${e.id}`)}>
            <div className="relative h-40 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.image} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.92)] to-transparent" />
              <div className="absolute left-3 top-3 flex gap-1.5">
                <span className="chip border-[var(--ball)]/40 bg-black/50 text-[var(--ball)] backdrop-blur-sm">{e.kind}</span>
                {e.status === 'Complet' && <span className="chip border-red-500/50 bg-black/50 text-red-300 backdrop-blur-sm">Complet</span>}
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-display text-base font-bold leading-tight text-white">{e.title}</h3>
                <p className="text-xs text-white/70">{e.date} · {e.city}, {e.country}</p>
              </div>
            </div>
            <div className="p-4">
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{e.description}</p>
              <div className="mt-3">
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span className="tnum">{e.participants}/{e.capacity} inscrits</span><span>{e.price}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--ball-deep)] to-[var(--ball)]" style={{ width: `${(e.participants / e.capacity) * 100}%` }} />
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ── Détail d'un événement ── */
export function EventDetail({ id }: { id: string }) {
  const { events, registrations, registerEvent, role, loggedIn, organizations } = useCourtLink();
  const ev = events.find(e => e.id === id);

  if (!ev) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <EmptyState title="Événement introuvable" hint="Cet événement a peut-être été annulé."
          action={<button onClick={() => navigate('/evenements')} className="btn-ball">Voir le calendrier</button>} />
      </div>
    );
  }

  const org = organizations.find(o => o.id === ev.organizerId);
  const myReg = loggedIn && registrations.some(r => r.eventId === ev.id && r.playerName === 'Sèmèvo Hountondji');
  const full = ev.participants >= ev.capacity;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/evenements')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Calendrier</button>

      <div className="card-court overflow-hidden">
        <div className="relative h-64 md:h-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ev.image} alt={ev.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.96)] via-[rgba(10,10,12,0.4)] to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 md:left-8">
            <div className="mb-2 flex flex-wrap gap-2">
              <span className="chip border-[var(--ball)]/40 bg-black/50 text-[var(--ball)] backdrop-blur-sm">{ev.kind}</span>
              <span className="chip border-white/20 bg-black/50 text-white/85 backdrop-blur-sm">{ev.ageRange}</span>
              <span className="chip border-white/20 bg-black/50 text-white/85 backdrop-blur-sm">{ev.price}</span>
            </div>
            <h1 className="font-display text-3xl font-black text-white md:text-4xl">{ev.title}</h1>
            <p className="mt-1 text-sm text-white/75"><MapPin size={13} className="inline" /> {ev.venue} · {ev.city}, {ev.country} — {ev.date}{ev.endDate !== ev.date && ` au ${ev.endDate}`}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-border p-4">
          {loggedIn && role === 'player' ? (
            myReg ? (
              <span className="inline-flex items-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-400">
                <CheckCircle2 size={16} /> Inscription enregistrée — suivez son statut dans votre espace
              </span>
            ) : full ? (
              <span className="chip border-red-500/40 px-4 py-2 text-sm text-red-300">Complet — {ev.capacity} places prises</span>
            ) : (
              <button onClick={() => registerEvent(ev.id)} className="btn-ball"><Ticket size={15} /> M'inscrire à cet événement</button>
            )
          ) : (
            <button onClick={() => navigate('/connexion')} className="btn-ball"><Ticket size={15} /> Connectez-vous pour vous inscrire</button>
          )}
          {org && (
            <button onClick={() => navigate(`/organisations/${org.id}`)} className="btn-ghosty !py-2.5 text-xs">
              Organisé par {ev.organizer}
            </button>
          )}
          <span className="ml-auto text-xs text-muted-foreground tnum">{ev.participants}/{ev.capacity} inscrits</span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-3 font-display text-lg font-bold">À propos de l'événement</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{ev.description}</p>
          </section>
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Programme</h2>
            <ol className="space-y-3">
              {ev.program.map((p, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="font-score text-xs text-[var(--ball)]">{String(i + 1).padStart(2, '0')}</span>
                  <span className="text-muted-foreground">{p}</span>
                </li>
              ))}
            </ol>
          </section>
          {ev.results && (
            <section className="card-court p-6">
              <h2 className="mb-4 font-display text-lg font-bold">Résultats</h2>
              {ev.results.map(r => (
                <div key={r.rank} className="flex items-center gap-3 border-b border-border/60 py-2 last:border-0">
                  <span className={cn('font-score text-lg tnum', r.rank === 1 ? 'text-[var(--ball)]' : 'text-muted-foreground')}>#{r.rank}</span>
                  <span className="text-sm font-semibold">{r.player}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{r.note}</span>
                </div>
              ))}
            </section>
          )}
        </div>
        <div className="space-y-6">
          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Informations pratiques</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Date</span><span className="font-semibold text-right">{ev.date}{ev.endDate !== ev.date && ` → ${ev.endDate}`}</span></div>
              <div className="flex justify-between gap-3 rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Lieu</span><span className="font-semibold text-right">{ev.venue}</span></div>
              <div className="flex justify-between gap-3 rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Participation</span><span className="font-semibold">{ev.price}</span></div>
              <div className="flex justify-between gap-3 rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Âges</span><span className="font-semibold">{ev.ageRange}</span></div>
              <div className="flex justify-between gap-3 rounded-lg bg-muted/50 p-3"><span className="text-muted-foreground">Capacité</span><span className="font-semibold tnum">{ev.capacity} places</span></div>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Les mineurs doivent fournir une autorisation parentale via un compte tuteur. Les données des participants ne sont jamais publiques sans consentement.
            </p>
          </section>
          <section className="card-court p-6">
            <h2 className="mb-3 font-display text-lg font-bold">Dernières inscriptions</h2>
            <div className="space-y-2">
              {registrations.filter(r => r.eventId === ev.id).slice(0, 4).map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                  <span>{r.playerName}</span>
                  <span className={cn('chip', r.status === 'Présent' ? 'border-green-500/40 text-green-400' : 'border-border text-muted-foreground')}>{r.status}</span>
                </div>
              ))}
              {registrations.filter(r => r.eventId === ev.id).length === 0 && <p className="text-sm text-muted-foreground">Soyez le premier inscrit !</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
