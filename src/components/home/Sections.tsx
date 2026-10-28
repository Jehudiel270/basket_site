'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search, ArrowRight, ArrowUpRight, MapPin, Users, Trophy, Target, Building2,
  Radar, CalendarDays, ShieldCheck, User, HeartHandshake, Crown, Headset, Flag,
  Star, Quote, Check, Sparkles, Play,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { useT } from '@/lib/i18n';
import { PlayerCard, SectionHead } from '@/components/common/Bits';
import { POSITIONS, COUNTRIES } from '@/lib/demo-data';
import { cn } from '@/lib/utils';

/* ── Reveal au scroll (IntersectionObserver) ── */
export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('in'); obs.disconnect(); } },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn('reveal', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Compteur animé ── */
export function CountUp({ to, suffix = '', duration = 1600 }: { to: number; suffix?: string; duration?: number }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [to, duration]);
  return <span ref={ref} className="tnum">{val.toLocaleString('fr-FR')}{suffix}</span>;
}

/* ── Marquee des structures ── */
export function Marquee() {
  const items = ['Cotonou Hoopers', 'Académie Élan', 'Lomé Stars', 'Dakar Horizon', 'Bénin 3x3', 'Ouaga Force', 'Douala Central', 'Conakry Lab', 'FIBA 3x3 régional', 'Championnat Littoral'];
  return (
    <div className="border-y border-border bg-[var(--court)] py-4 marquee-mask overflow-hidden">
      <div className="flex w-max animate-marquee gap-10">
        {[...items, ...items].map((t, i) => (
          <span key={i} className="flex items-center gap-3 whitespace-nowrap font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--ball)]" /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Moteur de découverte ── */
export function DiscoveryBar() {
  const t = useT();
  const [position, setPosition] = useState('Tous les postes');
  const [country, setCountry] = useState('Tous les pays');
  const [query, setQuery] = useState('');
  const go = () => {
    sessionStorage.setItem('courtlink-search', JSON.stringify({ position, country, query }));
    navigate('/joueurs');
  };
  return (
    <Reveal>
      <div className="mx-auto -mt-10 max-w-4xl rounded-2xl border border-border bg-card/90 p-4 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-5">
        <p className="mb-3 flex items-center gap-2 font-display text-sm font-bold">
          <Sparkles size={15} className="text-[var(--ball)]" /> {t('discover.title')}
        </p>
        <div className="grid gap-2.5 md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder={t('discover.placeholder')}
              className="h-11 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--ball)]"
            />
          </div>
          <select value={position} onChange={e => setPosition(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" aria-label={t('discover.position')}>
            <option>{t('discover.allPositions')}</option>
            {POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" aria-label={t('discover.country')}>
            <option>{t('discover.allCountries')}</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={go} className="btn-ball h-11">{t('discover.search')}</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Pivots U21', 'Meneuses rapides', 'Shooters 3P', 'Ailiers défensifs'].map(t => (
            <button key={t} onClick={() => { sessionStorage.setItem('courtlink-search', JSON.stringify({ position: 'Tous les postes', country: 'Tous les pays', query: t.split(' ')[0] })); navigate('/joueurs'); }}
              className="chip border-border bg-muted/60 text-muted-foreground transition-colors hover:border-[var(--ball)] hover:text-[var(--ball)]">
              #{t}
            </button>
          ))}
        </div>
      </div>
    </Reveal>
  );
}

/* ── Bandeau de chiffres ── */
export function StatsBand() {
  const t = useT();
  const items = [
    { icon: User, to: 1240, suffix: '', label: t('stats.registered') },
    { icon: Building2, to: 86, suffix: '', label: t('stats.clubs') },
    { icon: Target, to: 312, suffix: '', label: t('stats.opportunities') },
    { icon: MapPin, to: 10, suffix: '', label: t('stats.countries') },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 80}>
            <div className="card-court flex items-center gap-4 p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] text-[var(--ball)]">
                <it.icon size={22} />
              </span>
              <div>
                <div className="font-display text-3xl font-black"><CountUp to={it.to} suffix={it.suffix} /></div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{it.label}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Joueurs en vedette ── */
export function FeaturedPlayers() {
  const t = useT();
  const { players } = useCourtLink();
  const featured = [...players].sort((a, b) => b.rating - a.rating).slice(0, 4);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-8 md:px-6">
      <Reveal>
        <SectionHead
          eyebrow={t('featured.eyebrow')}
          title={t('featured.title')}
          sub={t('featured.sub')}
          right={<button onClick={() => navigate('/joueurs')} className="btn-ghosty">{t('featured.all')} <ArrowUpRight size={15} /></button>}
        />
      </Reveal>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((p, i) => (
          <Reveal key={p.id} delay={i * 90}>
            <PlayerCard player={p} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Opportunités récentes ── */
export function RecentOpportunities() {
  const t = useT();
  const { opportunities } = useCourtLink();
  const open = opportunities.filter(o => o.status === 'Ouverte').slice(0, 3);
  return (
    <section className="border-y border-border bg-[var(--court)]/60 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHead
            eyebrow={t('opps.eyebrow')}
            title={t('opps.title')}
            sub={t('opps.sub')}
            right={<button onClick={() => navigate('/opportunites')} className="btn-ghosty">{t('opps.all')} <ArrowUpRight size={15} /></button>}
          />
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {open.map((o, i) => (
            <Reveal key={o.id} delay={i * 90}>
              <button
                onClick={() => navigate(`/opportunites/${o.id}`)}
                className="card-court group w-full p-5 text-left"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="chip border-[var(--ball)]/40 bg-[color-mix(in_oklch,var(--ball)_12%,transparent)] text-[var(--ball)]">{o.type}</span>
                  <span className="text-[11px] text-muted-foreground">{o.deadline}</span>
                </div>
                <h3 className="font-display text-lg font-bold leading-snug group-hover:text-[var(--ball)]">{o.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{o.org} · {o.city}, {o.country}</p>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                  <span>{o.position} · {o.ageRange}</span>
                  <span className="tnum">{o.applicants} {t('opps.candidates')}</span>
                </div>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Comment ça marche ── */
export function HowItWorks() {
  const t = useT();
  const cols = [
    {
      icon: User, title: t('how.players'), hash: '/fonctionnement-joueurs',
      steps: [t('how.step.p1'), t('how.step.p2'), t('how.step.p3'), t('how.step.p4')],
    },
    {
      icon: Radar, title: t('how.clubs'), hash: '/fonctionnement-clubs',
      steps: [t('how.step.c1'), t('how.step.c2'), t('how.step.c3'), t('how.step.c4')],
    },
    {
      icon: CalendarDays, title: t('how.organizers'), hash: '/inscription',
      steps: [t('how.step.o1'), t('how.step.o2'), t('how.step.o3'), t('how.step.o4')],
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <Reveal>
        <SectionHead eyebrow={t('how.eyebrow')} title={t('how.title')} sub={t('how.sub')} />
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {cols.map((c, i) => (
          <Reveal key={c.title} delay={i * 100}>
            <div className="card-court flex h-full flex-col p-6">
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] text-[var(--ball)]">
                <c.icon size={21} />
              </span>
              <h3 className="font-display text-xl font-bold">{c.title}</h3>
              <ol className="mt-4 flex-1 space-y-3">
                {c.steps.map((s, j) => (
                  <li key={s} className="flex gap-3 text-sm text-muted-foreground">
                    <span className="font-score text-xs text-[var(--ball)]">0{j + 1}</span> {s}
                  </li>
                ))}
              </ol>
              <button onClick={() => navigate(c.hash)} className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[var(--ball)] hover:gap-2 transition-all">
                {t('how.discover')} <ArrowRight size={15} />
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Rôles ── */
/* Les libellés passent par le dictionnaire i18n */
const ROLES = [
  { icon: User, label: 'role.player', desc: 'role.player.desc' },
  { icon: HeartHandshake, label: 'role.guardian', desc: 'role.guardian.desc' },
  { icon: Building2, label: 'role.club', desc: 'role.club.desc' },
  { icon: Radar, label: 'role.scout', desc: 'role.scout.desc' },
  { icon: CalendarDays, label: 'role.organizer', desc: 'role.organizer.desc' },
  { icon: ShieldCheck, label: 'role.moderator', desc: 'role.moderator.desc' },
  { icon: Headset, label: 'role.support', desc: 'role.support.desc' },
  { icon: Crown, label: 'role.admin', desc: 'role.admin.desc' },
];
export function RolesGrid() {
  const t = useT();
  return (
    <section className="border-y border-border bg-[var(--court)]/60 py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHead
            eyebrow={t('roles.eyebrow')}
            title={t('roles.title')}
            sub={t('roles.sub')}
          />
        </Reveal>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {ROLES.map((r, i) => (
            <Reveal key={r.label} delay={(i % 4) * 70}>
              <button onClick={() => navigate('/connexion')} className="card-court group w-full p-5 text-left">
                <r.icon size={20} className="mb-3 text-[var(--ball)] transition-transform group-hover:scale-110" />
                <h3 className="font-display text-sm font-bold">{t(r.label)}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{t(r.desc)}</p>
              </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Témoignages ── */
export function Testimonials() {
  const t = useT();
  const quotes = [
    { text: 'En trois semaines, nous avons reçu des candidatures de pivots vérifiés de trois pays. Le pipeline nous a fait gagner un temps fou.', name: 'Arnaud Koffi', role: 'Coach principal · Cotonou Hoopers' },
    { text: 'Mon profil dit exactement ce que je suis : mes stats, mes vidéos, ma scolarité. Un club de Lomé m\u2019a contactée directement.', name: 'Nadège Agbodjan', role: 'Arrière · Lomé Stars' },
    { text: 'Les rapports de scouting structurés remplacent mes tableurs. Je compare cinq profils en dix minutes, notes privées incluses.', name: 'Mamadou Bamba', role: 'Scout indépendant certifié' },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <Reveal>
        <SectionHead eyebrow={t('testi.eyebrow')} title={t('testi.title')} />
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {quotes.map((q, i) => (
          <Reveal key={q.name} delay={i * 100}>
            <figure className="card-court h-full p-6">
              <Quote size={22} className="mb-3 text-[var(--ball)]" />
              <blockquote className="text-sm leading-relaxed text-foreground/90">{q.text}</blockquote>
              <figcaption className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ball)_15%,transparent)] font-display text-sm font-bold text-[var(--ball)]">
                  {q.name.split(' ').map(x => x[0]).join('')}
                </span>
                <div>
                  <p className="text-sm font-semibold">{q.name}</p>
                  <p className="text-xs text-muted-foreground">{q.role}</p>
                </div>
                <span className="ml-auto flex">{[...Array(5)].map((_, s) => <Star key={s} size={11} className="fill-[var(--ball)] text-[var(--ball)]" />)}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── Aperçu tarifs ── */
export function PricingTeaser() {
  const t = useT();
  const { plans } = useCourtLink();
  const three = plans.filter(p => ['premium', 'clubpro', 'academy'].includes(p.id));
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
      <Reveal>
        <SectionHead
          eyebrow={t('pricing.eyebrow')}
          title={t('pricing.title')}
          sub={t('pricing.sub')}
          right={<button onClick={() => navigate('/tarifs')} className="btn-ghosty">{t('pricing.compare')} <ArrowUpRight size={15} /></button>}
        />
      </Reveal>
      <div className="grid gap-5 md:grid-cols-3">
        {three.map((p, i) => (
          <Reveal key={p.id} delay={i * 100}>
            <div className={cn('card-court h-full p-6', p.highlighted && 'border-[var(--ball)]/50 shadow-[0_16px_50px_-16px_color-mix(in_oklch,var(--ball)_35%,transparent)]')}>
              {p.highlighted && <span className="chip mb-3 border-[var(--ball)] bg-[var(--ball)] text-black">{t('pricing.mostChosen')}</span>}
              <h3 className="font-display text-lg font-bold">{p.name}</h3>
              <p className="text-xs text-muted-foreground">{p.audience}</p>
              <p className="mt-4 font-display text-3xl font-black tnum">
                {p.price === 0 ? t('pricing.free') : `${p.price.toLocaleString('fr-FR')} F`}
                {p.price > 0 && <span className="text-sm font-medium text-muted-foreground"> /{p.period}</span>}
              </p>
              <ul className="mt-4 space-y-2">
                {p.features.slice(0, 4).map(f => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground"><Check size={14} className="mt-0.5 shrink-0 text-[var(--ball)]" />{f}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ── CTA finale ── */
export function CTASection() {
  const t = useT();
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl px-4 pb-20 md:px-6">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-[color-mix(in_oklch,var(--ball)_35%,transparent)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/action-dunk.jpg" alt="Joueur de basketball en dunk" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-gradient-to-r from-[rgba(10,9,8,0.94)] via-[rgba(10,9,8,0.75)] to-[rgba(10,9,8,0.35)]" />
          <div className="relative z-10 grid gap-8 p-8 md:grid-cols-2 md:p-14">
            <div>
              <h2 className="font-display text-3xl font-black leading-tight text-white md:text-4xl">
                {t('cta.title1')}
                <br /><span className="text-gradient-ball">{t('cta.title2')}</span>
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
                {t('cta.sub')}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <button onClick={() => navigate('/inscription')} className="btn-ball !px-6 !py-3">{t('cta.register')} <ArrowRight size={16} /></button>
                <button onClick={() => navigate('/demo')} className="btn-ghosty border-white/25 text-white hover:!text-[var(--ball)]">
                  <Play size={15} /> {t('cta.demo')}
                </button>
              </div>
            </div>
            <div className="grid content-center gap-3">
              {[
                { icon: ShieldCheck, t: t('cta.trust1.t'), d: t('cta.trust1.d') },
                { icon: Trophy, t: t('cta.trust2.t'), d: t('cta.trust2.d') },
                { icon: Users, t: t('cta.trust3.t'), d: t('cta.trust3.d') },
              ].map(x => (
                <div key={x.t} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm">
                  <x.icon size={18} className="mt-0.5 shrink-0 text-[var(--ball)]" />
                  <div>
                    <p className="text-sm font-bold text-white">{x.t}</p>
                    <p className="text-xs text-white/60">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
