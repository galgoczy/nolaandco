import { prisma } from './prisma';

/** "Pasztell rózsaszín & Dusty rózsaszín" → "pasztell-rozsaszin-dusty-rozsaszin" */
function slugifyHu(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Idempotent catalog sync: creates the categories, products and aliases the
 * storefront expects, and applies one-off migrations (badge rename, legacy
 * product archiving). Admin-edited fields on existing products are never
 * overwritten, and nothing is ever deleted (apart from the long-retired
 * gift card variant rows that no order references).
 *
 * Used by both `prisma/seed.ts` (CLI) and the admin "Katalógus frissítés"
 * button (API route), so the shop catalog can be refreshed without shell
 * access to the database.
 */
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

const hushLongDescription = `A patentos kialakításnak köszönhetően magát a kendőt is rögzítheted, vagy cumit, rágókát és más kedves apróságot kapcsolhatsz hozzá. Két réteg duplagézből, kézzel varrjuk őket; méretük 30 × 30 cm. Hat gyönyörű, egymással harmonizáló árnyalatban készülnek, hogy minden kis kéz megtalálhassa a saját kedvencét.

**Miért szeretik a babák és a szülők?**

**Minimal kialakítás:** semmilyen csörgő vagy túlságosan stimuláló részlet nem vonja el a baba figyelmét az alvásról.

**Éppen elég inger:** a csomó és a két puha zsinór kellemes taktilis élményt ad a kis kezeknek, fogzáskor is jól jöhet.

**Patentos rögzítés:** magát a kendőt is rögzítheted, vagy cumit, rágókát, kis kiegészítőt kapcsolhatsz hozzá.

**Kézzel varrott, prémium anyag:** két réteg OEKO-TEX® minősítésű pamut duplagéz.`;

const cloudLongDescription = `Különösen szerethető társ a tavaszi és őszi időszakban, amikor jól esik egy finom, légies plusz réteg. Három gondosan összeválogatott, kétoldalas színpárosításban készülnek, a Nola & Co letisztult világához illően.

**Miért szeretik a babák és a szülők?**

**Két oldal, két hangulat:** kétoldalas kialakítás, két harmonizáló árnyalattal — egyetlen mozdulattal más karakter.

**Pillekönnyű, mégis ölelő:** két réteg duplagéz, ami légáteresztő és puha marad mosásról mosásra.

**Sokoldalú méret:** a 75 × 90 cm ideális a babakocsiba, hordozóba, a délutáni szundikhoz vagy az otthoni összebújáshoz.

**Kézzel készül:** minden takarót a budapesti műhelyünkben varrunk.`;

const pixieLongDescription = `Az OEKO-TEX® pamut anyagból készülő óriás pillangó könnyed szárnyaival, kedves részleteivel és finom pasztellszíneivel játékos, mégis letisztult hangulatot teremt a kiságy vagy a babakuckó fölött, akár a falra rögzítve is.

**Jó tudni**

**Méret:** körülbelül 30 cm széles, az akasztóval együtt körülbelül 70 cm hosszú.

**Elhelyezés:** függő dekoráció gyerekszobába, kiságy vagy babakuckó fölé, vagy falra rögzítve.

**Alapanyag:** OEKO-TEX® minősítésű pamut.`;

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
    withdrawalEligible: true,
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
    withdrawalEligible: true,
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
    withdrawalEligible: true,
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
    withdrawalEligible: true,
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
  // --- Textilek & dekoráció: minden szín/dizájn önálló termék ---
  // Képek és végleges árak adminból kerülnek fel; addig a termékek rejtve
  // maradnak a listázásokból (a saját kategóriaoldalukon láthatók). Új
  // darabok adminból bármikor felvehetők e kategóriákba — a lenti induló
  // választék nem korlát.
  ...[
    'Bézs',
    'Cappuccino',
    'Pasztell rózsaszín',
    'Dusty rózsaszín',
    'Kékesszürke',
    'Acélkék',
  ].map((color, i) => ({
    name: `NOLA Hush szundikendő – ${color}`,
    slug: `nola-hush-szundikendo-${slugifyHu(color)}`,
    description:
      'Pihe-puha társ a legelső összebújásokhoz és a nagy kalandok utáni megnyugváshoz. A minimal kialakítás célja, hogy semmilyen csörgő vagy túlságosan stimuláló részlet ne vonja el a baba figyelmét az alvásról — közben a csomó és a két puha zsinór éppen elegendő taktilis ingert nyújt a kis kezeknek, és fogzáskor is jól jöhet.',
    longDescription: hushLongDescription,
    price: 4900,
    category: 'szundikendo',
    series: 'nola',
    variant: `hush-${slugifyHu(color)}`,
    imageUrl: '',
    badge: 'ÚJDONSÁG',
    withdrawalEligible: true,
    hiddenFromListing: true,
    sortOrder: i,
    material: '100% OEKO-TEX® minősítésű pamut duplagéz (két réteg)',
    size: '30 × 30 cm',
    productionTime: 'kb. 2 hét',
    careInfo:
      '30°C-os kímélő gépi programon vagy kézzel mosható. Szárítógépben nem szárítható. A duplagéz anyagot jellegéből adódóan nem javasoljuk vasalni. Fektetve, formára igazítva szárítandó.',
    features: [
      'OEKO-TEX alapanyagok',
      'Kézzel készült magyar termék',
      'Gyártási idő: kb. 2 hét',
      'Biztonságos kártyás fizetés',
    ],
  })),
  ...[
    'Bézs & Cappuccino',
    'Pasztell rózsaszín & Dusty rózsaszín',
    'Kékesszürke & Acélkék',
  ].map((colorway, i) => ({
    name: `NOLA Cloud takaró – ${colorway}`,
    slug: `nola-cloud-takaro-${slugifyHu(colorway)}`,
    description:
      'Két oldal, két finom hangulat, egyetlen puha ölelés. Két réteg duplagézből, kézzel készülő takaróink pillekönnyűek, mégis kellemesen körbeölelnek. A 75 × 90 cm-es méret ideális a babakocsiba, hordozóba, a délutáni szundikhoz vagy az otthoni összebújáshoz.',
    longDescription: cloudLongDescription,
    price: 14900,
    category: 'takaro',
    series: 'nola',
    variant: `cloud-${slugifyHu(colorway)}`,
    imageUrl: '',
    badge: 'ÚJDONSÁG',
    withdrawalEligible: true,
    hiddenFromListing: true,
    sortOrder: i,
    material: '100% OEKO-TEX® minősítésű pamut duplagéz (két réteg)',
    size: '75 × 90 cm',
    productionTime: 'kb. 2 hét',
    careInfo:
      '30°C-os kímélő gépi programon vagy kézzel mosható. Szárítógépben nem szárítható. A duplagéz anyagot jellegéből adódóan nem javasoljuk vasalni. Fektetve, formára igazítva szárítandó.',
    features: [
      'OEKO-TEX alapanyagok',
      'Kézzel készült magyar termék',
      'Gyártási idő: kb. 2 hét',
      'Biztonságos kártyás fizetés',
    ],
  })),
  // A négy pillangó-modell nevét az admin pontosítja, ha megvannak a minták.
  ...['I.', 'II.', 'III.', 'IV.'].map((numeral, i) => ({
    name: `NOLA Pixie pillangó függő – ${numeral}`,
    slug: `nola-pixie-pillango-fuggo-${i + 1}`,
    description:
      'Egy puha, lebegő kis csoda a gyerekszobába. Az OEKO-TEX® pamut anyagból készülő óriás pillangó könnyed szárnyaival, kedves részleteivel és finom pasztellszíneivel játékos, mégis letisztult hangulatot teremt a kiságy, kuckó fölött, vagy akár a falra rögzítve. Körülbelül 30 cm széles, az akasztóval együtt pedig 70 cm hosszú — egy apró varázslat, amely nap mint nap megmozgatja a fantáziát és mesevilággá változtat bármilyen szobát.',
    longDescription: pixieLongDescription,
    price: 9900,
    category: 'decor',
    series: 'nola',
    variant: `pixie-${i + 1}`,
    imageUrl: '',
    badge: 'ÚJDONSÁG',
    withdrawalEligible: true,
    hiddenFromListing: true,
    sortOrder: i,
    material: 'OEKO-TEX® minősítésű pamut',
    size: 'kb. 30 cm széles, akasztóval együtt kb. 70 cm hosszú',
    productionTime: 'kb. 2 hét',
    careInfo:
      'Kézzel, kímélően tisztítható. Szárítógépben nem szárítható, fektetve, formára igazítva szárítandó.',
    features: [
      'OEKO-TEX alapanyagok',
      'Kézzel készült magyar termék',
      'Gyártási idő: kb. 2 hét',
      'Biztonságos kártyás fizetés',
    ],
  })),
  // --- Válogatások: kurált csomagok (a Szuperhős szett mellett) ---
  // Az árak a briefből jönnek: price = eredeti (áthúzott) ár, salePrice a
  // csomagár. Képek adminból; addig rejtve a listázásokból.
  {
    name: 'Első pillanatok csomag',
    slug: 'elso-pillanatok-csomag',
    description:
      'A legelső fejezet, két formában: 1:1 méretarányú emlékpárna és print emlékposzter, ugyanazokkal a születési adatokkal. A babaváró és újszülöttkori időszak legszebb ajándéka — 2 900 Ft megtakarítással, ingyenes csomagautomatás szállítással.',
    longDescription: `**Mit tartalmaz a csomag?**

**1:1 méretarányú emlékpárna** — a választott modellben (ORIGIN vagy NOVA, CORE / LINEA / ATELIER stílusban), a baba születési adataival.

**Print emlékposzter** — a választott dizájnnal és háttérszínnel, 200 g-os silk felületű művészi papíron, 50×70 cm-es méretben.

Mindkét darab ugyanazokkal a születési adatokkal készül, így tökéletes párost alkotnak a babaszobában.

**Ár:** 35 800 Ft helyett **32 900 Ft** — 2 900 Ft megtakarítás, és a csomagot ingyen szállítjuk csomagautomatába.`,
    price: 35800,
    onSale: true,
    salePrice: 32900,
    category: 'bundle',
    series: 'valogatas',
    variant: 'elso-pillanatok',
    imageUrl: '',
    badge: 'ÚJDONSÁG',
    hiddenFromListing: true,
    sortOrder: 1,
    productionTime: 'kb. 2 hét',
  },
  {
    name: 'Mesés gyerekszoba válogatás',
    slug: 'meses-gyerekszoba-valogatas',
    description:
      'Óriás pillangó függő és print emlékposzter egy csomagban — a falra és a kiságy fölé, egymással harmonizáló pasztell hangulatban. 2 900 Ft megtakarítással, ingyenes csomagautomatás szállítással.',
    longDescription: `**Mit tartalmaz a csomag?**

**NOLA Pixie óriás pillangó függő** — a választott modellben; kb. 30 cm széles, az akasztóval együtt kb. 70 cm.

**Print emlékposzter** — a választott dizájnnal és háttérszínnel, 200 g-os silk felületű művészi papíron, 50×70 cm-es méretben, a baba születési adataival.

**Ár:** 32 800 Ft helyett **29 900 Ft** — 2 900 Ft megtakarítás, és a csomagot ingyen szállítjuk csomagautomatába.`,
    price: 32800,
    onSale: true,
    salePrice: 29900,
    category: 'bundle',
    series: 'valogatas',
    variant: 'meses-gyerekszoba',
    imageUrl: '',
    badge: 'ÚJDONSÁG',
    hiddenFromListing: true,
    sortOrder: 2,
    productionTime: 'kb. 2 hét',
  },
  {
    name: 'Kalandra fel csomag',
    slug: 'kalandra-fel-csomag',
    description:
      'Kifordítható Kalandköpeny és a hozzá színben harmonizáló kétoldalas korona — a hétköznapi varázslat teljes szettje, 900 Ft megtakarítással.',
    longDescription: `**Mit tartalmaz a csomag?**

**NOLA Kalandköpeny** — a választott színvilágban (Hero, Stella vagy Crew), Hero és Stella esetén a gyermek kezdőbetűjével.

**NOLA kétoldalas korona** — a választott, köpenyhez harmonizáló színvilágban.

**Ár:** 16 800 Ft helyett **15 900 Ft** — 900 Ft megtakarítás.`,
    price: 16800,
    onSale: true,
    salePrice: 15900,
    category: 'bundle',
    series: 'valogatas',
    variant: 'kalandra-fel',
    imageUrl: '',
    badge: 'ÚJDONSÁG',
    hiddenFromListing: true,
    sortOrder: 3,
    productionTime: 'kb. 2 hét',
  },
  {
    name: 'Puha kuckó csomag',
    slug: 'puha-kucko-csomag',
    description:
      'Kétoldalas duplagéz takaró és minimal szundikendő egy csomagban — minden, ami a délutáni szundikhoz és az esti összebújásokhoz kell. 900 Ft megtakarítással.',
    longDescription: `**Mit tartalmaz a csomag?**

**NOLA Cloud takaró** — a választott kétoldalas színpárosításban (75 × 90 cm).

**NOLA Hush szundikendő** — a választott színben (30 × 30 cm).

Mindkét darab két réteg OEKO-TEX® minősítésű pamut duplagézből, kézzel készül.

**Ár:** 15 800 Ft helyett **14 900 Ft** — 900 Ft megtakarítás.`,
    price: 15800,
    onSale: true,
    salePrice: 14900,
    category: 'bundle',
    series: 'valogatas',
    variant: 'puha-kucko',
    imageUrl: '',
    badge: 'ÚJDONSÁG',
    withdrawalEligible: true,
    hiddenFromListing: true,
    sortOrder: 4,
    productionTime: 'kb. 2 hét',
    material: '100% OEKO-TEX® minősítésű pamut duplagéz (két réteg)',
    careInfo:
      '30°C-os kímélő gépi programon vagy kézzel mosható. Szárítógépben nem szárítható. Fektetve, formára igazítva szárítandó.',
  },
];

export async function syncCatalog(): Promise<string[]> {
  const log: string[] = [];

  // Clean up old gift card variants that were replaced by a single product
  const oldGiftCardSlugs = ['nola-ajandekkartya-8900', 'nola-ajandekkartya-22900', 'nola-ajandekkartya-29900'];
  for (const slug of oldGiftCardSlugs) {
    await prisma.product.deleteMany({ where: { slug } });
  }
  log.push('Régi ajándékkártya-variánsok eltakarítva.');

  // Ensure the non-personalised goods carry the 14-day withdrawal right.
  // (Existing rows aren't touched by the structural sync below, so set it here.
  // Admins can still enable the flag for any future non-personalised product.)
  const withdrawalEligibleSlugs = [
    'nola-crew-kalandkopeny',
    'nola-hero-korona',
    'nola-stella-korona',
    'nola-crew-korona',
  ];
  const eligibleUpdate = await prisma.product.updateMany({
    where: { slug: { in: withdrawalEligibleSlugs }, withdrawalEligible: false },
    data: { withdrawalEligible: true },
  });
  if (eligibleUpdate.count > 0) {
    log.push(`${eligibleUpdate.count} termék elállásra jogosultként beállítva.`);
  }

  // Digital / no-ship products: the fixed-amount digital gift card carries no
  // shipping cost. (One-off backfill; admins can toggle the flag afterwards.)
  const noShippingSlugs = ['nola-digitalis-ajandekkartya'];
  const noShipUpdate = await prisma.product.updateMany({
    where: { slug: { in: noShippingSlugs }, noShipping: false },
    data: { noShipping: true },
  });
  if (noShipUpdate.count > 0) {
    log.push(`${noShipUpdate.count} termék szállításmentesként beállítva.`);
  }

  // One-off rename: the capes originally shipped with an ELŐRENDELÉS badge.
  const renamed = await prisma.product.updateMany({
    where: { badge: 'ELŐRENDELÉS' },
    data: { badge: 'ÚJDONSÁG' },
  });
  if (renamed.count > 0) log.push(`${renamed.count} ELŐRENDELÉS badge átnevezve ÚJDONSÁG-ra.`);

  // --- Categories ---
  const categories: {
    slug: string;
    name: string;
    nameEn: string;
    sortOrder: number;
    visibleOnHome: boolean;
    parent?: string;
  }[] = [
    // Terméktípus-alapú fő kategóriák: Emlékőrzők · Textilek · Dekoráció.
    // A parent a gyűjtő kategória (a fő navigáció három útvonala).
    { slug: 'pillow', name: 'Emlékpárnák', nameEn: 'KEEPSAKES', sortOrder: 0, visibleOnHome: true, parent: 'emlekorzok' },
    { slug: 'poster', name: 'Születési poszterek', nameEn: 'ART PRINTS', sortOrder: 1, visibleOnHome: true, parent: 'emlekorzok' },
    { slug: 'szundikendo', name: 'Szundikendők', nameEn: 'COMFORTERS', sortOrder: 2, visibleOnHome: false, parent: 'textilek' },
    { slug: 'takaro', name: 'Takarók', nameEn: 'BLANKETS', sortOrder: 3, visibleOnHome: false, parent: 'textilek' },
    { slug: 'cape', name: 'Kalandköpenyek', nameEn: 'ADVENTURE CAPES', sortOrder: 4, visibleOnHome: true, parent: 'textilek' },
    { slug: 'crown', name: 'Koronák', nameEn: 'CROWNS', sortOrder: 5, visibleOnHome: true, parent: 'textilek' },
    { slug: 'decor', name: 'Pillangó függők', nameEn: 'DECOR', sortOrder: 6, visibleOnHome: false, parent: 'dekoracio' },
    { slug: 'bundle', name: 'Válogatások', nameEn: 'BUNDLES', sortOrder: 7, visibleOnHome: true },
    { slug: 'giftcard', name: 'Ajándékkártyák', nameEn: 'GIFT CARDS', sortOrder: 8, visibleOnHome: true },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      // A kategóriakép (imageUrl) adminból tölthető fel, ezért soha nem írjuk felül.
      update: {
        name: cat.name,
        nameEn: cat.nameEn,
        sortOrder: cat.sortOrder,
        visibleOnHome: cat.visibleOnHome,
        parent: cat.parent ?? null,
      },
      create: { ...cat, parent: cat.parent ?? null },
    });
    log.push(`Kategória rendben: ${cat.name}`);
  }

  // --- Products ---
  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) {
      // On re-sync, only the "structural" fields are updated. Admin-editable
      // content (name, description, price, badge, images, active, onSale,
      // salePrice) is left untouched so saved edits survive.
      await prisma.product.update({
        where: { slug: product.slug },
        data: {
          category: product.category,
          series: product.series,
          variant: product.variant,
        },
      });
      log.push(`Termék frissítve (admin-szerkesztések megtartva): ${existing.name}`);
    } else {
      await prisma.product.create({ data: product });
      log.push(`Termék létrehozva: ${product.name}`);
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
    log.push('Régi ajándékkártya archiválva: nola-ajandekkartya');
  }

  // --- Legacy poster products → hide from listings. They remain in the DB so
  // historical OrderItem FKs stay valid; the aliases below replace them as
  // the visible landing cards.
  const legacyPosterSlugs = ['origin-poszter', 'nova-poszter'];
  for (const slug of legacyPosterSlugs) {
    const legacy = await prisma.product.findUnique({ where: { slug } });
    if (legacy) {
      await prisma.product.update({
        where: { slug },
        data: { hiddenFromListing: true, active: false },
      });
      log.push(`Régi poszter termék elrejtve: ${slug}`);
    }
  }

  // --- Product aliases: "landing cards" for the canonical poszter product ---
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
      log.push(`Alias frissítve (név/kép megtartva): ${a.slug}`);
    } else {
      await prisma.productAlias.create({ data: a });
      log.push(`Alias létrehozva: ${a.slug}`);
    }
  }

  // --- A variáns-alapú szülő-termékeket önálló szín-termékek váltották.
  // Rendelés nélkül törölhetők (a variánsaik kaszkáddal mennek); ha mégis
  // tartozna hozzájuk rendelés, archiválunk.
  const legacyVariantParents = [
    'nola-hush-szundikendo',
    'nola-cloud-takaro',
    'nola-pixie-pillango-fuggo',
  ];
  for (const slug of legacyVariantParents) {
    const parentProduct = await prisma.product.findUnique({ where: { slug } });
    if (!parentProduct) continue;
    const orderCount = await prisma.orderItem.count({ where: { productId: parentProduct.id } });
    if (orderCount === 0) {
      await prisma.product.delete({ where: { id: parentProduct.id } });
      log.push(`Régi variáns-alapú termék törölve: ${slug}`);
    } else if (parentProduct.active) {
      await prisma.product.update({
        where: { id: parentProduct.id },
        data: { active: false, hiddenFromListing: true },
      });
      log.push(`Régi variáns-alapú termék archiválva (van rendelése): ${slug}`);
    }
  }

  // --- A korábbi közös "babytextile" kategória szétvált (szundikendo /
  // takaro / decor); az üresen maradt sort eltakarítjuk.
  const legacyBabytextile = await prisma.category.findUnique({ where: { slug: 'babytextile' } });
  if (legacyBabytextile) {
    const remaining = await prisma.product.count({ where: { category: 'babytextile' } });
    if (remaining === 0) {
      await prisma.category.delete({ where: { slug: 'babytextile' } });
      log.push('Régi babytextile kategória törölve (üres).');
    }
  }

  log.push('Katalógus-szinkron kész!');
  return log;
}
