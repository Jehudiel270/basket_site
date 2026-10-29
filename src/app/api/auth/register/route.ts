import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';

/**
 * Inscription réelle — email + mot de passe, SANS email de vérification.
 * Rôles ouverts à l'inscription : player, guardian, club, scout, organizer.
 * (moderator / support / admin sont créés uniquement par l'admin ou le seed.)
 */
const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
  role: z.enum(['player', 'guardian', 'club', 'scout', 'organizer']),
  country: z.string().max(60).optional(),
  phone: z.string().max(30).optional(),
  orgName: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Champs invalides — vérifiez le formulaire (mot de passe : 8 caractères minimum).' }, { status: 400 });
    }
    const { name, email, password, role, country, phone, orgName } = parsed.data;
    const emailLower = email.toLowerCase().trim();

    const existing = await db.user.findUnique({ where: { email: emailLower } });
    if (existing) {
      return NextResponse.json({ error: 'Un compte existe déjà avec cette adresse e-mail.' }, { status: 409 });
    }

    const user = await db.user.create({
      data: {
        email: emailLower,
        name: name.trim(),
        role,
        country: country || null,
        phone: phone || null,
        passwordHash: bcrypt.hashSync(password, 10),
      },
    });

    /* Profil métier auto-créé selon le rôle */
    if (role === 'player') {
      await db.player.create({ data: {
        id: `u-${user.id}`, name: name.trim(), country: country || 'Bénin',
        position: 'Polyvalent', rating: 5, bio: 'Nouveau joueur sur CourtLink.',
        ownerId: user.id, visibility: 'members',
      } });
    }
    if (role === 'club') {
      await db.organization.create({ data: {
        id: `u-${user.id}`, name: orgName?.trim() || name.trim(), type: 'Club',
        country: country || 'Bénin', ownerId: user.id, verificationStatus: 'non vérifiée',
        description: 'Nouvelle structure sur CourtLink — vérification documentaire à compléter.',
      } });
    }

    return NextResponse.json({ ok: true, userId: user.id, role }, { status: 201 });
  } catch (e) {
    console.error('register error', e);
    return NextResponse.json({ error: 'Erreur serveur lors de l\u2019inscription.' }, { status: 500 });
  }
}
