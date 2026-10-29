/**
 * Affiche l'id du profil Player possédé par l'utilisateur (email en argument).
 * Sert aussi de preuve que l'inscription a bien auto-créé la ligne Player en BDD.
 * Usage : source scripts/real-env.sh && bun scripts/get-player-id.ts <email>
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const email = process.argv[2] ?? '';

const u = await db.user.findUnique({ where: { email } });
if (!u) {
  console.error('UTILISATEUR ABSENT');
  process.exit(1);
}
const pl = await db.player.findFirst({ where: { ownerId: u.id } });
console.log(pl?.id ?? 'PLAYER_ABSENT');
await db.$disconnect();
