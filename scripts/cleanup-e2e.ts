/**
 * Supprime les comptes de test E2E (e2e.real.* / awa.test.*) et leurs données liées.
 * Usage : bun scripts/cleanup-e2e.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

const testUsers = await db.user.findMany({
  where: { email: { contains: '@courtlink.bj' } },
  select: { id: true, email: true },
});
const targets = testUsers.filter((u) => u.email.startsWith('e2e.real.') || u.email.startsWith('awa.test.'));

for (const u of targets) {
  await db.player.deleteMany({ where: { ownerId: u.id } });
  await db.favorite.deleteMany({ where: { userId: u.id } });
  await db.follow.deleteMany({ where: { userId: u.id } });
  await db.notification.deleteMany({ where: { userId: u.id } });
  await db.auditLog.deleteMany({ where: { actor: u.id } });
  await db.user.delete({ where: { id: u.id } });
  console.log('supprimé :', u.email);
}

if (targets.length === 0) console.log('aucun compte de test à supprimer.');
await db.$disconnect();
