import { NextResponse } from 'next/server';
import { encode } from 'next-auth/jwt';
import { db } from '@/lib/db';
import { demoAccountsActive, DEMO_USERS } from '@/lib/server/demo-data';
import { authOptions } from '@/lib/auth';

/**
 * Connexion visiteur « données de démonstration » — SANS mot de passe.
 *
 * Principe de sécurité :
 *   - La route ne fonctionne QUE si un super administrateur a ouvert les accès
 *     démo (dernière entrée d'audit « Comptes démo : ACCÈS OUVERT »).
 *   - Elle ne connecte QUE les 8 comptes @demo.courtlink connus (liste fixe).
 *   - Les comptes démo ont des hash de mot de passe aléatoires : même quelqu'un
 *     qui connaîtrait d'anciens mots de passe publiés ne peut PAS se connecter
 *     via le formulaire classique tant que le mode démo n'est pas ouvert.
 *   - Limité en débit (mémoire de processus) pour freiner les abus.
 */

const RATE: { ip: string; count: number; reset: number }[] = [];
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 10;

function rateLimited(ip: string): boolean {
  const t = Date.now();
  const slot = RATE.find(r => r.ip === ip && r.reset > t);
  if (!slot) {
    RATE.push({ ip, count: 1, reset: t + WINDOW_MS });
    if (RATE.length > 500) RATE.splice(0, RATE.length - 500);
    return false;
  }
  slot.count += 1;
  return slot.count > MAX_PER_WINDOW;
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans une minute.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const role = String(body?.role ?? '');
    const demoUser = DEMO_USERS.find(u => u.role === role);
    if (!demoUser) {
      return NextResponse.json({ error: 'Rôle de démonstration inconnu.' }, { status: 400 });
    }

    const active = await demoAccountsActive(db);
    if (!active) {
      return NextResponse.json({ error: 'Les accès de démonstration sont désactivés par l’administration.' }, { status: 403 });
    }

    const user = await db.user.findUnique({ where: { email: demoUser.email } });
    if (!user) {
      return NextResponse.json({ error: 'Comptes de démonstration absents — un administrateur peut les charger depuis la console.' }, { status: 404 });
    }

    // Fabrique la session JWT (même encodage que NextAuth, même secret).
    const maxAge = 60 * 60 * 12; // session démo courte : 12 h
    const token = await encode({
      secret: authOptions.secret as string,
      maxAge,
      token: { sub: user.id, id: user.id, role: user.role, name: user.name, email: user.email },
    });
    if (!token) {
      return NextResponse.json({ error: 'Session impossible.' }, { status: 500 });
    }

    const secure = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false;
    const name = secure ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
    const res = NextResponse.json({ ok: true, role: user.role, name: user.name });
    res.cookies.set(name, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge,
    });
    return res;
  } catch (e) {
    console.error('demo-login error', e);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
