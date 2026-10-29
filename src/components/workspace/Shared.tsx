'use client';

import { useState } from 'react';
import {
  Send, Search, Bell, CheckCheck, CreditCard, Download, Receipt, RotateCcw,
  Mail, MailOpen, Trash2, ChevronLeft, Info,
} from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { launchFedapayCheckout } from '@/lib/billing-client';
import { WorkspaceHeader } from './Shell';
import { EmptyState } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

/* ── Messagerie partagée ── */
export function MessagesView() {
  const { conversations, sendMessage, markConversationRead } = useCourtLink();
  const [active, setActive] = useState<string | null>(conversations[0]?.id ?? null);
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const conv = conversations.find(c => c.id === active);
  const list = conversations.filter(c => !q || c.participantNames.join(' ').toLowerCase().includes(q.toLowerCase()) || c.subject.toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <WorkspaceHeader title="Messagerie" sub="Conversations de démonstration. Les mineurs ne reçoivent que des messages approuvés par leur tuteur." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="card-court !translate-y-0 !hover:transform-none flex max-h-[70vh] flex-col overflow-hidden">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher une conversation…" className="h-10 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-sm outline-none focus:border-[var(--ball)]" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {list.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">Aucune conversation.</p>
            ) : list.map(c => (
              <button key={c.id} onClick={() => { setActive(c.id); markConversationRead(c.id); }}
                className={cn('w-full border-b border-border/60 p-3.5 text-left transition-colors hover:bg-accent/50', active === c.id && 'bg-[color-mix(in_oklch,var(--ball)_8%,transparent)]')}>
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('truncate text-sm', c.unread ? 'font-bold' : 'font-semibold')}>{c.participantNames.filter(n => n !== 'Vous').join(', ')}</p>
                  {c.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--ball)]" />}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.subject}</p>
                <p className="mt-1 truncate text-[11px] text-muted-foreground/70">{c.messages[c.messages.length - 1]?.body}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="card-court !translate-y-0 !hover:transform-none flex max-h-[70vh] flex-col overflow-hidden">
          {conv ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <div>
                  <p className="font-display text-sm font-bold">{conv.participantNames.filter(n => n !== 'Vous').join(', ')}</p>
                  <p className="text-xs text-muted-foreground">{conv.subject}</p>
                </div>
                <span className="text-[11px] text-muted-foreground">{conv.updatedAt}</span>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-[var(--court)]/40 p-5">
                {conv.messages.map((m, i) => (
                  <div key={i} className={cn('flex', m.me ? 'justify-end' : 'justify-start')}>
                    <div className={cn('max-w-[75%] rounded-2xl px-4 py-2.5 text-sm', m.me ? 'rounded-br-sm bg-[var(--ball)] text-black' : 'rounded-bl-sm border border-border bg-card')}>
                      {!m.me && <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ball)]">{m.from}</p>}
                      <p className="leading-relaxed">{m.body}</p>
                      <p className={cn('mt-1 text-right text-[10px]', m.me ? 'text-black/50' : 'text-muted-foreground')}>{m.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <form className="flex gap-2 border-t border-border p-3.5" onSubmit={e => { e.preventDefault(); if (!draft.trim()) return; sendMessage(conv.id, draft); setDraft(''); }}>
                <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Écrire un message…" className="h-11 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
                <button type="submit" className="btn-ball !px-4"><Send size={15} /></button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center"><EmptyState title="Sélectionnez une conversation" /></div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Abonnement & factures ── */
export function SubscriptionView() {
  const { plans, subscription, payments, checkout, cancelSubscription, role } = useCourtLink();
  const current = plans.find(p => p.id === subscription?.planId);
  const suggestions = plans.filter(p => ['clubpro', 'premium', 'academy', 'organizer'].includes(p.id));
  const invoiceTotal = payments.filter(p => p.status === 'Confirmé').length;

  return (
    <div>
      <WorkspaceHeader title="Abonnement & facturation" sub="Gestion simulée : aucun paiement réel. En production : Mobile Money FCFA, cartes et virements UEMOA." />
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="card-court p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Offre actuelle</p>
                <h2 className="mt-1 font-display text-2xl font-black">{current?.name ?? 'Découverte'}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Statut : <strong className={subscription?.status === 'Actif' ? 'text-green-400' : 'text-muted-foreground'}>{subscription?.status}</strong>
                  {subscription?.renews !== '—' && <> · renouvellement le {subscription?.renews}</>}
                </p>
              </div>
              {subscription && subscription.planId !== 'free' && (
                <button onClick={cancelSubscription} className="btn-ghosty !py-2 text-xs !border-destructive/40 !text-destructive"><RotateCcw size={13} /> Résilier</button>
              )}
            </div>
            {current && current.price > 0 && (
              <div className="mt-4 rounded-lg bg-muted/50 p-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Montant</span><span className="font-bold tnum">{current.price.toLocaleString('fr-FR')} FCFA / {current.period}</span></div>
                <div className="mt-1.5 flex justify-between"><span className="text-muted-foreground">Moyen simulé</span><span>Mobile Money</span></div>
              </div>
            )}
          </section>

          <section className="card-court p-6">
            <h2 className="mb-4 font-display text-lg font-bold">Historique de facturation</h2>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                  <th className="pb-2">Facture</th><th className="pb-2">Offre</th><th className="pb-2">Montant</th><th className="pb-2">Date</th><th className="pb-2">Statut</th><th className="pb-2 text-right">Reçu</th>
                </tr></thead>
                <tbody>
                  {payments.slice(0, 6).map(p => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="py-2.5 font-mono2 text-xs">{p.invoice}</td>
                      <td className="py-2.5">{p.plan}</td>
                      <td className="py-2.5 tnum font-semibold">{p.amount}</td>
                      <td className="py-2.5 text-muted-foreground">{p.date}</td>
                      <td className="py-2.5"><span className={cn('chip', p.status === 'Confirmé' ? 'border-green-500/40 text-green-400' : p.status === 'Litige' ? 'border-red-500/40 text-red-300' : 'border-amber-500/40 text-amber-300')}>{p.status}</span></td>
                      <td className="py-2.5 text-right"><button onClick={() => alert(`Facture ${p.invoice} (PDF simulé) — ${p.plan}, ${p.amount}, ${p.status}.`)} className="inline-flex items-center gap-1 text-xs text-[var(--ball)] hover:underline"><Download size={12} /> PDF</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{invoiceTotal} paiement(s) simulé(s) confirmé(s) au total.</p>
          </section>
        </div>

        <section className="card-court p-6">
          <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-bold"><CreditCard size={17} className="text-[var(--ball)]" /> Changer d'offre</h2>
          <p className="mb-4 text-xs text-muted-foreground">La migration est instantanée dans la démonstration.</p>
          <div className="space-y-2.5">
            {suggestions.map(p => (
              <div key={p.id} className={cn('rounded-lg border p-3.5', subscription?.planId === p.id ? 'border-[var(--ball)] bg-[color-mix(in_oklch,var(--ball)_8%,transparent)]' : 'border-border')}>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.audience}</p>
                  </div>
                  <p className="font-display text-lg font-black tnum">{p.price === 0 ? '0' : p.price.toLocaleString('fr-FR')} F<span className="text-xs font-normal text-muted-foreground">/{p.period}</span></p>
                </div>
                {subscription?.planId === p.id ? (
                  <p className="mt-2 text-center text-xs font-semibold text-green-400">Offre active</p>
                ) : (
                  <button
                    onClick={async () => {
                      const redirected = await launchFedapayCheckout(p.id, false);
                      if (!redirected) checkout(p, 'Mobile Money');
                    }}
                    className="btn-ghosty mt-2 w-full !py-1.5 text-xs"
                  >
                    Souscrire via FedaPay
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
            <Info size={13} className="mt-0.5 shrink-0" />
            Rappel : les abonnements débloquent des fonctionnalités. Ils n'achètent aucune sélection, bourse ou promesse de recrutement.
          </p>
        </section>
      </div>
    </div>
  );
}

/* ── Notifications plein écran ── */
export function NotificationsView() {
  const { notifications, markAllNotificationsRead, markNotificationRead } = useCourtLink();
  const unread = notifications.filter(n => !n.read).length;
  return (
    <div>
      <WorkspaceHeader
        title="Notifications"
        sub={`${unread} non lue(s) sur ${notifications.length}.`}
        actions={unread > 0 ? <button onClick={markAllNotificationsRead} className="btn-ghosty !py-2 text-xs"><CheckCheck size={14} /> Tout marquer comme lu</button> : undefined}
      />
      {notifications.length === 0 ? (
        <EmptyState title="Aucune notification" hint="Les événements de votre compte apparaîtront ici." />
      ) : (
        <div className="space-y-2.5">
          {notifications.map(n => (
            <button key={n.id} onClick={() => markNotificationRead(n.id)}
              className={cn('card-court flex w-full items-start gap-3 !translate-y-0 p-4 text-left', !n.read && 'border-[var(--ball)]/40 bg-[color-mix(in_oklch,var(--ball)_5%,transparent)]')}>
              <span className={cn('mt-1 h-2 w-2 shrink-0 rounded-full', n.read ? 'bg-border' : n.kind === 'success' ? 'bg-green-400' : n.kind === 'warning' ? 'bg-amber-400' : n.kind === 'danger' ? 'bg-red-400' : 'bg-[var(--ball)]')} />
              <span className="flex-1">
                <span className="flex items-center gap-2"><span className="text-sm font-bold">{n.title}</span>{!n.read && <span className="chip border-[var(--ball)]/40 text-[var(--ball)]">Nouveau</span>}</span>
                <span className="mt-0.5 block text-sm text-muted-foreground">{n.body}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{n.time}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
