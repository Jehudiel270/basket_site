'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search, ArrowUpRight, ArrowRight,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { PlayerCard } from '@/components/common/Bits';
import { POSITIONS, COUNTRIES } from '@/lib/demo-data';
import { useT } from '@/lib/i18n';

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
    <div ref={ref} className={`reveal ${className ?? ''}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ── Ticker façon retransmission : stats réelles du store, en boucle ── */
export function Ticker() {
  const { players, opportunities } = useCourtLink();
  const items = useMemo(() => {
    const statLines = [...players]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6)
      .map(p => {
        const s = p.stats[0];
        const nom = p.name.split(' ');
        const short = `${nom[0].toUpperCase()} ${nom[1]?.[0] ?? ''}.`.replace(' .', '.');
        return s ? `${short} — ${s.ppg} PTS / ${s.rpg} REB / ${s.apg} PAS` : `${short} — ${p.position}`;
      });
    const deadlines = opportunities
      .filter(o => o.status === 'Ouverte')
      .slice(0, 4)
      .map(o => `CLÔTURE ${o.deadline} — ${o.title.toUpperCase()}`);
    return [...statLines, ...deadlines];
  }, [players, opportunities]);

  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-border bg-[var(--court)] py-2.5 marquee-mask" aria-hidden>
      <div className="animate-marquee flex w-max items-center gap-10">
        {loop.map((it, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="font-mono2 text-[11px] uppercase tracking-[0.14em] on-court-muted">{it}</span>
            <span className="h-1.5 w-1.5 rotate-45 bg-[var(--ball)]" />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ── Console de recherche — bureau de scouting ── */
export function DiscoveryBar() {
  const t = useT();
  const [position, setPosition] = useState('Tous les postes');
  const [country, setCountry] = useState('Tous les pays');
  const [query, setQuery] = useState('');
  const go = () => {
    sessionStorage.setItem('courtlink-search', JSON.stringify({ position, country, query }));
    navigate('/joueurs');
  };
  const cell = 'h-12 w-full rounded-none border-0 bg-transparent px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:bg-accent/30';
  return (
    <Reveal>
      <div className="border border-border bg-card">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
          <p className="flex items-center gap-2.5 font-mono2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-1.5 w-1.5 bg-[var(--ball)]" />
            {t('discover.kicker')}
          </p>
          <span className="font-score text-[9px] tracking-[0.3em] text-muted-foreground/50">SCOUTING&nbsp;DESK</span>
        </div>
        <div className="grid gap-px bg-border md:grid-cols-[1.4fr_1fr_1fr_auto]">
          <div className="relative bg-card">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go()}
              placeholder={t('discover.placeholder')}
              className={`${cell} pl-10`}
            />
          </div>
          <div className="bg-card">
            <select value={position} onChange={e => setPosition(e.target.value)} className={cell} aria-label={t('discover.position')}>
              <option>{t('discover.allPositions')}</option>
              {POSITIONS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="bg-card">
            <select value={country} onChange={e => setCountry(e.target.value)} className={cell} aria-label={t('discover.country')}>
              <option>{t('discover.allCountries')}</option>
              {COUNTRIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={go}
            className="flex h-12 items-center justify-center gap-2 bg-[var(--ball)] px-7 text-[12px] font-bold uppercase tracking-[0.14em] text-black transition-colors hover:bg-[var(--ball-deep)] hover:text-white"
          >
            {t('discover.search')} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Joueurs en vedette — une vedette + trois compactes ── */
export function FeaturedPlayers() {
  const t = useT();
  const { players } = useCourtLink();
  const featured = [...players].sort((a, b) => b.rating - a.rating).slice(0, 4);
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 pt-14 md:px-6">
      <div className="mb-14">
        <DiscoveryBar />
      </div>
      <Reveal>
        <SectionHead
          num="01"
          eyebrow={t('featured.eyebrow')}
          title={t('featured.title')}
          sub={t('featured.sub')}
          right={<button onClick={() => navigate('/joueurs')} className="btn-ghosty">{t('featured.all')} <ArrowUpRight size={15} /></button>}
        />
      </Reveal>
      <div className="grid gap-5 lg:grid-cols-12">
        {featured[0] && (
          <Reveal className="lg:col-span-6">
            <PlayerCard player={featured[0]} lead index={0} />
          </Reveal>
        )}
        <div className="grid gap-5 sm:grid-cols-3 lg:col-span-6 lg:content-start">
          {featured.slice(1, 4).map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <PlayerCard player={p} index={i + 1} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Opportunités ouvertes — liste éditoriale numérotée ── */
export function RecentOpportunities() {
  const t = useT();
  const { opportunities } = useCourtLink();
  const open = opportunities.filter(o => o.status === 'Ouverte').slice(0, 5);
  return (
    <section className="border-t border-border bg-[var(--court)]/40 py-20">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <Reveal>
          <SectionHead
            num="02"
            eyebrow={t('opps.eyebrow')}
            title={t('opps.title')}
            sub={t('opps.sub')}
            right={<button onClick={() => navigate('/opportunites')} className="btn-ghosty">{t('opps.all')} <ArrowUpRight size={15} /></button>}
          />
        </Reveal>
        <Reveal delay={80}>
          <ul className="divide-y divide-border border-y-2 border-foreground/70">
            {open.map((o, i) => (
              <li key={o.id}>
                <button
                  onClick={() => navigate(`/opportunites/${o.id}`)}
                  className="group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-x-4 gap-y-1 px-2 py-5 text-left transition-colors hover:bg-accent/40 md:grid-cols-[3rem_1fr_auto_auto_auto] md:gap-x-8 md:px-3"
                >
                  <span className="font-score text-sm text-muted-foreground/50 tnum">0{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base font-bold group-hover:text-[var(--ball)] md:text-lg">{o.title}</span>
                    <span className="mt-0.5 block truncate font-mono2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
                      {o.org} · {o.city}, {o.country} · {o.position} · {o.ageRange}
                    </span>
                  </span>
                  <span className="hidden whitespace-nowrap font-mono2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground md:block">
                    {t('opps.candidates')} · {o.applicants}
                  </span>
                  <span className="hidden whitespace-nowrap font-mono2 text-[11px] uppercase tracking-[0.08em] text-muted-foreground md:block tnum">{o.deadline}</span>
                  <span className="chip border-[var(--ball)]/35 bg-[color-mix(in_oklch,var(--ball)_10%,transparent)] text-[var(--ball)]">{o.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ── CTA de clôture — affiche plein cadre ── */
export function ClosingCTA() {
  const t = useT();
  return (
    <section className="grain relative overflow-hidden bg-[var(--court)]">
      <div className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--ball)_16%,transparent),transparent_65%)] blur-2xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-6 md:py-32">
        <p className="mb-6 flex items-baseline gap-3 font-mono2 text-[11px] uppercase tracking-[0.22em] text-[var(--ball)]">
          <span className="font-score">03</span>
          <span className="h-px w-10 bg-[var(--ball)]/60" />
          {t('cta.eyebrow')}
        </p>
        <h2 className="headline max-w-3xl text-4xl on-court md:text-6xl">
          {t('cta.title1')} <span className="text-[var(--ball)]">{t('cta.title2')}</span>
        </h2>
        <p className="on-court-muted mt-5 max-w-xl text-sm leading-relaxed md:text-base">{t('cta.sub')}</p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <button onClick={() => navigate('/inscription')} className="btn-ball !px-7 !py-3.5 !text-[13px]">{t('cta.register')} <ArrowRight size={16} /></button>
          <button onClick={() => navigate('/demo')} className="btn-ghosty !border-white/25 !px-7 !py-3.5 !text-[13px] on-court">{t('cta.demo')}</button>
        </div>
        <p className="on-court-faint mt-12 flex flex-wrap gap-x-2 gap-y-1 border-t border-white/10 pt-5 font-mono2 text-[10px] uppercase tracking-[0.16em]">
          <span>{t('cta.trust1.t')}</span><span className="text-[var(--ball)]">/</span>
          <span>{t('cta.trust2.t')}</span><span className="text-[var(--ball)]">/</span>
          <span>{t('cta.trust3.t')}</span>
        </p>
      </div>
      <p aria-hidden className="pointer-events-none absolute -bottom-10 right-0 hidden select-none font-score text-[10rem] leading-none text-white/[0.05] lg:block">
        COURT
      </p>
    </section>
  );
}

/* ── Titre de section — règle épaisse + numéro score ── */
function SectionHead({ num, eyebrow, title, sub, right }: { num: string; eyebrow?: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4 border-t-2 border-foreground/70 pt-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 flex items-baseline gap-3 font-mono2 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            <span className="font-score text-xs text-[var(--ball)]">{num}</span>
            {eyebrow}
          </p>
        )}
        <h2 className="headline text-2xl md:text-4xl">{title}</h2>
        {sub && <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
