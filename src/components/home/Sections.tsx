'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Search, ArrowUpRight, ArrowRight, Sparkles, MapPin, Target, ShieldCheck,
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
      <div className="mx-auto -mt-10 max-w-4xl rounded-lg border border-border bg-card p-4 shadow-[0_18px_44px_-24px_rgba(0,0,0,0.5)] md:p-5">
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
              className="h-11 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm outline-none transition-colors focus:border-[var(--ball)]"
            />
          </div>
          <select value={position} onChange={e => setPosition(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" aria-label={t('discover.position')}>
            <option>{t('discover.allPositions')}</option>
            {POSITIONS.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={country} onChange={e => setCountry(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" aria-label={t('discover.country')}>
            <option>{t('discover.allCountries')}</option>
            {COUNTRIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <button onClick={go} className="btn-ball h-11">{t('discover.search')}</button>
        </div>
      </div>
    </Reveal>
  );
}

/* ── Joueurs en vedette ── */
export function FeaturedPlayers() {
  const t = useT();
  const { players } = useCourtLink();
  const featured = [...players].sort((a, b) => b.rating - a.rating).slice(0, 4);
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <Reveal>
        <SectionHead
          num="01"
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

/* ── Opportunités ouvertes — liste éditoriale ── */
export function RecentOpportunities() {
  const t = useT();
  const { opportunities } = useCourtLink();
  const open = opportunities.filter(o => o.status === 'Ouverte').slice(0, 5);
  return (
    <section className="border-y border-border bg-[var(--court)]/40 py-20">
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
          <ul className="divide-y divide-border border-y border-border">
            {open.map(o => (
              <li key={o.id}>
                <button
                  onClick={() => navigate(`/opportunites/${o.id}`)}
                  className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-1 px-2 py-5 text-left transition-colors hover:bg-accent/40 md:grid-cols-[5.5rem_1fr_auto_auto] md:gap-x-8 md:px-3"
                >
                  <span className="hidden whitespace-nowrap font-mono2 text-xs text-muted-foreground md:block">{o.deadline}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base font-bold group-hover:text-[var(--ball)] md:text-lg">{o.title}</span>
                    <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                      {o.org} · {o.city}, {o.country} · {o.position} · {o.ageRange}
                    </span>
                  </span>
                  <span className="hidden whitespace-nowrap text-xs text-muted-foreground md:block tnum">{o.applicants} {t('opps.candidates')}</span>
                  <span className="chip whitespace-nowrap border-[var(--ball)]/35 bg-[color-mix(in_oklch,var(--ball)_10%,transparent)] text-[var(--ball)]">{o.type}</span>
                </button>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ── CTA de clôture — bande sobre ── */
export function ClosingCTA() {
  const t = useT();
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
      <Reveal>
        <div className="court-lines-bg rounded-lg border border-border bg-card px-6 py-14 text-center md:px-14">
          <p className="mb-3 flex items-center justify-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ball)]">
            <span className="font-score">03</span>
            <span className="h-px w-8 bg-[var(--ball)]/50" />
            {t('cta.eyebrow')}
          </p>
          <h2 className="mx-auto max-w-xl font-display text-2xl font-bold md:text-3xl">{t('cta.title1')} <span className="text-gradient-ball">{t('cta.title2')}</span></h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">{t('cta.sub')}</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button onClick={() => navigate('/inscription')} className="btn-ball !px-6 !py-3">{t('cta.register')} <ArrowRight size={16} /></button>
            <button onClick={() => navigate('/demo')} className="btn-ghosty !px-6 !py-3">{t('cta.demo')}</button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} className="text-[var(--ball)]" /> {t('cta.trust1.t')}</span>
            <span className="inline-flex items-center gap-1.5"><Target size={13} className="text-[var(--ball)]" /> {t('cta.trust2.t')}</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={13} className="text-[var(--ball)]" /> {t('cta.trust3.t')}</span>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ── Titre de section — numérotation éditoriale ── */
function SectionHead({ num, eyebrow, title, sub, right }: { num: string; eyebrow?: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-3 flex items-baseline gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--ball)]">
            <span className="font-score">{num}</span>
            <span className="h-px w-8 bg-[var(--ball)]/50" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
        {sub && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
