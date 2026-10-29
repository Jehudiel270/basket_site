import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

/**
 * Authentification réelle de CourtLink.
 * - Email + mot de passe (haché bcrypt), sessions JWT signées.
 * - AUCUN email de vérification (choix produit : « pas mail »).
 * - Le rôle est stocké dans le JWT et exposé dans la session.
 * - Anti force brute : tentatives plafonnées par e-mail + IP (mémoire de processus).
 */

/* ── Anti force brute : max 8 tentatives / 5 min par clé « email + IP » ── */
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 5 * 60_000;
const attempts = new Map<string, { n: number; reset: number }>();

function attemptKey(email: string, ip: string): string {
  return `${email.toLowerCase()}|${ip}`;
}

function tooManyAttempts(key: string): boolean {
  const a = attempts.get(key);
  if (!a) return false;
  if (a.reset < Date.now()) { attempts.delete(key); return false; }
  return a.n >= MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const a = attempts.get(key);
  if (a && a.reset >= Date.now()) a.n += 1;
  else attempts.set(key, { n: 1, reset: Date.now() + WINDOW_MS });
  // hygiène mémoire : purge des entrées expirées
  if (attempts.size > 2000) {
    const t = Date.now();
    for (const [k, v] of attempts) if (v.reset < t) attempts.delete(k);
  }
}

function clearAttempts(key: string) { attempts.delete(key); }

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  pages: { signIn: '/connexion' },
  providers: [
    Credentials({
      name: 'CourtLink',
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials, req) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password;
        if (!email || !password) return null;
        const ip = (typeof req === 'object' && req && 'headers' in req
          ? (req as Request).headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local'
          : 'local');
        const key = attemptKey(email, ip);
        if (tooManyAttempts(key)) return null; // message générique : aucune fuite d'information
        const user = await db.user.findUnique({ where: { email } });
        const ok = !!user && bcrypt.compareSync(password, user.passwordHash);
        if (!user || !ok) { recordFailure(key); return null; }
        clearAttempts(key);
        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'player';
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
