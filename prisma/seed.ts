import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

const capeLongDescription = `A kisbabák az emlékeket, a nagyok a kalandokat kapják!
Amikor egy kistestvér érkezik a családba, minden figyelem rá irányul. A Nola & Co Kalandköpenyt azért álmodtuk meg, hogy a nagyobb testvérek is megkapják a saját, személyre szabott "szupererejüket".
Legyen szó a világ megmentéséről a nappaliban, királyi teapartiról a kertben, egy családi fotózásról, vagy a kistesó büszke védelmezéséről – ez a pillekönnyű, prémium köpeny évekig a legszebb kelléke lesz a gyermekkori varázslatnak.

**Miért ez a legtökéletesebb ajándék?**

**Kifordítható dizájn (2 az 1-ben):** Két gyönyörű, harmonizáló földszín/pasztell árnyalat egy köpenyben. Az egyik oldalán ott a vagány, egyedi logó a rohangáláshoz, ha pedig kifordítjátok, egy letisztult, elegáns, egyszínű köpenyt kaptok az ünnepekre vagy fotózásokra, királyi eseményekre.

**Személyre szabott varázslat:** A köpeny hátára puha filcből, gondos odafigyeléssel varrjuk fel a gyerek saját kezdőbetűjét vagy az egyedi "TESÓ" pajzsot.

**Pillekönnyű és prémium:** 100% OEKO-TEX® minősítésű pamut duplagézből (muszlinból) készül. Elképesztően puha, légáteresztő, és gyönyörűen, lágyan lobog a gyerekek után futás közben.

**Maximális biztonság és kényelem:** Felejtsd el a karcoló, hajba ragadó tépőzárakat vagy a veszélyes megkötőket! A köpenyt biztonságos és prémium műanyag patentokkal láttuk el, amit a gyerekek is könnyen be tudnak kapcsolni, de ha beakadna valahova, azonnal szétpattan.

**Együtt nő a gyermekkel (One Size):** A kb. 65 cm-es hossznak köszönhetően egy 2 évesen még bokáig érő "varázslóköpeny", 6-7 éves korra pedig tökéletes "szuperhős" méretté válik.

(Tipp: Tedd teljessé a varázslatot! Keresd a köpenyhez színben passzoló kétoldalas koronáinkat, és szerezd be őket szettben, kedvezményes áron!)

**Fontos információk az előrendeléshez:** Mivel minden köpeny egyedileg, a Ti kérésetek alapján, kézzel készül a műhelyünkben, a feldolgozási és varrási idő jelenleg **5-8 munkanap** a feladásig. Köszönjük a türelmeteket!

**Anyagösszetétel és kezelés:**
Alapanyag: 100% OEKO-TEX 100 minősítésű Pamut (Duplagéz) a díszítés kivételével.
Mosás: 30°C-os kímélő gépi programon, vagy kézzel mosható. Szárítógépben nem szárítható. Figyelem: A hátsó filc díszítés egyáltalán nem vasalható, illetve a duplagéz anyagot jellegéből adódóan szintén nem javasoljuk vasalni. Fektetve, formára igazítva szárítandó.`;

const crownLongDescription = `Legyen szó egy különleges születésnapi fotózásról, egy királyi teadélutánról, vagy a kistestvér védelmezéséről – a Nola & Co puha koronája a legszebb kiegészítő a kicsik nagy pillanataihoz.
Felejtsd el a karcoló műanyagokat, a szoros pántokat és az egyszer használatos papírkoronákat! Ezt a koronát úgy terveztük, hogy a gyerekek észre se vegyék, hogy viselik, a fotókon pedig prémium, letisztult skandináv hangulatot sugározzon.

**Miért fogjátok imádni?**

**Kifordítható dizájn (2 az 1-ben):** A korona kétoldalas! Két harmonizáló, gyönyörű földszín/pasztell árnyalatból áll, így egyetlen mozdulattal a napi öltözékhez vagy a fotózás hangulatához igazíthatjátok.

**Zéró karcolás, maximális kényelem:** Nincs tépőzár, ami a hajba akadna! A korona hátulján egy puha, duplagézzel bevont rugalmas "scrunchie" pánt található, ami kényelmesen, nyomás nélkül tartja a koronát a fejen.

**Prémium alapanyagok:** Kívül-belül 100% OEKO-TEX® minősítésű, pihe-puha pamut duplagézből (muszlinból) készült. Belsejében egy filc textilmerevítő gondoskodik arról, hogy a csúcsok büszkén megálljanak, miközben az anyag lágy marad.

**Együtt nő a gyermekkel (One Size):** A rugalmas hátsó pántnak köszönhetően kb. 2-től 7 éves korig tökéletesen és kényelmesen illeszkedik.

Tökéletes ajándék! Az ideális apróságot keresed a babalátogatóba a nagytesónak, vagy egy szülinapi bulira? Ezzel az örök darabbal garantált a mosoly.
(Tipp: Keresd a webshopban a koronához színben tökéletesen passzoló Kalandköpenyeinket, és szerezd be őket kedvezményes szett áron!)

**Anyagösszetétel és Kezelés:**
100% Pamut (Duplagéz) a belső merevítő kivételével.
30°C-os kímélő gépi programon, vagy kézzel mosható, finom nyomkodással (kicsavarni tilos). Szárítógépben nem szárítható. Fektetve, formára igazítva szárítandó.`;

const bundleLongDescription = `A kisbabák az emlékeket, a nagyok a kalandokat kapják! A Szuperhős szettben a kifordítható Kalandköpeny és a hozzá színben tökéletesen passzoló kétoldalas korona együtt érkezik – kedvezményes szett áron.
Legyen szó a világ megmentéséről a nappaliban, királyi teapartiról a kertben, egy családi fotózásról, vagy a kistesó büszke védelmezéséről – ez a páros évekig a legszebb kelléke lesz a gyermekkori varázslatnak.

**Miért ez a legtökéletesebb ajándék?**

**Kifordítható dizájn (2 az 1-ben):** A köpeny és a korona is kétoldalas! Két gyönyörű, harmonizáló földszín/pasztell árnyalat minden darabban: az egyik oldalon ott a vagány, egyedi logó a rohangáláshoz, kifordítva pedig letisztult, elegáns szettet kaptok az ünnepekre, fotózásokra, királyi eseményekre.

**Személyre szabott varázslat:** A köpeny hátára puha filcből, gondos odafigyeléssel varrjuk fel a gyerek saját kezdőbetűjét vagy az egyedi "TESÓ" pajzsot.

**Pillekönnyű és prémium:** Mindkét darab 100% OEKO-TEX® minősítésű pamut duplagézből (muszlinból) készül. Elképesztően puha, légáteresztő, és gyönyörűen, lágyan lobog a gyerekek után futás közben.

**Maximális biztonság és kényelem:** A köpenyt biztonságos, prémium műanyag patentokkal láttuk el, amit a gyerekek is könnyen be tudnak kapcsolni, de ha beakadna valahova, azonnal szétpattan. A korona hátulján puha, duplagézzel bevont rugalmas "scrunchie" pánt található – nincs karcoló tépőzár, ami a hajba akadna.

**Együtt nő a gyermekkel (One Size):** A köpeny kb. 65 cm-es hosszának köszönhetően egy 2 évesen még bokáig érő "varázslóköpeny", 6-7 éves korra pedig tökéletes "szuperhős" méretté válik. A korona a rugalmas pántnak köszönhetően kb. 2-től 7 éves korig kényelmesen illeszkedik.

**Fontos információk az előrendeléshez:** Mivel minden szett egyedileg, a Ti kérésetek alapján, kézzel készül a műhelyünkben, a feldolgozási és varrási idő jelenleg **5-8 munkanap** a feladásig. Köszönjük a türelmeteket!

**Anyagösszetétel és kezelés:**
Alapanyag: 100% OEKO-TEX 100 minősítésű Pamut (Duplagéz) a díszítés és a korona belső merevítője kivételével.
Mosás: 30°C-os kímélő gépi programon, vagy kézzel mosható. Szárítógépben nem szárítható. A hátsó filc díszítés nem vasalható, és a duplagéz anyagot sem javasoljuk vasalni. Fektetve, formára igazítva szárítandó.`;

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
    name: 'Poszter',
    slug: 'poszter',
    description:
      'Személyre szabható emlékposzter a baba születési adataival. Válassz a hat grafikus dizájn és hat háttérszín közül — az elrendezést valós időben alakíthatod a tervezőben. Prémium papírra nyomtatva vagy digitális fájlként.',
    price: 5900,
    category: 'poster',
    series: 'nola',
    variant: 'core',
    imageUrl: '/images/products/origin-poszter.jpg',
    badge: null,
  },
  {
    name: 'Nola Digitális Ajándékkártya',
    slug: 'nola-digitalis-ajandekkartya',
    description: `**A legtökéletesebb ajándék: a választás szabadsága**

Babaváró buliba, keresztelőre vagy születésnapra mész, de bizonytalan vagy a részletekben? Nem tudod pontosan a születési adatokat, a gyerkőc kedvenc színét, vagy hogy épp minek örülnének a legjobban a babaszobában?

Vedd le a terhet a saját válladról, és add meg a legszebb ajándékot a családnak: a választás és a tervezés örömét!

A Nola & Co. Digitális Ajándékkártyával az ünnepelt szülők és gyerkőcök maguk választhatják ki a számukra legkedvesebb darabokat. Legyen szó a baba legelső pillanatait megőrző, személyre szabott emlékekről, a mindennapokat körbeölelő puha textíliákról, vagy a nagyobbak varázslatos kiegészítőiről – a döntés az ő kezükben van!`,
    longDescription: `**Hogyan működik?**

**1.** Válaszd ki a legördülő menüből a kívánt összeget!

**2.** A vásárlás után az ajándékkártyát (és a hozzá tartozó egyedi kuponkódot) azonnal, e-mailben küldjük el neked.

**3.** Ezt az e-mailt egyszerűen továbbíthatod a megajándékozottnak, vagy ki is nyomtathatod, hogy egy szép borítékban, személyesen adhasd át!

Az ajándékkártya a vásárlástól számított **1 évig érvényes**, és a webshopunkban található összes termékre (beleértve a szállítási díjat is) felhasználható.`,
    price: 10000,
    category: 'giftcard',
    series: 'nola',
    variant: 'giftcard',
    imageUrl: '/images/products/nola-digitalis-ajandekkartya.png',
    badge: 'Ajándék',
  },
  // --- Nagytesó kollekció: Kalandköpenyek ---
  {
    name: 'NOLA Hero – A Védelmező Kalandköpeny',
    slug: 'nola-hero-kalandkopeny',
    description:
      'A kisbabák az emlékeket, a nagyok a kalandokat kapják! Kifordítható, kétoldalas prémium duplagéz köpeny a kistesó büszke védelmezőinek. A hátára puha filcből varrjuk fel a gyermek választott kezdőbetűjét – így lesz igazán az övé a szupererő.',
    longDescription: capeLongDescription,
    price: 12900,
    onSale: true,
    salePrice: 10900,
    category: 'cape',
    series: 'nagyteso',
    variant: 'hero',
    imageUrl: '/images/products/nola-hero-kalandkopeny.png',
    badge: 'ÚJDONSÁG',
  },
  {
    name: 'NOLA Stella – Az Álmodozó Kalandköpeny',
    slug: 'nola-stella-kalandkopeny',
    description:
      'A kisbabák az emlékeket, a nagyok a kalandokat kapják! Kifordítható, kétoldalas prémium duplagéz köpeny a kis álmodozóknak. A hátára puha filcből varrjuk fel a gyermek választott kezdőbetűjét – így lesz igazán az övé a varázslat.',
    longDescription: capeLongDescription,
    price: 12900,
    onSale: true,
    salePrice: 10900,
    category: 'cape',
    series: 'nagyteso',
    variant: 'stella',
    imageUrl: '/images/products/nola-stella-kalandkopeny.png',
    badge: 'ÚJDONSÁG',
  },
  {
    name: 'NOLA Crew – A Csapatjátékos Kalandköpeny',
    slug: 'nola-crew-kalandkopeny',
    description:
      'A kisbabák az emlékeket, a nagyok a kalandokat kapják! Kifordítható, kétoldalas prémium duplagéz köpeny, hátán az egyedi "TESÓ" pajzzsal – a csapat legifjabb hőseinek.',
    longDescription: capeLongDescription,
    price: 12900,
    onSale: true,
    salePrice: 10900,
    category: 'cape',
    series: 'nagyteso',
    variant: 'crew',
    imageUrl: '/images/products/nola-crew-kalandkopeny.png',
    badge: 'ÚJDONSÁG',
  },
  {
    name: 'NOLA Kalandköpeny – Prémium Egyedi Tervező',
    slug: 'nola-kalandkopeny-egyedi-tervezo',
    description:
      'Tervezd meg a saját Kalandköpenyed! Itt minden a Ti döntésetek: a külső és belső oldal színe, két motívum és azok színei, valamint a hátára kerülő kezdőbetű színe is. Egyedi, csak nektek készülő prémium duplagéz köpeny.',
    longDescription: capeLongDescription,
    price: 13900,
    onSale: true,
    salePrice: 11900,
    category: 'cape',
    series: 'nagyteso',
    variant: 'custom',
    imageUrl: '/images/products/nola-kalandkopeny-egyedi-tervezo.png',
    badge: 'ÚJDONSÁG',
  },
  // --- Nagytesó kollekció: Koronák ---
  {
    name: 'NOLA Hero Kétoldalas Korona',
    slug: 'nola-hero-korona',
    description:
      'Puha, kétoldalas duplagéz korona a kicsik nagy pillanataihoz – a Hero köpenyhez harmonizáló színekben. Rugalmas "scrunchie" pánttal, karcoló tépőzár nélkül.',
    longDescription: crownLongDescription,
    price: 3900,
    onSale: true,
    salePrice: 2900,
    category: 'crown',
    series: 'nagyteso',
    variant: 'hero',
    imageUrl: '/images/products/nola-hero-korona.png',
    badge: 'ÚJDONSÁG',
  },
  {
    name: 'NOLA Stella Kétoldalas Korona',
    slug: 'nola-stella-korona',
    description:
      'Puha, kétoldalas duplagéz korona a kicsik nagy pillanataihoz – a Stella köpenyhez harmonizáló színekben. Rugalmas "scrunchie" pánttal, karcoló tépőzár nélkül.',
    longDescription: crownLongDescription,
    price: 3900,
    onSale: true,
    salePrice: 2900,
    category: 'crown',
    series: 'nagyteso',
    variant: 'stella',
    imageUrl: '/images/products/nola-stella-korona.png',
    badge: 'ÚJDONSÁG',
  },
  {
    name: 'NOLA Crew Kétoldalas Korona',
    slug: 'nola-crew-korona',
    description:
      'Puha, kétoldalas duplagéz korona a kicsik nagy pillanataihoz – a Crew köpenyhez harmonizáló színekben. Rugalmas "scrunchie" pánttal, karcoló tépőzár nélkül.',
    longDescription: crownLongDescription,
    price: 3900,
    onSale: true,
    salePrice: 2900,
    category: 'crown',
    series: 'nagyteso',
    variant: 'crew',
    imageUrl: '/images/products/nola-crew-korona.png',
    badge: 'ÚJDONSÁG',
  },
  // --- Válogatások: bundle termékek ---
  {
    name: 'Szuperhős szett',
    slug: 'szuperhos-szett',
    description:
      'A tökéletes páros a nagytesóknak: kifordítható, kétoldalas prémium duplagéz Kalandköpeny és a hozzá színben harmonizáló kétoldalas korona egy szettben, kedvezményes áron. Válaszd ki a köpeny és a korona színét, és mi kézzel, egyedileg készítjük el a műhelyünkben.',
    longDescription: bundleLongDescription,
    price: 14900,
    onSale: true,
    salePrice: 12800,
    category: 'bundle',
    series: 'nagyteso',
    variant: 'bundle',
    imageUrl: '/images/products/szuperhos-szett.png',
    badge: 'ÚJDONSÁG',
  },
];

async function main() {
  // Clean up old gift card variants that were replaced by a single product
  const oldGiftCardSlugs = ['nola-ajandekkartya-8900', 'nola-ajandekkartya-22900', 'nola-ajandekkartya-29900'];
  for (const slug of oldGiftCardSlugs) {
    await prisma.product.deleteMany({ where: { slug } });
  }
  console.log('Cleaned up old gift card variants.');

  // One-off rename: the capes originally shipped with an ELŐRENDELÉS badge.
  const renamed = await prisma.product.updateMany({
    where: { badge: 'ELŐRENDELÉS' },
    data: { badge: 'ÚJDONSÁG' },
  });
  if (renamed.count > 0) console.log(`Renamed ${renamed.count} ELŐRENDELÉS badge(s) to ÚJDONSÁG.`);

  // --- Categories ---
  console.log('Seeding categories...');

  const categories = [
    { slug: 'pillow', name: 'Párnák', nameEn: 'KEEPSAKES', sortOrder: 0, visibleOnHome: true },
    { slug: 'poster', name: 'Poszterek', nameEn: 'ART PRINTS', sortOrder: 1, visibleOnHome: true },
    { slug: 'cape', name: 'Kalandköpeny', nameEn: 'ADVENTURE CAPES', sortOrder: 2, visibleOnHome: true },
    { slug: 'crown', name: 'Korona', nameEn: 'CROWNS', sortOrder: 3, visibleOnHome: true },
    { slug: 'bundle', name: 'Válogatások', nameEn: 'BUNDLES', sortOrder: 4, visibleOnHome: true },
    { slug: 'giftcard', name: 'Ajándékkártyák', nameEn: 'GIFT CARDS', sortOrder: 5, visibleOnHome: true },
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
      // On re-seed, only sync the "structural" fields that aren't editable in
      // the admin UI. Admin-editable content (name, description, longDescription,
      // price, badge, imageUrl, images, active, onSale, salePrice) is left
      // untouched so saved edits survive deploys.
      await prisma.product.update({
        where: { slug: product.slug },
        data: {
          category: product.category,
          series: product.series,
          variant: product.variant,
        },
      });
      console.log(`  Updated (kept admin-edited fields): ${existing.name}`);
    } else {
      await prisma.product.create({ data: product });
      console.log(`  Created: ${product.name}`);
    }
  }

  // --- Legacy multi-package gift card → renamed, hidden, inactive. The new
  // fixed-amount digital gift card (nola-digitalis-ajandekkartya) replaces it;
  // /termekek/nola-ajandekkartya 301-redirects to the new product.
  const legacyGiftCard = await prisma.product.findUnique({
    where: { slug: 'nola-ajandekkartya' },
  });
  if (legacyGiftCard && legacyGiftCard.active) {
    await prisma.product.update({
      where: { slug: 'nola-ajandekkartya' },
      data: {
        name: 'Nola & Co ajándékkártya (archív)',
        hiddenFromListing: true,
        active: false,
      },
    });
    console.log('  Archived legacy gift card: nola-ajandekkartya');
  }

  // --- Legacy poster products → hide from listings. They remain in the DB so
  // historical OrderItem FKs stay valid, but the two aliases below replace
  // them as the visible landing cards.
  const legacyPosterSlugs = ['origin-poszter', 'nova-poszter'];
  for (const slug of legacyPosterSlugs) {
    const legacy = await prisma.product.findUnique({ where: { slug } });
    if (legacy) {
      await prisma.product.update({
        where: { slug },
        data: { hiddenFromListing: true, active: false },
      });
      console.log(`  Hid legacy poster product: ${slug}`);
    }
  }

  // --- Product aliases: "landing cards" for the canonical poszter product ---
  console.log('Seeding product aliases...');

  const aliases = [
    {
      slug: 'origin-poszter',
      name: 'ORIGIN poszter',
      imageUrl: '/images/products/origin-poszter.jpg',
      targetProductSlug: 'poszter',
      defaultLayoutId: 'origin-1',
      sortOrder: 0,
    },
    {
      slug: 'nova-poszter',
      name: 'NOVA poszter',
      imageUrl: '/images/products/nova-poszter.jpg',
      targetProductSlug: 'poszter',
      defaultLayoutId: 'nova-1',
      sortOrder: 1,
    },
  ];

  for (const a of aliases) {
    const existing = await prisma.productAlias.findUnique({ where: { slug: a.slug } });
    if (existing) {
      // Keep admin-edited name & imageUrl; only sync routing-structural fields.
      await prisma.productAlias.update({
        where: { slug: a.slug },
        data: {
          targetProductSlug: a.targetProductSlug,
          defaultLayoutId: a.defaultLayoutId,
        },
      });
      console.log(`  Updated alias (kept name/image): ${a.slug}`);
    } else {
      await prisma.productAlias.create({ data: a });
      console.log(`  Created alias: ${a.slug}`);
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
