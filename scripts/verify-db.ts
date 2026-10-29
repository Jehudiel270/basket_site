/**
 * Vérification du contenu réel de la base Neon — compte les lignes des tables clés.
 * Usage : source scripts/real-env.sh && bun scripts/verify-db.ts
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const [users, players, orgs, opps, apps, events, convos, notifs, payments, plans, audit, favorites] =
    await Promise.all([
      db.user.count(),
      db.player.count(),
      db.organization.count(),
      db.opportunity.count(),
      db.application.count(),
      db.courtEvent.count(),
      db.conversation.count(),
      db.notification.count(),
      db.payment.count(),
      db.plan.count(),
      db.auditLog.count(),
      db.favorite.count(),
    ]);
  console.log('── Contenu réel de Neon ──');
  console.log({ users, players, orgs, opps, apps, events, convos, notifs, payments, plans, audit, favorites });

  const demoClub = await db.user.findUnique({ where: { email: 'club@demo.courtlink' } });
  console.log('club@demo.courtlink →', demoClub ? `role=${demoClub.role}, orgId=${demoClub.orgId}` : 'ABSENT');

  const e2e = await db.user.findUnique({ where: { email: 'awa.test.e2e@courtlink.bj' } });
  console.log(
    'awa.test.e2e (test session précédente, était en SQLite) →',
    e2e ? 'présent (surprenant)' : 'absent (attendu : il était dans la SQLite sandbox)',
  );
  const e2ePlayer = e2e ? await db.player.findFirst({ where: { ownerId: e2e.id } }) : null;
  console.log('  └ player lié →', e2ePlayer ? e2ePlayer.name : 'aucun');
}

main()
  .catch((e) => {
    console.error('ERREUR:', e.message);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
