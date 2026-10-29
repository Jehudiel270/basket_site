import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { fedapayConfig, createFedaPayCheckout, attachPendingOwner } from '@/lib/server/billing';

/**
 * POST /api/billing/checkout  { planId: string, annual?: boolean }
 *
 * Lance la souscription d'un abonnement :
 *  - FedaPay configuré → crée la transaction réelle et renvoie { mode: 'fedapay', url }
 *    (le client redirige vers la page de paiement FedaPay : Mobile Money + cartes) ;
 *  - sans clés → { mode: 'simulated' } et le client conserve son tunnel de démonstration.
 *
 * Le montant est TOUJOURS relu côté serveur depuis la table Plan — jamais confié au client.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Session requise.' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { planId?: string; annual?: boolean };
    const planId = String(body.planId ?? '');
    const annual = Boolean(body.annual);
    if (!planId) return NextResponse.json({ error: 'Offre manquante.' }, { status: 400 });

    const plan = await db.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) return NextResponse.json({ error: 'Offre introuvable ou inactive.' }, { status: 404 });
    if (plan.price <= 0) return NextResponse.json({ error: 'Cette offre est gratuite — aucune souscription nécessaire.' }, { status: 400 });

    const cfg = fedapayConfig();
    if (!cfg) return NextResponse.json({ mode: 'simulated' });

    const origin = (process.env.FEDAPAY_BASE_URL ?? new URL(req.url).origin).trim();
    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 404 });

    try {
      const checkout = await createFedaPayCheckout({
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone,
        planId: plan.id,
        planName: plan.name,
        planPrice: plan.price,
        annual,
        origin,
      });
      await attachPendingOwner(checkout.transactionId, user.id);
      return NextResponse.json({ mode: 'fedapay', ...checkout });
    } catch (e) {
      console.error('billing/checkout : erreur FedaPay', e);
      return NextResponse.json(
        { mode: 'simulated', warning: `Paiement FedaPay indisponible : ${(e as Error).message}` },
        { status: 200 },
      );
    }
  } catch (e) {
    console.error('billing/checkout error', e);
    return NextResponse.json({ error: 'Erreur serveur lors de la création du paiement.' }, { status: 500 });
  }
}
