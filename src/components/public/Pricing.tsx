'use client';

import { useState } from 'react';
import { Check, X, ChevronLeft, ShieldCheck, Smartphone, Banknote, CreditCard, BadgePercent, RotateCcw, Loader2 } from 'lucide-react';
import { navigate } from '@/lib/router';
import { useCourtLink } from '@/lib/store';
import { launchFedapayCheckout } from '@/lib/billing-client';
import { SectionHead } from '@/components/common/Bits';
import { cn } from '@/lib/utils';

export function PricingPage() {
  const { plans, checkout, subscription, role, loggedIn } = useCourtLink();
  const [annual, setAnnual] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [method, setMethod] = useState('Mobile Money');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paying, setPaying] = useState(false);

  /** Paiement réel via FedaPay si configuré (mode API + clés), sinon tunnel de démonstration. */
  const pay = async () => {
    if (!plan || paying) return;
    setPaying(true);
    try {
      const redirected = await launchFedapayCheckout(plan.id, annual);
      if (redirected) return; // navigation vers la page de paiement FedaPay
      setStep(3);
      checkout(plan, method);
    } finally {
      setPaying(false);
    }
  };

  const plan = plans.find(p => p.id === checkoutPlan);
  const price = plan ? (annual ? plan.price * 10 : plan.price) : 0;

  const faq = [
    { q: 'Un abonnement garantit-il d\'être recruté ?', a: 'Non. Les offres achètent uniquement des fonctionnalités (visibilité, outils de suivi, recherches avancées). Aucune sélection, bourse ou contrat n\'est lié à un paiement.' },
    { q: 'Puis-je payer en Mobile Money ?', a: 'Oui : les paiements passent par FedaPay, l\u2019agr\u00e9gateur ouest-africain — MTN MoMo, Moov Money, Orange Money, Wave et cartes Visa/Mastercard, factur\u00e9s en FCFA. En mode d\u00e9monstration sans cl\u00e9s FedaPay configur\u00e9es, le tunnel reste simul\u00e9.' },
    { q: 'Le compte joueur est-il vraiment gratuit ?', a: 'Oui : profil complet, 3 candidatures par mois et messagerie avec les comptes vérifiés, sans carte bancaire.' },
    { q: 'Comment modifier mon offre ?', a: 'Depuis votre espace, rubrique Abonnement : la migration prend effet immédiatement dans la démonstration.' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <button onClick={() => navigate('/')} className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-[var(--ball)]"><ChevronLeft size={13} /> Accueil</button>
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="font-display text-3xl font-black md:text-5xl">Des offres simples, <span className="text-gradient-ball">en FCFA</span></h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Le compte joueur est gratuit pour toujours. Les offres payantes débloquent des outils concrets : visibilité prioritaire, recherches avancées, gestion d'effectif ou d'événements. Les prix affichés sont des valeurs de démonstration configurables depuis l'administration.
        </p>
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border bg-card p-1.5 pl-5 text-sm">
          <span className={cn(!annual && 'font-bold')}>Mensuel</span>
          <button onClick={() => setAnnual(!annual)} className={cn('relative h-6 w-11 rounded-full transition-colors', annual ? 'bg-[var(--ball)]' : 'bg-muted')} aria-label="Basculer annuel/mensuel">
            <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all', annual ? 'left-[22px]' : 'left-0.5')} />
          </button>
          <span className={cn(annual && 'font-bold')}>Annuel</span>
          <span className="chip border-[var(--ball)]/50 text-[var(--ball)]">-2 mois offerts</span>
        </div>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {plans.filter(p => p.active).map((p, i) => {
          const isCurrent = subscription?.planId === p.id;
          const display = annual ? p.price * 10 : p.price;
          return (
            <div key={p.id} className={cn('card-court relative flex flex-col p-6', p.highlighted && 'border-[var(--ball)]/60 shadow-[0_20px_60px_-20px_color-mix(in_oklch,var(--ball)_40%,transparent)]')} style={{ animationDelay: `${i * 70}ms` }}>
              {p.highlighted && <span className="chip absolute -top-2.5 left-6 border-[var(--ball)] bg-[var(--ball)] text-black">Le plus choisi</span>}
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{p.audience}</p>
              <p className="mt-4 font-display text-4xl font-black tnum">
                {display === 0 ? '0 F' : `${display.toLocaleString('fr-FR')} F`}
                <span className="text-sm font-medium text-muted-foreground"> /{annual ? 'an' : p.period}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map(f => (
                  <li key={f} className="flex gap-2 text-sm text-muted-foreground"><Check size={15} className="mt-0.5 shrink-0 text-[var(--ball)]" />{f}</li>
                ))}
              </ul>
              {loggedIn && role !== 'visitor' ? (
                isCurrent ? (
                  <span className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 py-2.5 text-sm font-semibold text-green-400">Offre actuelle</span>
                ) : (
                  <button onClick={() => { setCheckoutPlan(p.id); setStep(1); }} className={cn('mt-6', p.highlighted ? 'btn-ball' : 'btn-ghosty')}>
                    Choisir {p.name}
                  </button>
                )
              ) : (
                <button onClick={() => navigate('/connexion')} className={cn('mt-6', p.highlighted ? 'btn-ball' : 'btn-ghosty')}>Se connecter pour souscrire</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mx-auto mt-16 max-w-3xl">
        <SectionHead eyebrow="Questions fréquentes" title="Tarifs, paiement et confiance" />
        <div className="space-y-3">
          {faq.map(f => (
            <details key={f.q} className="card-court group p-5 [&[open]]:border-[var(--ball)]/40">
              <summary className="cursor-pointer list-none font-display text-sm font-bold marker:hidden">
                <span className="mr-2 text-[var(--ball)]">+ </span>{f.q}
              </summary>
              <p className="mt-3 pl-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-8 flex items-start gap-3 rounded-xl border border-[var(--amber-glow)]/40 bg-[color-mix(in_oklch,var(--amber-glow)_8%,transparent)] p-4">
          <BadgePercent size={18} className="mt-0.5 shrink-0 text-[var(--amber-glow)]" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Transparence :</strong> aucun tarif présenté ici ne provient d'une étude de marché validée — ce sont des valeurs de démonstration éditables par l'administrateur. Les offres partenaires (visibilité publicitaire, événements sponsorisés) sont contractualisées séparément avant tout lancement réel.
          </p>
        </div>
      </div>

      {/* Checkout simulé */}
      {checkoutPlan && plan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => { setCheckoutPlan(null); }}>
          <div className="card-court w-full max-w-md !translate-y-0 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="border-b border-border bg-[var(--court)] p-5">
              <div className="flex items-center justify-between">
                <span className="font-score text-xs tracking-[0.2em] text-[var(--ball)]">COURTLINK · PAIEMENT</span>
                <button onClick={() => setCheckoutPlan(null)} className="text-muted-foreground hover:text-foreground"><X size={17} /></button>
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                {['Panier', 'Paiement', 'Confirmation'].map((s, i) => (
                  <span key={s} className={cn('flex items-center gap-1.5', i + 1 <= step && 'text-[var(--ball)] font-semibold')}>
                    <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border text-[9px] tnum', i + 1 <= step ? 'border-[var(--ball)] bg-[var(--ball)] text-black' : 'border-border')}>{i + 1}</span>
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-5">
              {step === 1 && (
                <div className="fade-up">
                  <p className="font-display text-lg font-bold">{plan.name}</p>
                  <p className="text-sm text-muted-foreground">{plan.audience} · {annual ? 'engagement 12 mois' : 'sans engagement'}</p>
                  <div className="my-4 space-y-2 rounded-lg bg-muted/50 p-4 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="tnum">{price.toLocaleString('fr-FR')} FCFA</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Frais de service</span><span className="tnum">0 FCFA</span></div>
                    <div className="flex justify-between border-t border-border pt-2 font-bold"><span>Total</span><span className="tnum text-[var(--ball)]">{price.toLocaleString('fr-FR')} FCFA</span></div>
                  </div>
                  <button onClick={() => setStep(2)} className="btn-ball w-full">Passer au paiement</button>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><ShieldCheck size={12} /> Paiement sécurisé via FedaPay — Mobile Money et cartes, en FCFA</p>
                </div>
              )}
              {step === 2 && (
                <div className="fade-up">
                  <p className="mb-3 text-sm font-semibold">Moyen de paiement</p>
                  <div className="space-y-2">
                    {[
                      { n: 'Mobile Money', d: 'MTN MoMo · Moov · Orange Money', icon: Smartphone },
                      { n: 'Carte bancaire', d: 'Visa · Mastercard', icon: CreditCard },
                      { n: 'Virement bancaire', d: 'Banques locales UEMOA', icon: Banknote },
                    ].map(m => (
                      <button key={m.n} onClick={() => setMethod(m.n)} className={cn('flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors', method === m.n ? 'border-[var(--ball)] bg-[color-mix(in_oklch,var(--ball)_10%,transparent)]' : 'border-border hover:border-[var(--ball)]/50')}>
                        <m.icon size={18} className={method === m.n ? 'text-[var(--ball)]' : 'text-muted-foreground'} />
                        <span><span className="block text-sm font-semibold">{m.n}</span><span className="text-xs text-muted-foreground">{m.d}</span></span>
                        {method === m.n && <Check size={16} className="ml-auto text-[var(--ball)]" />}
                      </button>
                    ))}
                  </div>
                  {method === 'Mobile Money' && (
                    <input placeholder="+229 97 00 00 00" className="mt-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
                  )}
                  {method === 'Carte bancaire' && (
                    <input placeholder="4242 4242 4242 4242" className="mt-3 h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-[var(--ball)]" />
                  )}
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => setStep(1)} className="btn-ghosty flex-1" disabled={paying}>Retour</button>
                    <button onClick={pay} className="btn-ball flex-1" disabled={paying}>
                      {paying ? <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Ouverture…</span> : `Payer ${price.toLocaleString('fr-FR')} F`}
                    </button>
                  </div>
                  {paying && <p className="mt-2 text-center text-[11px] text-muted-foreground">Connexion sécurisée à FedaPay en cours…</p>}
                </div>
              )}
              {step === 3 && (
                <div className="fade-up py-4 text-center">
                  <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-400"><Check size={28} /></span>
                  <p className="font-display text-xl font-bold">Paiement simulé confirmé</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.name} est actif dans la démonstration. Votre facture {`CL-2026-XXXX`} apparaît dans votre espace Abonnement.
                  </p>
                  <div className="mt-5 flex gap-2">
                    <button onClick={() => setCheckoutPlan(null)} className="btn-ghosty flex-1">Fermer</button>
                    <button onClick={() => { setCheckoutPlan(null); navigate('/app/abonnement'); }} className="btn-ball flex-1">Voir mon abonnement</button>
                  </div>
                  <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground"><RotateCcw size={11} /> Les données peuvent être réinitialisées depuis les paramètres admin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
