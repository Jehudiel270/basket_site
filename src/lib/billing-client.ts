'use client';

/**
 * Client de facturation CourtLink.
 * Tente d'abord le paiement réel via FedaPay (mode API + clés configurées),
 * sinon laisse l'appelant conserver son tunnel de démonstration simulé.
 */

export interface CheckoutResponse {
  mode: 'fedapay' | 'simulated';
  url?: string;
  transactionId?: string;
  invoice?: string;
  warning?: string;
  error?: string;
}

/**
 * POST /api/billing/checkout → si FedaPay est configuré, redirige le navigateur
 * vers la page de paiement sécurisée (Mobile Money MTN/Moov/Orange/Wave, cartes)
 * et renvoie true. Sinon renvoie false (paiement simulé à la charge de l'appelant).
 */
export async function launchFedapayCheckout(planId: string, annual: boolean): Promise<boolean> {
  if (process.env.NEXT_PUBLIC_DATA_SOURCE !== 'api') return false;
  try {
    const res = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, annual }),
    });
    const data = (await res.json().catch(() => ({}))) as CheckoutResponse;
    if (res.ok && data.mode === 'fedapay' && typeof data.url === 'string' && data.url) {
      window.location.href = data.url;
      return true;
    }
  } catch {
    /* silencieux : bascule vers la simulation */
  }
  return false;
}
