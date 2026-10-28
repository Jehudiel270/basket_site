'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Bell, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { roleLabels } from '@/lib/permissions';
import { cn } from '@/lib/utils';

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick ?? (() => navigate('/'))} className="flex items-center gap-2.5" aria-label="CourtLink — accueil">
      <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--ball)] to-[var(--ball-deep)] shadow-[0_4px_16px_-4px_color-mix(in_oklch,var(--ball)_60%,transparent)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#26120a" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19M12 2.5v19M5 5c3.5 3.5 3.5 10.5 0 14M19 5c-3.5 3.5-3.5 10.5 0 14" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight">
        Court<span className="text-[var(--ball)]">Link</span>
      </span>
    </button>
  );
}

const NAV = [
  { label: 'Joueurs', hash: '/joueurs' },
  { label: 'Clubs & académies', hash: '/organisations' },
  { label: 'Opportunités', hash: '/opportunites' },
  { label: 'Événements', hash: '/evenements' },
  { label: 'Tarifs', hash: '/tarifs' },
  { label: 'Aide', hash: '/aide' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-[var(--ball)] hover:text-[var(--ball)]"
      aria-label="Changer de thème"
    >
      {mounted && theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}

export function PublicHeader({ route }: { route: string }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { role, loggedIn, notifications, logout } = useCourtLink();
  const unread = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const inWorkspace = route.startsWith('/app') || route.startsWith('/admin');

  return (
    <header
      className={cn(
        'sticky top-0 z-40 w-full border-b transition-all duration-300',
        scrolled ? 'border-border bg-background/85 backdrop-blur-xl' : 'border-transparent bg-transparent'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV.map(n => (
            <button
              key={n.hash}
              onClick={() => navigate(n.hash)}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                route === n.hash ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loggedIn ? (
            <>
              <button
                onClick={() => navigate('/app/notifications')}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-[var(--ball)] hover:text-[var(--ball)]"
                aria-label={`Notifications (${unread} non lues)`}
              >
                <Bell size={16} />
                {unread > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ball)] px-1 text-[9px] font-bold text-black tnum">
                    {unread}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate(role === 'admin' ? '/admin' : '/app')}
                className={cn(inWorkspace ? 'btn-ball' : 'btn-ghosty') + ' hidden !py-2 text-xs sm:inline-flex'}
              >
                <LayoutDashboard size={14} /> {roleLabels[role]}
                <ChevronDown size={12} />
              </button>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive"
                aria-label="Se déconnecter"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/connexion')} className="btn-ghosty hidden !py-2 text-xs sm:inline-flex">Connexion</button>
              <button onClick={() => navigate('/inscription')} className="btn-ball !py-2 text-xs">
                Créer mon compte
              </button>
            </>
          )}
          <button onClick={() => setOpen(!open)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border lg:hidden" aria-label="Menu">
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background/95 backdrop-blur-xl lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1 px-4 py-3" aria-label="Navigation mobile">
            {NAV.map(n => (
              <button
                key={n.hash}
                onClick={() => { navigate(n.hash); setOpen(false); }}
                className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {n.label}
              </button>
            ))}
            {loggedIn && (
              <button onClick={() => { navigate(role === 'admin' ? '/admin' : '/app'); setOpen(false); }} className="btn-ball mt-2">
                Mon espace {roleLabels[role]}
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  const cols: { title: string; links: { label: string; hash: string }[] }[] = [
    {
      title: 'Découvrir',
      links: [
        { label: 'Annuaire des joueurs', hash: '/joueurs' },
        { label: 'Clubs & académies', hash: '/organisations' },
        { label: 'Opportunités', hash: '/opportunites' },
        { label: 'Événements', hash: '/evenements' },
        { label: 'Tarifs', hash: '/tarifs' },
      ],
    },
    {
      title: 'Parcours',
      links: [
        { label: 'Pour les joueurs', hash: '/fonctionnement-joueurs' },
        { label: 'Pour les clubs & recruteurs', hash: '/fonctionnement-clubs' },
        { label: 'Créer un compte', hash: '/inscription' },
        { label: 'Centre d\u2019aide', hash: '/aide' },
        { label: 'Contact', hash: '/contact' },
      ],
    },
    {
      title: 'Confiance & sécurité',
      links: [
        { label: 'Politique de confidentialité', hash: '/confidentialite' },
        { label: 'Conditions d\u2019utilisation', hash: '/conditions' },
        { label: 'Signaler un contenu', hash: '/signaler' },
        { label: 'Vérification des comptes', hash: '/aide' },
        { label: 'Protection des mineurs', hash: '/confidentialite' },
      ],
    },
  ];
  return (
    <footer className="mt-auto border-t border-border bg-[var(--court)]">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              La plateforme qui connecte les talents du basketball aux clubs, académies et recruteurs d\u2019Afrique de l\u2019Ouest — avec des données vérifiées et des parcours transparents.
            </p>
            <div className="mt-5 flex gap-2">
              {['FCFA supporté', 'FR / EN bientôt', 'Mobile first'].map(t => (
                <span key={t} className="chip border-border bg-card text-muted-foreground">{t}</span>
              ))}
            </div>
            <p className="mt-5 max-w-xs text-[11px] leading-relaxed text-muted-foreground/70">
              CourtLink facilite la découverte et la mise en relation. La plateforme ne garantit aucune sélection, bourse, contrat ou rémunération et n\u2019est pas un agent licencié.
            </p>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <h3 className="mb-4 font-display text-sm font-bold uppercase tracking-wider">{c.title}</h3>
              <ul className="space-y-2.5">
                {c.links.map((l, li) => (
                  <li key={`${l.hash}-${li}`}>
                    <button onClick={() => navigate(l.hash)} className="text-sm text-muted-foreground transition-colors hover:text-[var(--ball)]">
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>© 2026 CourtLink (prototype de démonstration) — Cotonou, Bénin. Aucune transaction réelle.</p>
          <p className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--ball)] pulse-glow" />
            Mode démonstration actif — données fictives
          </p>
        </div>
      </div>
    </footer>
  );
}
