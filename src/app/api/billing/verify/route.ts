import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFedaPayTransaction, activateSubscriptionFromFedaPay } from '@/lib/server/billing';

/**
 * POST /api/billing/verify  { transactionId: string }
 *
 * Vérifie auprès de FedaPay le statut réel d'une transaction revenue depuis la page
 * de paiement, puis active l'abonnement si elle est approuvée. Sécurité :
 *  - session obligatoire ;
 *  - le paiement local (fpay-<txId>) doit appartenir à l'utilisateur connecté.
 * Idempotent : appeler deux fois ne crée jamais de doublon.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Session requise.' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { transactionId?: string };
    const transactionId = String(body.transactionId ?? '').trim();
    if (!transactionId) return NextResponse.json({ error: 'transactionId manquant.' }, { status: 400 });

    const status = await getFedaPayTransaction(transactionId);

    if (status.status === 'approved') {
      const { db } = await import('@/lib/db');
      const payment = await db.payment.findUnique({ where: { id: `fpay-${transactionId}` } });
      if (payment && payment.userId !== session.user.id) {
        return NextResponse.json({ error: 'Ce paiement n\u2019appartient pas à votre compte.' }, { status: 403 });
      }
      const result = await activateSubscriptionFromFedaPay(transactionId, 'retour utilisateur');
      if (!result.ok) return NextResponse.json({ error: result.reason }, { status: 404 });
      return NextResponse.json({ status: 'approved', already: Boolean(result.already) });
    }

    return NextResponse.json({ status: status.status });
  } catch (e) {
    console.error('billing/verify error', e);
    return NextResponse.json({ error: 'Vérification FedaPay impossible pour le moment.' }, { status: 500 });
  }
}
