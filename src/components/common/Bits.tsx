'use client';

import { BadgeCheck, Star, MapPin, Ruler, ChevronRight, Eye } from 'lucide-react';
import { navigate, category, ageFrom } from '@/lib/router';
import type { Player } from '@/lib/types';
import { cn } from '@/lib/utils';

export function VerifiedBadge({ verified, className }: { verified: boolean; className?: string }) {
  if (!verified) return <span className={cn('chip border-border bg-muted text-muted-foreground', className)}>Non vérifié</span>;
  return (
    <span className={cn('chip border-[color-mix(in_oklch,var(--ball)_50%,transparent)] bg-[color-mix(in_oklch,var(--ball)_14%,transparent)] text-[var(--ball)]', className)}>
      <BadgeCheck size={12} /> Vérifié
    </span>
  );
}

export function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className={cn('font-display text-xl font-bold tnum', accent && 'text-[var(--ball)]')}>{value}</span>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

export function PlayerCard({ player, compare, onCompare, index = 0 }: { player: Player; compare?: boolean; onCompare?: (id: string) => void; index?: number }) {
  return (
    <article
      className="card-court group overflow-hidden cursor-pointer fade-up"
      style={{ animationDelay: `${index * 60}ms` }}
      onClick={() => navigate(`/joueurs/${player.id}`)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/joueurs/${player.id}`)}
    >
      <div className="relative h-44 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={player.photo}
          alt={`Portrait de ${player.name}`}
          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(10,10,12,0.85)] via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <VerifiedBadge verified={player.verified && !player.suspended} className="backdrop-blur-sm" />
          {player.suspended && <span className="chip border-destructive/50 bg-destructive/20 text-red-300">Suspendu</span>}
        </div>
        <div className="absolute right-3 top-3">
          <span className="chip border-white/20 bg-black/40 text-white backdrop-blur-sm tnum">
            <Star size={11} className="fill-[var(--ball)] text-[var(--ball)]" /> {player.rating}
          </span>
        </div>
        <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
          <div>
            <h3 className="font-display text-lg font-bold leading-tight text-white">{player.name}</h3>
            <p className="text-xs text-white/70">
              {player.position} · #{player.number} · {category(player.birthDate)}
            </p>
          </div>
          <span className="font-score text-2xl text-[var(--ball)] tnum">{player.height}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin size={12} /> {player.city}, {player.country}
          <span className="mx-1 h-1 w-1 rounded-full bg-border" />
          {player.club === 'Libre' ? <span className="text-[var(--amber-glow)]">Sans club</span> : player.club}
        </div>
        {player.stats[0] && (
          <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
            {[
              [player.stats[0].ppg, 'PTS'], [player.stats[0].rpg, 'REB'],
              [player.stats[0].apg, 'PAS'], [player.stats[0].fgPct + '%', 'TIR'],
            ].map(([v, l]) => (
              <div key={l as string} className="text-center">
                <div className="font-display text-sm font-bold tnum">{v}</div>
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <Eye size={11} /> {player.views} vues
          </span>
          <div className="flex items-center gap-2">
            {onCompare && (
              <button
                onClick={(e) => { e.stopPropagation(); onCompare(player.id); }}
                className={cn(
                  'rounded-md border px-2 py-1 text-[11px] font-semibold transition-colors',
                  compare ? 'border-[var(--ball)] bg-[color-mix(in_oklch,var(--ball)_18%,transparent)] text-[var(--ball)]' : 'border-border text-muted-foreground hover:border-[var(--ball)] hover:text-[var(--ball)]'
                )}
              >
                {compare ? 'Retirer' : 'Comparer'}
              </button>
            )}
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-[var(--ball)]">
              Profil <ChevronRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function EmptyState({ icon: Icon = 'Basketball', title, hint, action }: { icon?: never; title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 px-6 py-14 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_oklch,var(--ball)_15%,transparent)]">
        <div className="ball-loader" />
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function SectionHead({ eyebrow, title, sub, right }: { eyebrow?: string; title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--ball)]">{eyebrow}</p>}
        <h2 className="font-display text-2xl font-bold md:text-3xl">{title}</h2>
        {sub && <p className="mt-2 max-w-xl text-sm text-muted-foreground">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

/** Mini graphique en barres SVG (aucune dépendance) */
export function BarChart({ data, height = 120, suffix = '' }: { data: { label: string; value: number }[]; height?: number; suffix?: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span className="text-[10px] font-semibold tnum text-[var(--ball)]">{d.value}{suffix}</span>
          <div className="w-full overflow-hidden rounded-t-md bg-muted/60" style={{ height: height - 42 }}>
            <div
              className="h-full w-full rounded-t-md bg-gradient-to-t from-[var(--ball-deep)] to-[var(--ball)] transition-all duration-700"
              style={{ height: `${(d.value / max) * 100}%` }}
            />
          </div>
          <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Donut SVG simple */
export function Donut({ value, label, size = 92 }: { value: number; label: string; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--muted)" strokeWidth="8" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ball)" strokeWidth="8"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.2,.8,.2,1)' }}
        />
      </svg>
      <div className="-mt-[calc(50%+8px)] mb-[calc(50%-22px)] text-center">
        <div className="font-display text-lg font-bold tnum">{value}%</div>
      </div>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-muted', className)}>
      <div className="h-full rounded-full bg-gradient-to-r from-[var(--ball-deep)] to-[var(--ball)] transition-all duration-700" style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function PlayerMiniRow({ player, right }: { player: Player; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={player.photo} alt={player.name} className="h-10 w-10 rounded-full object-cover object-top" loading="lazy" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.name}</p>
        <p className="truncate text-xs text-muted-foreground">{player.position} · {player.height} cm · <Ruler size={9} className="inline" /> {player.city}</p>
      </div>
      {right}
    </div>
  );
}
