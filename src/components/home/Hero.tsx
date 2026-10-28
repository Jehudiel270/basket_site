'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ArrowRight, Play, ShieldCheck, MapPin, Users, RotateCcw, Zap } from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';

const CourtScene = dynamic(() => import('@/components/three/CourtScene'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="ball-loader" style={{ width: 22, height: 22 }} />
        <span className="font-score text-xs text-muted-foreground">CHARGEMENT DE L&apos;ARÈNE 3D…</span>
      </div>
    </div>
  ),
});

function LED({ label, value, size = 'text-3xl' }: { label: string; value: string; size?: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="led tnum font-black leading-none" style={{ fontSize: 'inherit' }}>
        <span className={size}>{value}</span>
      </span>
      <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">{label}</span>
    </div>
  );
}

export function Hero({ featured }: { featured: number }) {
  const { settings } = useCourtLink();
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [made, setMade] = useState(0);
  const [streak, setStreak] = useState(0);
  const [auto, setAuto] = useState(true);
  const [pop, setPop] = useState<{ id: number; text: string; good: boolean } | null>(null);
  const [shotSignal, setShotSignal] = useState(0);
  const shootRef = useRef<(() => void) | null>(null);
  const confettiRef = useRef<(() => void) | null>(null);

  const onScore = () => {
    setScore(s => s + 3);
    setShots(s => s + 1);
    setMade(m => m + 1);
    setStreak(s => s + 1);
    setPop({ id: Date.now(), text: '+3 PTS', good: true });
  };
  const onMiss = () => {
    setShots(s => s + 1);
    setStreak(0);
    setPop({ id: Date.now(), text: 'RATÉ !', good: false });
  };

  const shoot = () => {
    setShotSignal(s => s + 1);
  };

  return (
    <section className="relative min-h-[92vh] overflow-hidden court-lines-bg">
      {/* halo décoratif */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--ball)_18%,transparent),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklch,var(--amber-glow)_12%,transparent),transparent_65%)] blur-2xl" />

      {/* Scène 3D plein écran */}
      <div className="absolute inset-0">
        <CourtScene
          auto={auto}
          onScore={onScore}
          onMiss={onMiss}
          shootRef={shootRef}
          confettiRef={confettiRef}
          shotSignal={shotSignal}
        />
      </div>

      {/* Contenu éditorial */}
      <div className="pointer-events-none relative z-10 mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-end px-4 pb-64 py-16 md:justify-center md:px-6 md:pb-24">
        <div className="max-w-xl md:bg-transparent">
          <div className="pointer-events-auto fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-[color-mix(in_oklch,var(--ball)_40%,transparent)] bg-[color-mix(in_oklch,var(--ball)_12%,transparent)] px-3 py-1.5 text-xs font-semibold text-[var(--ball)] backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--ball)]" />
            Le réseau de confiance du basketball · Bénin & Afrique de l&apos;Ouest
          </div>
          <h1 className="fade-up font-display text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]" style={{ animationDelay: '.08s' }}>
            Le talent local
            <br />
            <span className="text-gradient-ball">entre dans le panier.</span>
          </h1>
          <p className="fade-up mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg [text-shadow:0_2px_16px_rgba(0,0,0,0.9)]" style={{ animationDelay: '.16s' }}>
            {settings.tagline}. Profils vérifiés, statistiques par saison, opportunités régionales et suivi de recrutement — du premier camp de détection au contrat.
          </p>
          <div className="fade-up pointer-events-auto mt-8 flex flex-wrap gap-3" style={{ animationDelay: '.24s' }}>
            <button onClick={() => navigate('/joueurs')} className="btn-ball !px-6 !py-3 text-base">
              Explorer les profils <ArrowRight size={17} />
            </button>
            <button onClick={() => navigate('/inscription')} className="btn-ghosty !px-6 !py-3 text-base">
              <Play size={16} /> Je suis joueur — créer mon profil
            </button>
          </div>
          <div className="fade-up mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground" style={{ animationDelay: '.32s' }}>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[var(--ball)]" /> Profils & clubs vérifiés</span>
            <span className="inline-flex items-center gap-1.5"><Users size={14} className="text-[var(--ball)]" /> {featured}+ joueurs référencés</span>
            <span className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-[var(--ball)]" /> 10 pays couverts</span>
          </div>
        </div>
      </div>

      {/* Tableau de score pro */}
      <div className="absolute bottom-4 right-3 z-20 origin-bottom-right scale-90 md:right-8 md:bottom-6 md:scale-100 fade-up" style={{ animationDelay: '.4s' }}>
        <div className="rounded-2xl border border-[rgba(255,122,51,0.35)] bg-[rgba(12,10,10,0.82)] p-4 shadow-[0_16px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-6">
            <span className="font-score text-[10px] tracking-[0.25em] text-[var(--ball)]">COURTLINK ARENA</span>
            <span className="flex items-center gap-1 font-score text-[9px] text-white/40">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> LIVE
            </span>
          </div>
          <div className="flex items-end gap-6">
            <LED label="Score" value={String(score).padStart(2, '0')} size="text-4xl md:text-5xl" />
            <div className="flex gap-4 pb-1">
              <LED label="Tirs" value={String(shots).padStart(2, '0')} size="text-base" />
              <LED label="Paniers" value={String(made).padStart(2, '0')} size="text-base" />
              <LED label="Série" value={'x' + streak} size="text-base" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
            <button onClick={shoot} className="btn-ball flex-1 !rounded-lg !py-2 text-xs uppercase tracking-wider">
              <Zap size={13} /> Tirer
            </button>
            <button
              onClick={() => setAuto(a => !a)}
              className={`rounded-lg border px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${auto ? 'border-[var(--ball)] bg-[color-mix(in_oklch,var(--ball)_18%,transparent)] text-[var(--ball)]' : 'border-white/15 text-white/50 hover:text-white'}`}
              aria-pressed={auto}
            >
              Auto
            </button>
            <button
              onClick={() => { setScore(0); setShots(0); setMade(0); setStreak(0); }}
              className="rounded-lg border border-white/15 px-2.5 py-2 text-white/50 transition-colors hover:text-white"
              aria-label="Remettre le score à zéro"
            >
              <RotateCcw size={12} />
            </button>
          </div>
          <p className="mt-2 text-center text-[9px] text-white/35">Cliquez le ballon pour marquer</p>
        </div>
      </div>

      {/* Pop de score */}
      {pop && (
        <div
          key={pop.id}
          className="score-pop pointer-events-none absolute z-30 font-score text-3xl font-black md:text-4xl"
          style={{
            right: '26%',
            top: '38%',
            color: pop.good ? 'var(--ball)' : '#ef4444',
            textShadow: '0 0 24px color-mix(in oklch, var(--ball) 70%, transparent)',
          }}
        >
          {pop.text}
        </div>
      )}

      {/* Indicateur scroll */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground/60 md:flex">
        <span className="text-[10px] uppercase tracking-[0.25em]">Défiler</span>
        <div className="h-8 w-[1px] bg-gradient-to-b from-[var(--ball)] to-transparent" />
      </div>
    </section>
  );
}


