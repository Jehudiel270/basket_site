'use client';

import { useState } from 'react';
import {
  Bell, LogOut, Menu, X, ChevronLeft, ShieldAlert, Home, RotateCcw,
} from 'lucide-react';
import * as icons from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { roleLabels, roleMenus, routeRoles } from '@/lib/permissions';
import { Logo, ThemeToggle } from '@/components/layout/Chrome';
import { cn } from '@/lib/utils';

export function WorkspaceShell({ route, children }: { route: string; children: React.ReactNode }) {
  const { role, loggedIn, logout, notifications, settings, resetDemo } = useCourtLink();
  const [open, setOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!loggedIn) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <ShieldAlert size={40} className="mb-4 text-[var(--ball)]" />
        <h1 className="font-display text-2xl font-black">Espace réservé aux membres</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Cette zone nécessite une session. Le mode démonstration permet d'entrer instantanément avec n'importe quel rôle depuis la page de connexion.
        </p>
        <div className="mt-6 flex gap-2">
          <button onClick={() => navigate('/connexion')} className="btn-ball">Se connecter en mode démo</button>
          <button onClick={() => navigate('/')} className="btn-ghosty"><Home size={15} /> Accueil</button>
        </div>
      </div>
    );
  }

  const isAdmin = route.startsWith('/admin');
  const home = role === 'admin' ? '/admin' : '/app';
  const menuRoutes = roleMenus[role].map(m => m.hash.replace('#', ''));
  const sharedRoutes = ['/app/notifications', '/app/abonnement', '/app/messages'];
  const explicit = routeRoles[route];
  const allowed =
    route === home ||
    menuRoutes.includes(route) ||
    sharedRoutes.includes(route) ||
    (explicit ? explicit.includes(role) : false);
  if (!allowed) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <ShieldAlert size={40} className="mb-4 text-destructive" />
        <h1 className="font-display text-2xl font-black">Accès non autorisé</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Le rôle <strong>{roleLabels[role]}</strong> n'a pas les permissions pour <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{route}</code>.
          Déconnectez-vous puis connectez-vous avec un rôle approprié.
        </p>
        <div className="mt-6 flex gap-2">
          <button onClick={() => navigate(role === 'admin' ? '/admin' : '/app')} className="btn-ball">Aller à mon espace</button>
          <button onClick={() => navigate('/connexion')} className="btn-ghosty">Changer de rôle</button>
        </div>
      </div>
    );
  }

  const menu = roleMenus[role];
  const unread = notifications.filter(n => !n.read).length;
  const base = isAdmin ? '/admin' : '/app';

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1600px]">
      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-[var(--court)] transition-transform duration-300 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Logo onClick={() => navigate('/')} />
          <button onClick={() => setOpen(false)} className="text-muted-foreground lg:hidden"><X size={18} /></button>
        </div>
        <div className="border-b border-border px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Rôle actif · mode démo</p>
          <p className="mt-1 font-display text-sm font-bold text-[var(--ball)]">{roleLabels[role]}</p>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Menu du rôle">
          {menu.map(m => {
            const Icon = (icons as unknown as Record<string, icons.LucideIcon>)[m.icon] ?? icons.Circle;
            const target = m.hash.replace('#', '');
            const active = route === target || (target !== '/app' && target !== '/admin' && route.startsWith(target));
            return (
              <button key={m.hash} onClick={() => { navigate(target); setOpen(false); }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  active ? 'bg-[color-mix(in_oklch,var(--ball)_16%,transparent)] font-semibold text-[var(--ball)]' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}>
                <Icon size={16} />
                <span className="flex-1 text-left">{m.label}</span>
                {m.badge === 'unread' && unread > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ball)] px-1 text-[9px] font-bold text-black tnum">{unread}</span>}
                {m.badge === 'queue' && route !== target && <span className="h-1.5 w-1.5 rounded-full bg-[var(--ball)]" />}
              </button>
            );
          })}
          {role !== 'admin' && (
            <>
              <div className="my-2 border-t border-border" />
              <button onClick={() => navigate('/')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent">
                <Home size={16} /> Retour au site public
              </button>
            </>
          )}
        </nav>
        <div className="border-t border-border p-3">
          <button onClick={() => { if (confirm('Réinitialiser toutes les données de démonstration ?')) { resetDemo(); navigate('/'); } }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-destructive">
            <RotateCcw size={13} /> Réinitialiser les données démo
          </button>
          <button onClick={() => { logout(); navigate('/'); }} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-destructive">
            <LogOut size={13} /> Quitter la démonstration
          </button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Contenu */}
      <div className="min-w-0 flex-1">
        <div className="sticky top-16 z-20 flex h-12 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-xl lg:top-16">
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm text-muted-foreground lg:hidden">
            <Menu size={17} /> Menu {isAdmin ? 'admin' : 'espace'}
          </button>
          <p className="hidden text-xs text-muted-foreground lg:block">
            {settings.brandName} — espace de travail <strong className="text-foreground">{roleLabels[role]}</strong>
            {role !== 'admin' && ' · les fonctionnalités de paiement sont simulées'}
          </p>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:border-[var(--ball)] hover:text-[var(--ball)]" aria-label="Notifications">
                <Bell size={14} />
                {unread > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ball)] px-1 text-[9px] font-bold text-black tnum">{unread}</span>}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 z-50 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-2xl pop-in">
                  <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                    <span className="text-sm font-bold">Notifications</span>
                    <button onClick={() => setNotifOpen(false)}><X size={14} className="text-muted-foreground" /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.slice(0, 8).map(n => (
                      <div key={n.id} className={cn('border-b border-border/60 px-4 py-3 last:border-0', !n.read && 'bg-[color-mix(in_oklch,var(--ball)_6%,transparent)]')}>
                        <p className="text-xs font-bold">{n.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>
                        <p className="mt-1 text-[10px] text-muted-foreground/70">{n.time}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { navigate('/app/notifications'); setNotifOpen(false); }} className="w-full border-t border-border py-2.5 text-xs font-semibold text-[var(--ball)] hover:bg-accent">
                    Tout voir
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => navigate('/')} className="hidden h-8 items-center rounded-lg border border-border px-2.5 text-xs text-muted-foreground hover:border-[var(--ball)] hover:text-[var(--ball)] md:flex">
              <ChevronLeft size={13} /> Site public
            </button>
          </div>
        </div>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export function WorkspaceHeader({ title, sub, actions }: { title: string; sub?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-black md:text-3xl">{title}</h1>
        {sub && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
