import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildState } from '@/lib/server/data';

/**
 * Snapshot complet de l'état CourtLink, scoppé par la session.
 * Sans session → données publiques uniquement (annuaire, opportunités, événements, plans).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user?.id
      ? { id: session.user.id, name: session.user.name ?? '', role: session.user.role ?? 'player' }
      : null;
    const state = await buildState(user);
    return NextResponse.json(state);
  } catch (e) {
    console.error('state error', e);
    return NextResponse.json({ error: 'Impossible de charger l\u2019état.' }, { status: 500 });
  }
}
