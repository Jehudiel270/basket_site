'use client';

/**
 * CourtLink — retour de paiement FedaPay.
 * FedaPay ramène l'utilisateur ici après la page de paiement avec transaction_id.
 * La page vérifie le statut réel auprès de FedaPay (via /api/billing/verify),
 * affiche le résultat et ramène l'utilisateur vers son espace Abonnement.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, XCircle, Loader2, ArrowRight } from 'lucide-react';

type State =
  | { kind: 'loading' }
  | { kind: 'approved' }
  | { kind: 'pending'; detail?: string }
  | { kind: 'failed'; detail: string };

const STATUS_LABEL: Record<string, string> = {
  pending: 'Paiement en cours de validation',
  declined: 'Paiement refusé par l\u2019opérateur',
  canceled: 'Paiement annulé',
  transferred: 'Paiement transféré',
  refunded: 'Paiement remboursé',
};

export default function FedapayRetourPage() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const transactionId = params.get('transaction_id') || params.get('id') || '';
    if (!transactionId) {
      setState({ kind: 'failed', detail: 'Aucune transaction à vérifier (paramètre transaction_id absent).' });
      return;
    }
    (async () => {
      try {
        const res = await fetch('/api/billing/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionId }),
        });
        const data = (await res.json().catch(() => ({}))) as { status?: string; error?: string };
        if (res.status === 401) {
          setState({ kind: 'failed', detail: 'Session expirée — reconnectez-vous puis revenez sur cette page.' });
          return;
        }
        if (data.status === 'approved') { setState({ kind: 'approved' }); return; }
        if (data.status) { setState({ kind: 'pending', detail: STATUS_LABEL[data.status] ?? data.status }); return; }
        setState({ kind: 'failed', detail: data.error ?? 'Vérification impossible pour le moment.' });
      } catch {
        setState({ kind: 'failed', detail: 'Serveur indisponible — réessayez dans un instant.' });
      }
    })();
  }, []);

  const block =
    state.kind === 'approved'
      ? { icon: <CheckCircle2 size={40} className="text-green-400" />, title: 'Paiement confirmé', text: 'Votre abonnement CourtLink est actif. La facture correspondante apparaît dans votre espace Abonnement.', tone: 'border-green-500/40 bg-green-500/5' }
      : state.kind === 'pending'
        ? { icon: <Clock3 size={40} className="text-amber-400" />, title: 'Paiement en cours', text: state.detail ? `${state.detail}. L\u2019abonnement s\u2019activera automatiquement dès la confirmation de l\u2019opérateur.` : 'L\u2019abonnement s\u2019activera automatiquement dès la confirmation de l\u2019opérateur.', tone: 'border-amber-500/40 bg-amber-500/5' }
        : state.kind === 'failed'
          ? { icon: <XCircle size={40} className="text-red-400" />, title: 'Paiement non abouti', text: state.detail, tone: 'border-red-500/40 bg-red-500/5' }
          : { icon: <Loader2 size={40} className="animate-spin text-[var(--ball)]" />, title: 'Vérification du paiement', text: 'Nous interrogeons FedaPay pour confirmer votre transaction. Ne fermez pas cette page.', tone: 'border-border' };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--court)] p-4">
      <div className={`card-court w-full max-w-lg border p-8 text-center ${block.tone}`}>
        <p className="font-score text-xs tracking-[0.25em] text-[var(--ball)]">COURTLINK · FEDAPAY</p>
        <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-full bg-black/20">{block.icon}</div>
        <h1 className="mt-4 font-display text-2xl font-black">{block.title}</h1>
        {block.text && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{block.text}</p>}
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Link href="/" className="btn-ghosty flex-1 justify-center">Accueil</Link>
          <a href="/#/app/abonnement" className="btn-ball flex-1 justify-center">Mon abonnement <ArrowRight size={15} /></a>
        </div>
        <p className="mt-5 text-[11px] leading-relaxed text-muted-foreground">
          Paiement sécurisé FedaPay — MTN MoMo, Moov Money, Orange Money, Wave et cartes Visa/Mastercard, en FCFA.
        </p>
      </div>
    </div>
  );
}
