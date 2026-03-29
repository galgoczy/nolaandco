import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Origin Core',
    slug: 'origin-core',
    description:
      'Az Origin Core babapárna a klasszikus elegancia megtestesítője. Prémium minőségű, OEKO-TEX tanúsítvánnyal rendelkező anyagból készül, és személyre szabható a baba születési adataival: név, dátum, súly, hossz és időpont. Tökéletes emlék az első napokról.',
    price: 14990,
    category: 'pillow',
    series: 'origin',
    variant: 'core',
    imageUrl: '/images/products/origin-core.jpg',
    badge: 'Core Series',
  },
  {
    name: 'Origin Linea',
    slug: 'origin-linea',
    description:
      'Az Origin Linea babapárna finom vonalvezetésű mintázatával egyedi hangulatot teremt. Hipoallergén töltete és puha huzata ideális az érzékeny bababőrnek. Személyre szabható a kicsi születési adataival, hogy örök emlék legyen.',
    price: 16990,
    category: 'pillow',
    series: 'origin',
    variant: 'linea',
    imageUrl: '/images/products/origin-linea.jpg',
    badge: null,
  },
  {
    name: 'Origin Atelier',
    slug: 'origin-atelier',
    description:
      'Az Origin Atelier limitált kiadású babapárna a kézműves igényesség csúcsa. Egyedi, művészi mintázattal és prémium anyagokkal készül. A baba születési adataival személyre szabva különleges ajándék és gyönyörű emlék.',
    price: 19990,
    category: 'pillow',
    series: 'origin',
    variant: 'atelier',
    imageUrl: '/images/products/origin-atelier.jpg',
    badge: 'Limited Edition',
  },
  {
    name: 'NOVA Core',
    slug: 'nova-core',
    description:
      'A NOVA Core babapárna modern, letisztult dizájnjával a skandináv stílus jegyében készül. Személyre szabható a baba születési adataival: név, dátum, súly, hossz és időpont. Prémium anyagok, hipoallergén töltés.',
    price: 14990,
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
    price: 16990,
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
      'A NOVA Atelier limitált kiadású babapárna a kortárs művészet és a bababútor találkozása. Kézzel készített, egyedi mintázatú darab, amely a baba születési adataival válik igazán személyessé. Exkluzív ajándék és dekoráció.',
    price: 19990,
    category: 'pillow',
    series: 'nova',
    variant: 'atelier',
    imageUrl: '/images/products/nova-atelier.jpg',
    badge: 'Limited Edition',
  },
  {
    name: 'Origin Poszter',
    slug: 'origin-poszter',
    description:
      'Az Origin Poszter a baba születési adatait művészi formában örökíti meg. Prémium papírra nyomtatva, az Origin sorozat stílusában készül. Személyre szabható: név, dátum, súly, hossz és időpont. Gyönyörű dekoráció a babaszobába.',
    price: 9990,
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
    price: 9990,
    category: 'poster',
    series: 'nova',
    variant: 'core',
    imageUrl: '/images/products/nova-poszter.jpg',
    badge: null,
  },
];

async function main() {
  console.log('Seeding products...');

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...product },
      create: { ...product },
    });
    console.log(`  Upserted: ${product.name}`);
  }

  console.log('Seeding admin user...');

  const adminEmail = 'admin@nolaandco.hu';
  const adminPasswordHash = hashPassword('admin123');

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: adminEmail,
      passwordHash: adminPasswordHash,
    },
  });
  console.log(`  Upserted admin: ${adminEmail}`);

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
