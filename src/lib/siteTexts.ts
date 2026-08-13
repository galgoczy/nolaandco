import { prisma } from './prisma';

/**
 * Adminból szerkeszthető szöveghelyek a főoldal blokkjaihoz. Minden slotnak
 * van alapértelmezett (kódbeli) szövege; az adminban mentett érték felülírja.
 * Az üresre mentett érték visszaáll az alapértelmezettre.
 *
 * A többsoros mezőknél az új sor sortörésként jelenik meg; a **szöveg**
 * jelölés félkövérként renderelődik (hírlevél-sáv).
 */
export type SiteTextSlot = {
  key: string;
  label: string;
  group: string;
  multiline?: boolean;
  defaultValue: string;
};

export const SITE_TEXT_SLOTS: SiteTextSlot[] = [
  // --- Hero (videós fejléc) ---
  { key: 'hero-1-eyebrow', label: '1. dia – felvezető sor', group: 'Hero (videós fejléc)', defaultValue: 'EMLÉKEK, AMIK PONTOSAN AKKORÁK, MINT Ő VOLT' },
  { key: 'hero-1-title', label: '1. dia – cím', group: 'Hero (videós fejléc)', multiline: true, defaultValue: '1:1 méretarányú\nszületési emlékpárnák\n& poszterek' },
  { key: 'hero-1-cta', label: '1. dia – gomb', group: 'Hero (videós fejléc)', defaultValue: 'Megtervezem a saját\nemlékpárnámat' },
  { key: 'hero-2-eyebrow', label: '2. dia – felvezető sor', group: 'Hero (videós fejléc)', defaultValue: 'PUHA TEXTILEK A GYEREKKOR APRÓ PILLANATAIHOZ' },
  { key: 'hero-2-title', label: '2. dia – cím', group: 'Hero (videós fejléc)', multiline: true, defaultValue: 'Megérkezett\na Nagytesó kollekció' },
  { key: 'hero-2-cta', label: '2. dia – gomb', group: 'Hero (videós fejléc)', defaultValue: 'Megnézem az újdonságokat' },
  // --- Kategória-rács ---
  { key: 'kategoriak-cim', label: 'Blokk címe', group: 'Vásárolj kategória szerint', defaultValue: 'Vásárolj kategória szerint' },
  { key: 'kategoria-1-felirat', label: '1. kártya felirata', group: 'Vásárolj kategória szerint', defaultValue: 'Emlékőrzők' },
  { key: 'kategoria-2-felirat', label: '2. kártya felirata', group: 'Vásárolj kategória szerint', defaultValue: 'Textilek' },
  { key: 'kategoria-3-felirat', label: '3. kártya felirata', group: 'Vásárolj kategória szerint', defaultValue: 'Dekoráció' },
  // --- Kiemelt újdonság sáv ---
  { key: 'ujdonsag-cim', label: 'Cím', group: 'Kiemelt újdonság sáv', defaultValue: 'Újdonság: Nola Pixie pillangó függők' },
  { key: 'ujdonsag-szoveg', label: 'Szöveg', group: 'Kiemelt újdonság sáv', multiline: true, defaultValue: 'Megérkeztek a Pixie pillangó függők a webshopba. Ezek a könnyed, kézzel készült textildíszek finoman mozognak a gyerekszobában, és kedves részletei lehetnek az olvasósaroknak, kiságynak vagy baldachinnak. Minden darab kis szériában készül, ezért a mintákból egyszerre csak néhány elérhető. Reméljük, találsz köztük olyat, amelyik igazán illik hozzátok.' },
  { key: 'ujdonsag-gomb', label: 'Gomb', group: 'Kiemelt újdonság sáv', defaultValue: 'Megnézem a kollekciót' },
  // --- Bizalmi ikon-sáv ---
  { key: 'bizalom-cim', label: 'Blokk címe', group: 'Bizalmi ikon-sáv', multiline: true, defaultValue: 'Több, mint egy tárgy.\nEgy darabka a családotok történetéből.' },
  { key: 'bizalom-1-cim', label: '1. pont címe', group: 'Bizalmi ikon-sáv', defaultValue: 'Kézműves gondoskodás' },
  { key: 'bizalom-1-szoveg', label: '1. pont szövege', group: 'Bizalmi ikon-sáv', multiline: true, defaultValue: 'Minden darabot egyedileg, szeretettel varrunk budapesti műhelyünkben.' },
  { key: 'bizalom-2-cim', label: '2. pont címe', group: 'Bizalmi ikon-sáv', defaultValue: 'Prémium puhaság' },
  { key: 'bizalom-2-szoveg', label: '2. pont szövege', group: 'Bizalmi ikon-sáv', multiline: true, defaultValue: 'OEKO-TEX® plüss és 100% pamut duplagéz: a legtisztább érintés a legkisebbeknek.' },
  { key: 'bizalom-3-cim', label: '3. pont címe', group: 'Bizalmi ikon-sáv', defaultValue: 'Személyre szabott csodák' },
  { key: 'bizalom-3-szoveg', label: '3. pont szövege', group: 'Bizalmi ikon-sáv', multiline: true, defaultValue: 'A baba pontos születési méretétől a nagytesó kezdőbetűjéig mindent nektek készítünk.' },
  { key: 'bizalom-4-cim', label: '4. pont címe', group: 'Bizalmi ikon-sáv', defaultValue: 'Emlékből kaland' },
  { key: 'bizalom-4-szoveg', label: '4. pont szövege', group: 'Bizalmi ikon-sáv', multiline: true, defaultValue: 'A legelső pillanatoktól a gyermekkori varázslatos játékokig végigkísérjük a családot.' },
  // --- Rólunk bevezető ---
  { key: 'rolunk-cim', label: 'Cím', group: 'Tőlünk, Nektek (Rólunk bevezető)', defaultValue: 'Tőlünk, Nektek.' },
  { key: 'rolunk-szoveg', label: 'Szöveg', group: 'Tőlünk, Nektek (Rólunk bevezető)', multiline: true, defaultValue: 'A Nola & Co. születését nem egyetlen pillanat, hanem egy mély vágy inspirálta: alkotni valamit, ami a leginkább képes megőrizni a legelső napok csodáját – és ami azután is velük marad, ahogy egyre nagyobbra nőnek. Termékeinkben a szülői gondoskodás, a gyermeki fantázia és a letisztult design találkozik.' },
  { key: 'rolunk-gomb', label: 'Gomb', group: 'Tőlünk, Nektek (Rólunk bevezető)', defaultValue: 'Ismerd meg a történetünket' },
  // --- THE ART OF CRAFTING ---
  { key: 'crafting-cim', label: 'Cím', group: 'THE ART OF CRAFTING', defaultValue: 'THE ART OF CRAFTING' },
  { key: 'crafting-alcim', label: 'Alcím', group: 'THE ART OF CRAFTING', defaultValue: 'A műhely titkai' },
  { key: 'crafting-bevezeto', label: 'Bevezető', group: 'THE ART OF CRAFTING', multiline: true, defaultValue: 'A Nola & Co. darabjai nem sorozatgyártásban készülnek. Minden emlékőrző és kiegészítő a te megrendelésedre, a ti egyedi történetetek alapján születik meg budapesti műhelyünkben.' },
  { key: 'crafting-1-cim', label: '1. pont címe', group: 'THE ART OF CRAFTING', defaultValue: 'Prémium alapanyagok' },
  { key: 'crafting-1-szoveg', label: '1. pont szövege', group: 'THE ART OF CRAFTING', multiline: true, defaultValue: 'Legyen szó a párnáink pihe-puha plüsséről, vagy az új termékeink pillekönnyű pamut duplagéz (muszlin) anyagáról, textíliáink és cérnáink kivétel nélkül OEKO-TEX® Standard 100 minősítésűek. Ez garantálja, hogy minden felhasznált anyagot káros anyagokra bevizsgáltak, így az újszülöttek és a nagyobb gyerekek érzékeny bőrével érintkezve is 100%-ig biztonságos választást jelentenek.' },
  { key: 'crafting-2-cim', label: '2. pont címe', group: 'THE ART OF CRAFTING', defaultValue: 'Tartós kidolgozás' },
  { key: 'crafting-2-szoveg', label: '2. pont szövege', group: 'THE ART OF CRAFTING', multiline: true, defaultValue: 'Termékeinket évekre tervezzük. A párnák töltete hipoallergén, mosható és formatartó (nem csomósodik), míg a kalandköpenyek és kiegészítők dupla rétegű anyagból, strapabíró varrással készülnek. Bármelyiket is választod, hosszú távon megőrzik puhaságukat és gyönyörű esésüket az emlékőrzés vagy a mindennapi játék során is.' },
  { key: 'crafting-3-cim', label: '3. pont címe', group: 'THE ART OF CRAFTING', defaultValue: 'Egyedi részletek' },
  { key: 'crafting-3-szoveg', label: '3. pont szövege', group: 'THE ART OF CRAFTING', multiline: true, defaultValue: 'Minden darab a tiétek. A párnákon lévő sziluetteket és születési adatokat modern, bőrbarát és mosásálló technológiával visszük fel az anyagra. A köpenyeken lévő kezdőbetűket és motívumokat pedig kézműves filcből, gondos kézi rátét-varrással (applikálással) rögzítjük, hogy tökéletes, térbeli harmóniát alkossanak.' },
  { key: 'crafting-4-cim', label: '4. pont címe', group: 'THE ART OF CRAFTING', defaultValue: 'Kézműves gondoskodás' },
  { key: 'crafting-4-szoveg', label: '4. pont szövege', group: 'THE ART OF CRAFTING', multiline: true, defaultValue: 'Minden termékünk gondosan, egyedileg készül, hogy a legkisebb babák és a legnagyobb „csapatjátékosok" számára is megbízható, biztonságos és szerethető kiegészítő legyen.' },
  // --- Vélemények ---
  { key: 'velemeny-cim', label: 'Blokk címe', group: 'Vásárlói vélemények', defaultValue: 'Amit a Nola anyukák mondanak' },
  { key: 'velemeny-1-szoveg', label: '1. vélemény', group: 'Vásárlói vélemények', multiline: true, defaultValue: 'Elsírtam magam, amikor kibontottam a csomagolást. Hajszálpontosan akkora, mint a kislányom volt...' },
  { key: 'velemeny-1-nev', label: '1. vélemény – név', group: 'Vásárlói vélemények', defaultValue: 'Zsófi' },
  { key: 'velemeny-2-szoveg', label: '2. vélemény', group: 'Vásárlói vélemények', multiline: true, defaultValue: 'Csodálatos minőség, a – nem is olyan kicsi – fiam azóta a babakori méretű párnájával alszik.' },
  { key: 'velemeny-2-nev', label: '2. vélemény – név', group: 'Vásárlói vélemények', defaultValue: 'Anna' },
  { key: 'velemeny-3-szoveg', label: '3. vélemény', group: 'Vásárlói vélemények', multiline: true, defaultValue: 'A legkülönlegesebb babaszoba kiegészítő, amit valaha láttam. Tökéletes ajándék volt a barátnőmnek.' },
  { key: 'velemeny-3-nev', label: '3. vélemény – név', group: 'Vásárlói vélemények', defaultValue: 'Laura' },
  { key: 'velemeny-4-szoveg', label: '4. vélemény', group: 'Vásárlói vélemények', multiline: true, defaultValue: 'Az első hetek hamar elrepülnek, egy szempillantás és már az újszülöttkor elillan. Életének első napjai jutnak eszembe mindig, mikor a párnára nézek és látom mellette a kislányom a jelenben, mennyi minden történt velünk és mennyi minden fog még. A párna ott lesz velünk mindig, akárcsak az emlékeink az első időszakról. Ő a világ számunkra!' },
  { key: 'velemeny-4-nev', label: '4. vélemény – név', group: 'Vásárlói vélemények', defaultValue: 'Adri' },
  { key: 'velemeny-5-szoveg', label: '5. vélemény', group: 'Vásárlói vélemények', multiline: true, defaultValue: '„Tényleg ekkora volt?" – szerintem ezt fogjuk kérdezni minden alkalommal, amikor ránézünk. 51 cm tiszta boldogság. 🩷 Ez a párna emlékeztet minket arra, milyen pici volt a kislányunk, amikor megszületett. Egy olyan emlék, amit jó lesz évekkel később is újra átölelni.' },
  { key: 'velemeny-5-nev', label: '5. vélemény – név', group: 'Vásárlói vélemények', defaultValue: 'Barbi' },
  { key: 'velemeny-6-szoveg', label: '6. vélemény', group: 'Vásárlói vélemények', multiline: true, defaultValue: 'Gyönyörű emlék egy életre! A baba emlékpárna nagyon puha, igényesen elkészített, és minden apró részlete szeretettel készült. Különleges dísze lett a babaszobának, miközben egy igazán megható emléket őriz. A minősége kifogástalan, a kivitelezés pedig pontosan olyan, mint amire számítottam. Szívből ajánlom mindenkinek, aki egy egyedi és maradandó emléket szeretne megőrizni a kisbabájáról!' },
  { key: 'velemeny-6-nev', label: '6. vélemény – név', group: 'Vásárlói vélemények', defaultValue: 'Kata' },
  // --- Instagram-sáv ---
  { key: 'insta-cim', label: 'Blokk címe', group: 'Instagram-sáv', defaultValue: 'Apró pillanatok, örök emlékek.' },
  { key: 'insta-link', label: 'Link szövege', group: 'Instagram-sáv', defaultValue: 'Kövess minket: @nolaandco.baby' },
  // --- Hírlevél-sáv ---
  { key: 'hirlevel-cim', label: 'Cím', group: 'Hírlevél-sáv', defaultValue: 'Legyél a Nola család része!' },
  { key: 'hirlevel-szoveg', label: 'Szöveg', group: 'Hírlevél-sáv', multiline: true, defaultValue: 'Iratkozz fel, hogy elsőként értesülj a limitált kollekciókról, és megajándékozunk egy **INGYENES SZÁLLÍTÁS** kuponnal az első rendelésedhez!' },
];

const SLOT_BY_KEY = new Map(SITE_TEXT_SLOTS.map((s) => [s.key, s]));

/** Az összes szöveghely effektív értéke (admin-felülírás vagy alapértelmezés). */
export async function getAllSiteTexts(): Promise<Record<string, string>> {
  const overrides = await prisma.siteText.findMany();
  const byKey = new Map<string, string>(overrides.map((o) => [o.key, o.value]));
  const result: Record<string, string> = {};
  for (const slot of SITE_TEXT_SLOTS) {
    result[slot.key] = byKey.get(slot.key) ?? slot.defaultValue;
  }
  return result;
}
