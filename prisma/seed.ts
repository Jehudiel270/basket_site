/**
 * CourtLink — seed de la base de données réelle.
 *
 * Usage :
 *   bun prisma/seed.ts                 → admin + plans + comptes démo + contenu de démonstration
 *   SEED_DEMO=0 bun prisma/seed.ts     → crée uniquement l'admin et les plans
 *
 * Sécurité des mots de passe :
 *   - Admin réel      : mot de passe lu depuis ADMIN_PASSWORD (aucune valeur par
 *     défaut dans le code). S'il est absent, un mot de passe aléatoire est
 *     généré et affiché UNE SEULE FOIS ici, dans la console.
 *   - Comptes démo    : créés avec des hash ALÉATOIRES — aucune connexion par
 *     mot de passe possible. L'accès visiteur passe par /api/demo-login,
 *     ouvert/fermé par un super administrateur (console Administrateurs).
 *   - Les comptes existants ne sont jamais réinitialisés par le seed.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Client lié au schéma disponible : sqlite local ou postgres selon la génération en cours.
const db = new PrismaClient();

async function main() {
  const seedDemo = process.env.SEED_DEMO !== '0';

  /* ── Admin réel (personnalisable via ADMIN_EMAIL / ADMIN_PASSWORD) ── */
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@courtlink.bj';
  const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (existingAdmin) {
    await db.user.update({ where: { email: adminEmail }, data: { isSuperAdmin: true } });
    console.log(`✔ admin réel : ${adminEmail} (super admin — mot de passe inchangé)`);
  } else if (adminPassword && adminPassword.length >= 8) {
    await db.user.create({
      data: { email: adminEmail, name: 'Administrateur CourtLink', role: 'admin', isSuperAdmin: true, passwordHash: bcrypt.hashSync(adminPassword, 10) },
    });
    console.log(`✔ admin réel : ${adminEmail} (super admin, mot de passe défini via ADMIN_PASSWORD)`);
  } else {
    const generated = 'cl-' + Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6).toUpperCase() + '!';
    await db.user.create({
      data: { email: adminEmail, name: 'Administrateur CourtLink', role: 'admin', isSuperAdmin: true, passwordHash: bcrypt.hashSync(generated, 10) },
    });
    console.log('──────────────────────────────────────────────────────');
    console.log(`✔ admin réel créé : ${adminEmail}`);
    console.log(`  MOT DE PASSE (affiché une seule fois, à noter) : ${generated}`);
    console.log('──────────────────────────────────────────────────────');
  }

  /* ── Plans tarifaires ── */
  const plans = [
    { id: 'free', name: 'Découverte', audience: 'Joueurs & parents', price: 0, features: ['Profil sportif complet', '3 candidatures par mois', 'Messagerie limitée'] },
    { id: 'pro', name: 'Pro', audience: 'Joueurs sérieux', price: 3000, features: ['Candidatures illimitées', 'Badge « profil vérifiable »', 'Statistiques avancées', 'Priorité dans les recherches'], highlighted: true },
    { id: 'club', name: 'Club Pro', audience: 'Clubs & académies', price: 25000, features: ['Pipeline de recrutement illimité', 'Publication d\u2019opportunités', 'Comparateur & rapports', '5 comptes staff'] },
    { id: 'scout', name: 'Scout', audience: 'Recruteurs indépendants', price: 15000, features: ['Répertoire complet', 'Rapports & notes privées', 'Recherches sauvegardées avec alertes'] },
  ];
  for (const p of plans) {
    await db.plan.upsert({ where: { id: p.id }, update: {}, create: { ...p, features: JSON.stringify(p.features) } });
  }
  console.log('✔ plans tarifaires');

  await db.platformSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { tagline: 'La plateforme de recrutement basketball de l\u2019Afrique de l\u2019Ouest' },
  });

  if (!seedDemo) {
    console.log('SEED_DEMO=0 → comptes démo et contenu ignorés.');
    return;
  }

  /* ── Comptes démo (hash aléatoires : aucun accès par mot de passe) ── */
  const { ensureDemoUsers, ensureDemoContent } = await import('../src/lib/server/demo-data');
  const users = await ensureDemoUsers(db);
  console.log(`✔ ${users.total} comptes démo (${users.created.length} créé(s)) — accès visiteur via la console super admin.`);

  /* ── Contenu de démonstration (idempotent) ── */
  const content = await ensureDemoContent(db, users.userIds);
  const parts = Object.entries(content).map(([k, v]) => `${v} ${k}`).join(', ');
  console.log(`✔ contenu de démonstration${parts ? ` : ${parts}` : ' (déjà complet)'} — base réelle prête.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => db.$disconnect());
