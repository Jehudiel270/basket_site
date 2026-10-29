/**
 * Relit un champ du Player possédé par l'utilisateur (email en argument).
 * Usage : bun scripts/check-player.ts <email>
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const email = process.argv[2] ?? '';

const u = await db.user.findUnique({ where: { email } });
if (!u) {
  console.error('UTILISATEUR_ABSENT');
  process.exit(1);
}
const pl = await db.player.findFirst({ where: { ownerId: u.id } });
console.log(JSON.stringify({ city: pl?.city ?? '', bio: (pl?.bio ?? '').slice(0, 40) }));
await db.$disconnect();
