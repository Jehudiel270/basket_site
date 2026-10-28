import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { applyAction } from '@/lib/server/actions';

/**
 * Bus d'actions : POST /api/actions/[action] avec un corps JSON.
 * Session requise (sauf submitReport, public). Le serveur valide
 * session, rôle et propriété avant toute écriture en base.
 */
export async function POST(req: Request, ctx: { params: Promise<{ action: string }> }) {
  const { action } = await ctx.params;
  try {
    const body = await req.json().catch(() => ({}));
    const session = await getServerSession(authOptions);
    const user = session?.user?.id
      ? { id: session.user.id, name: session.user.name ?? '', role: session.user.role ?? 'player' }
      : null;
    const result = await applyAction(user, action, body);
    return NextResponse.json(result);
  } catch (e) {
    const status = (e as { status?: number }).status ?? 500;
    const message = (e as Error).message ?? 'Erreur serveur.';
    if (status >= 500) console.error(`action ${action} error`, e);
    return NextResponse.json({ error: message }, { status });
  }
}
