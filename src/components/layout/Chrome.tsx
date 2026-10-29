'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon, Bell, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { signOut } from 'next-auth/react';
import { isApiMode } from '@/lib/api-mode';
import { roleLabels } from '@/lib/permissions';
import { useT, useLang } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick ?? (() => navigate('/'))} className="flex items-center gap-2.5" aria-label="CourtLink — accueil">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ball)] shadow-[2px_2px_0_0_var(--press)]">
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="#26120a" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9.5" />
          <path d="M2.5 12h19M12 2.5v19M5 5c3.5 3.5 3.5 10.5 0 14M19 5c-3.5 3.5-3.5 10.5 0 14" />
        </svg>
      </span>
      <span className="font-display text-lg font-black uppercase tracking-tight">
        Court<span className="text-[var(--ball)]">Link</span>
      </span>
    </button>
  );
}

const NAV = [
  { key: 'nav.players', hash: '/joueurs' },
  { key: 'nav.clubs', hash: '/organisations' },
  { key: 'nav.opportunities', hash: '/opportunites' },
  { key: 'nav.events', hash: '/evenements' },
  { key: 'nav.pricing', hash: '/tarifs' },
  { key: 'nav.help', hash: '/aide' },
];

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex h-9 items-center rounded-[3px] border border-border p-0.5" role="group" aria-label="Langue / Language">
      {(['fr', 'en'] as const).map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            'h-7.5 rounded-[2px] px-2 font-mono2 text-[11px] uppercase tracking-wider transition-colors',
            lang === l ? 'bg-[var(--ball)] text-black' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-[3px] border border-border text-muted-foreground transition-colors hover:border-[var(--ball)] hover:text-[var(--ball)]"
      aria-label="Changer de thème / Switch theme"
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
  const t = useT();
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
        <nav className="hidden items-stretch gap-6 lg:flex lg:[&>button]:flex lg:[&>button]:h-16 lg:[&>button]:items-center" aria-label="Navigation principale">
          {NAV.map(n => (
            <button
              key={n.hash}
              onClick={() => navigate(n.hash)}
              className={cn(
                'border-b-2 px-0.5 text-[12px] font-semibold uppercase tracking-[0.12em] transition-colors',
                route === n.hash
                  ? 'border-[var(--ball)] text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {t(n.key)}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 md:gap-2">
          <LangToggle />
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
                onClick={() => { if (isApiMode()) void signOut(); logout(); navigate('/'); }}
                className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-destructive hover:text-destructive sm:flex"
                aria-label="Se déconnecter / Log out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/connexion')} className="btn-ghosty !hidden !py-2 text-xs sm:!inline-flex">{t('header.login')}</button>
              <button onClick={() => navigate('/inscription')} className="btn-ball !hidden !py-2 text-xs min-[480px]:!inline-flex">
                {t('header.register')}
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
          <nav className="mx-auto grid max-w-7xl gap-0.5 px-4 py-3" aria-label="Navigation mobile">
            {NAV.map(n => (
              <button
                key={n.hash}
                onClick={() => { navigate(n.hash); setOpen(false); }}
                className="rounded-[3px] px-3 py-2.5 text-left text-[13px] font-semibold uppercase tracking-[0.1em] text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                {t(n.key)}
              </button>
            ))}
            {loggedIn ? (
              <>
                <button onClick={() => { navigate(role === 'admin' ? '/admin' : '/app'); setOpen(false); }} className="btn-ball mt-2">
                  Mon espace {roleLabels[role]}
                </button>
                <button
                  onClick={() => { if (isApiMode()) void signOut(); logout(); navigate('/'); setOpen(false); }}
                  className="mt-1 flex items-center justify-center gap-2 rounded-[3px] border border-border px-3 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground hover:border-destructive hover:text-destructive sm:hidden"
                >
                  <LogOut size={14} /> {t('header.logout')}
                </button>
              </>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button onClick={() => { navigate('/connexion'); setOpen(false); }} className="btn-ghosty !py-2 text-xs">{t('header.login')}</button>
                <button onClick={() => { navigate('/inscription'); setOpen(false); }} className="btn-ball !py-2 text-xs">{t('header.register')}</button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  const t = useT();
  const cols: { title: string; links: { label: string; hash: string }[] }[] = [
    {
      title: t('footer.col.discover'),
      links: [
        { label: t('footer.playersDir'), hash: '/joueurs' },
        { label: t('nav.clubs'), hash: '/organisations' },
        { label: t('nav.opportunities'), hash: '/opportunites' },
        { label: t('nav.events'), hash: '/evenements' },
        { label: t('nav.pricing'), hash: '/tarifs' },
      ],
    },
    {
      title: t('footer.col.journeys'),
      links: [
        { label: t('footer.howPlayers'), hash: '/fonctionnement-joueurs' },
        { label: t('footer.howClubs'), hash: '/fonctionnement-clubs' },
        { label: t('footer.register'), hash: '/inscription' },
        { label: t('footer.helpCenter'), hash: '/aide' },
        { label: t('footer.contact'), hash: '/contact' },
      ],
    },
    {
      title: t('footer.col.trust'),
      links: [
        { label: t('footer.privacy'), hash: '/confidentialite' },
        { label: t('footer.terms'), hash: '/conditions' },
        { label: t('footer.report'), hash: '/signaler' },
        { label: t('footer.verify'), hash: '/aide' },
        { label: t('footer.minors'), hash: '/confidentialite' },
      ],
    },
  ];
  return (
    <footer className="grain relative mt-auto border-t border-border bg-[var(--court)]">
      <div className="relative mx-auto max-w-7xl px-4 py-14 on-court md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="on-court-muted mt-4 max-w-xs text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['footer.chip.fcfa', 'footer.chip.lang', 'footer.chip.mobile'].map(k => (
                <span key={k} className="rounded-[3px] border border-white/15 px-2 py-1 font-mono2 text-[10px] uppercase tracking-[0.1em] on-court-muted">{t(k)}</span>
              ))}
            </div>
            <p className="on-court-faint mt-5 max-w-xs text-[11px] leading-relaxed">
              {t('footer.disclaimer')}
            </p>
          </div>
          {cols.map(c => (
            <div key={c.title}>
              <h3 className="mb-4 font-mono2 text-[11px] uppercase tracking-[0.2em] text-[var(--ball)]">{c.title}</h3>
              <ul className="space-y-2.5">
                {c.links.map((l, li) => (
                  <li key={`${l.hash}-${li}`}>
                    <button onClick={() => navigate(l.hash)} className="on-court-muted text-sm transition-colors hover:text-[var(--ball)]">
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="on-court-faint mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-mono2 text-[11px] uppercase tracking-[0.1em]">
          <p>{t('footer.copyright')}</p>
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[var(--ball)] pulse-glow" />
            {t('footer.demoActive')}
          </p>
        </div>
        <p aria-hidden className="pointer-events-none mt-10 select-none overflow-hidden whitespace-nowrap text-center font-score text-[clamp(3rem,9vw,7.5rem)] leading-none text-white/[0.045]">
          COURTLINK
        </p>
      </div>
    </footer>
  );
}
