import { NextResponse } from 'next/server';
import { fedapayConfig, verifyFedapaySignature, activateSubscriptionFromFedaPay } from '@/lib/server/billing';

/**
 * POST /api/billing/webhook — filet de sécurité serveur FedaPay.
 *
 * FedaPay envoie les événements (transaction.created / approved / canceled) signés
 * via l'en-tête X-FEDAPAY-SIGNATURE (HMAC-SHA256). En cas d'échec du retour navigateur,
 * c'est ce webhook qui confirme définitivement le paiement et active l'abonnement.
 *
 * Configuration FedaPay : URL = https://<domaine>/api/billing/webhook
 * Secret : variable FEDAPAY_WEBHOOK_SECRET (obligatoire pour accepter un webhook).
 */
export async function POST(req: Request) {
  try {
    const cfg = fedapayConfig();
    if (!cfg?.webhookSecret) {
      return NextResponse.json({ error: 'Webhook non configuré (FEDAPAY_WEBHOOK_SECRET).' }, { status: 503 });
    }

    const raw = await req.text();
    const signature = req.headers.get('x-fedapay-signature');
    if (!verifyFedapaySignature(raw, signature, cfg.webhookSecret)) {
      return NextResponse.json({ error: 'Signature webhook invalide.' }, { status: 401 });
    }

    const event = JSON.parse(raw) as { name?: string; entity?: { id?: number | string; status?: string } };
    const eventName = String(event.name ?? '');

    if (eventName === 'transaction.approved' && event.entity?.id) {
      const transactionId = String(event.entity.id);
      const result = await activateSubscriptionFromFedaPay(transactionId, 'webhook');
      if (!result.ok) console.warn(`billing/webhook : activation impossible pour ${transactionId} — ${result.reason}`);
    }

    // 200 systématique pour toute signature valide : FedaPay ne doit pas re-éssayer indéfiniment.
    return NextResponse.json({ received: true, event: eventName });
  } catch (e) {
    console.error('billing/webhook error', e);
    return NextResponse.json({ error: 'Erreur serveur webhook.' }, { status: 500 });
  }
}
