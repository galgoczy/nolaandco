import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/lib/auth';
import { syncCatalog } from '../src/lib/catalogSync';

async function main() {
  // Catalog (categories, products, aliases) — shared with the admin
  // "Katalógus frissítés" button.
  const log = await syncCatalog();
  for (const line of log) console.log(`  ${line}`);

  console.log('Seeding admin users...');

  const adminUsers = [
    { email: 'admin@nolaandco.hu', password: 'admin123' },
    { email: 'galgoczy.krisztina@gmail.com', password: 'google-auth-only' },
    { email: 'galgoczy.gergely@gmail.com', password: 'google-auth-only' },
  ];

  // Create-only: existing admin accounts (and their passwords) are never
  // touched on re-seed, so a catalog refresh can't reset anyone's login.
  for (const admin of adminUsers) {
    const existing = await prisma.adminUser.findUnique({ where: { email: admin.email } });
    if (existing) {
      console.log(`  Admin exists, skipped: ${admin.email}`);
      continue;
    }
    const passwordHash = hashPassword(admin.password);
    await prisma.adminUser.create({ data: { email: admin.email, passwordHash } });
    console.log(`  Created admin: ${admin.email}`);
  }

  // Pici Piac tesztkártyák: 10 rögzített token a folyamat kipróbálásához.
  // Csak létrehoz — a már kikapart kártyák állapotát nem bántja.
  console.log('Seeding promo test cards...');
  const testTokens = [
    'TTBMYWQK', '42JH2KXP', 'AA52NNGD', '3MCG9MHK', '7VKAEHWW',
    'FPSYHWH2', '4K4HB7CJ', 'YEA7K4GR', '9R3XGP6Y', '2NTEJSSG',
  ];
  for (const token of testTokens) {
    await prisma.promoCard.upsert({
      where: { token },
      update: {},
      create: { token, batch: 'pici-piac-teszt' },
    });
  }
  console.log(`  ${testTokens.length} promo test cards ready`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
