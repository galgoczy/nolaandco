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

  // Pici Piac kártyák — kötegenként. Csak létrehoz: a már kikapart kártyák
  // állapotát (nyeremény, e-mail) nem bántja. A tokenek véletlenek, nem
  // sorszámok, így a többi kártya nem találgatható ki.
  console.log('Seeding promo cards...');
  const promoBatches: Record<string, string[]> = {
    // Az első próbakör 10 kártyája (kettő már lekaparva a teszteléskor).
    'pici-piac-teszt': [
      'TTBMYWQK', '42JH2KXP', 'AA52NNGD', '3MCG9MHK', '7VKAEHWW',
      'FPSYHWH2', '4K4HB7CJ', 'YEA7K4GR', '9R3XGP6Y', '2NTEJSSG',
    ],
    // Második próbakör — az adminból visszaállítható.
    'pici-piac-teszt-2': [
    'GY7WF85K', 'H64976BS', 'KZRPK4NF', 'EANGZWE9', 'UDYHSXQF',
    'X6CHZ7B8', 'J3GTWHTQ', 'MKJ7KHUP', '5DAPDMVB', 'D8UG35VP',
    ],
    // Az 50 éles vásári kártya.
    'pici-piac-2026': [
    'CPA3B4GM', 'SUCM5EVX', 'TSZNNE37', '4QHV75Y7', 'T6QEWX35',
    'AUBR8JS4', 'E578CJQF', 'Q5N9AEN6', '9GW6TEAN', '9EETBZH6',
    '4W2J6EA5', 'W6ETRV2J', 'XYMMKT3H', 'BUEKS8DU', 'XEKCVUXH',
    'CFPCHN7H', '3ABHMYM9', 'RW4R6EDA', 'BKS56KTM', '65RXHD5S',
    '29C75NZP', 'CSNA46BN', 'B8JNTGK7', 'HJWAKZF5', 'ZS8MMH63',
    '9DGC5RKY', 'V9TX4QSS', 'Q26BJYZF', 'E896XY2X', 'SKZJDHD4',
    'BT39FJ8X', 'KZ6PR35M', 'P6BGEJKB', 'W9B45BJ5', '8K34DRV2',
    'CN3UMDW5', 'ECVMK4DD', 'K5JBEHMT', 'SVR9F4CE', 'SMWVYTDN',
    '9FA3AP9Q', 'D2TQHKUX', 'WPZRUAVG', 'X3QKQN3H', 'XHEJQWBR',
    'YEMNW8EJ', 'BZPC4MQR', '4HNHV7YY', '85TH85RM', 'AGJPSW3M',
    ],
  };
  for (const [batch, tokens] of Object.entries(promoBatches)) {
    for (const token of tokens) {
      await prisma.promoCard.upsert({ where: { token }, update: {}, create: { token, batch } });
    }
    console.log(`  ${batch}: ${tokens.length} kártya rendben`);
  }

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
