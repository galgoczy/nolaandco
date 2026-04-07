import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

const products = [
  {
    name: 'ORIGIN Core',
    slug: 'origin-core',
    description:
      'Az ORIGIN Core babapárna a klasszikus elegancia megtestesítője. Prémium minőségű, OEKO-TEX tanúsítvánnyal rendelkező anyagból készül, és személyre szabható a baba születési adataival: név, dátum, súly, hossz és időpont. Tökéletes emlék az első napokról.',
    price: 22900,
    category: 'pillow',
    series: 'origin',
    variant: 'core',
    imageUrl: '/images/products/origin-core.jpg',
    badge: null,
  },
  {
    name: 'ORIGIN Linea',
    slug: 'origin-linea',
    description:
      'Az ORIGIN Linea babapárna finom vonalvezetésű mintázatával egyedi hangulatot teremt. Hipoallergén töltete és puha huzata ideális az érzékeny bababőrnek. Személyre szabható a kicsi születési adataival, hogy örök emlék legyen.',
    price: 22900,
    category: 'pillow',
    series: 'origin',
    variant: 'linea',
    imageUrl: '/images/products/origin-linea.jpg',
    badge: null,
  },
  {
    name: 'ORIGIN Atelier',
    slug: 'origin-atelier',
    description:
      'Az ORIGIN Atelier babapárna a kézműves igényesség csúcsa. Egyedi, művészi mintázattal és prémium anyagokkal készül. A baba születési adataival személyre szabva különleges ajándék és gyönyörű emlék.',
    price: 22900,
    category: 'pillow',
    series: 'origin',
    variant: 'atelier',
    imageUrl: '/images/products/origin-atelier.jpg',
    badge: null,
  },
  {
    name: 'NOVA Core',
    slug: 'nova-core',
    description:
      'A NOVA Core babapárna modern, letisztult dizájnjával a skandináv stílus jegyében készül. Személyre szabható a baba születési adataival: név, dátum, súly, hossz és időpont. Prémium anyagok, hipoallergén töltés.',
    price: 22900,
    category: 'pillow',
    series: 'nova',
    variant: 'core',
    imageUrl: '/images/products/nova-core.jpg',
    badge: null,
  },
  {
    name: 'NOVA Linea',
    slug: 'nova-linea',
    description:
      'A NOVA Linea babapárna a modern vonalak és a puha texturák harmóniája. OEKO-TEX minősített anyagokból készül, és a baba születési adataival személyre szabható. Stílusos emlék, ami dísze lesz a babaszobának.',
    price: 22900,
    category: 'pillow',
    series: 'nova',
    variant: 'linea',
    imageUrl: '/images/products/nova-linea.jpg',
    badge: null,
  },
  {
    name: 'NOVA Atelier',
    slug: 'nova-atelier',
    description:
      'A NOVA Atelier babapárna a kortárs művészet és a bababútor találkozása. Kézzel készített, egyedi mintázatú darab, amely a baba születési adataival válik igazán személyessé. Exkluzív ajándék és dekoráció.',
    price: 22900,
    category: 'pillow',
    series: 'nova',
    variant: 'atelier',
    imageUrl: '/images/products/nova-atelier.jpg',
    badge: null,
  },
  {
    name: 'ORIGIN Poszter',
    slug: 'origin-poszter',
    description:
      'Az ORIGIN Poszter a baba születési adatait művészi formában örökíti meg. Prémium papírra nyomtatva, az Origin sorozat stílusában készül. Személyre szabható: név, dátum, súly, hossz és időpont. Gyönyörű dekoráció a babaszobába.',
    price: 5900,
    category: 'poster',
    series: 'origin',
    variant: 'core',
    imageUrl: '/images/products/origin-poszter.jpg',
    badge: null,
  },
  {
    name: 'NOVA Poszter',
    slug: 'nova-poszter',
    description:
      'A NOVA Poszter modern, minimalista dizájnnal jeleníti meg a baba születési adatait. Prémium nyomtatás, személyre szabható tartalommal: név, dátum, súly, hossz és időpont. Tökéletes ajándék és emlék.',
    price: 5900,
    category: 'poster',
    series: 'nova',
    variant: 'core',
    imageUrl: '/images/products/nova-poszter.jpg',
    badge: null,
  },
  {
    name: 'NOLA Ajándékkártya',
    slug: 'nola-ajandekkartya',
    description:
      'Digitális ajándékkártya – tökéletes ajándék várandós vagy friss szülő ismerősöknek! A megajándékozott szabadon választhat a Nola & Co. termékpalettájáról, amikor már ismeri a baba születési adatait. Válassz a négy verzió közül: Digitális poszter (6.000 Ft), Nyomtatott poszter + szállítás (14.000 Ft), Párna + digitális poszter + szállítás (26.000 Ft), vagy Párna + nyomtatott poszter + szállítás (33.000 Ft).',
    price: 6000,
    category: 'giftcard',
    series: 'nola',
    variant: 'giftcard',
    imageUrl: '/images/products/nola-ajandekkartya.jpg',
    badge: 'Ajándék',
  },
];

async function main() {
  // Clean up old gift card variants that were replaced by a single product
  const oldGiftCardSlugs = ['nola-ajandekkartya-8900', 'nola-ajandekkartya-22900', 'nola-ajandekkartya-29900'];
  for (const slug of oldGiftCardSlugs) {
    await prisma.product.deleteMany({ where: { slug } });
  }
  console.log('Cleaned up old gift card variants.');

  // --- Categories ---
  console.log('Seeding categories...');

  const categories = [
    { slug: 'pillow', name: 'Párnák', nameEn: 'KEEPSAKES', sortOrder: 0, visibleOnHome: true },
    { slug: 'poster', name: 'Poszterek', nameEn: 'ART PRINTS', sortOrder: 1, visibleOnHome: true },
    { slug: 'giftcard', name: 'Ajándékkártyák', nameEn: 'GIFT CARDS', sortOrder: 2, visibleOnHome: true },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, nameEn: cat.nameEn, sortOrder: cat.sortOrder, visibleOnHome: cat.visibleOnHome },
      create: cat,
    });
    console.log(`  Upserted category: ${cat.name}`);
  }

  console.log('Seeding products...');

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      // Don't overwrite imageUrl or images — those may have been updated via admin
      const { imageUrl, ...updateData } = product;
      await prisma.product.update({
        where: { slug: product.slug },
        data: updateData,
      });
      console.log(`  Updated (kept images): ${product.name}`);
    } else {
      await prisma.product.create({ data: product });
      console.log(`  Created: ${product.name}`);
    }
  }

  console.log('Seeding admin users...');

  const adminUsers = [
    { email: 'admin@nolaandco.hu', password: 'admin123' },
    { email: 'galgoczy.krisztina@gmail.com', password: 'google-auth-only' },
    { email: 'galgoczy.gergely@gmail.com', password: 'google-auth-only' },
  ];

  for (const admin of adminUsers) {
    const passwordHash = hashPassword(admin.password);
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: { passwordHash },
      create: { email: admin.email, passwordHash },
    });
    console.log(`  Upserted admin: ${admin.email}`);
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
