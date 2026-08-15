import { prisma } from './prisma';

/**
 * Adminból cserélhető statikus képhelyek. Minden slotnak van alapértelmezett
 * (repóbeli) képe; ha az adminban feltöltenek egy sajátot, az felülírja.
 * Új slot felvételéhez elég ide új sort írni — az admin Megjelenés oldala
 * ebből a listából épül.
 */
export type SiteImageSlot = {
  key: string;
  label: string;
  /** Hol jelenik meg + ajánlott képarány. */
  hint: string;
  defaultUrl: string;
  group: string;
};

export const SITE_IMAGE_SLOTS: SiteImageSlot[] = [
  {
    key: 'home-kategoria-emlekorzok',
    label: 'Emlékőrzők kártya',
    hint: 'Főoldal – Vásárolj kategória szerint (négyzetes, 1:1)',
    defaultUrl: '/images/home/kategoria-kicsikrol.jpg',
    group: 'Főoldal – kategória-kártyák',
  },
  {
    key: 'home-kategoria-textilek',
    label: 'Textilek kártya',
    hint: 'Főoldal – Vásárolj kategória szerint (négyzetes, 1:1)',
    defaultUrl: '/images/home/kategoria-nagyoknak.jpg',
    group: 'Főoldal – kategória-kártyák',
  },
  {
    key: 'home-kategoria-dekoracio',
    label: 'Dekoráció kártya',
    hint: 'Főoldal – Vásárolj kategória szerint (négyzetes, 1:1)',
    defaultUrl: '/images/home/kategoria-valogatasok.jpg',
    group: 'Főoldal – kategória-kártyák',
  },
  {
    key: 'home-hero-kep',
    label: 'Hero fotó',
    hint: 'Főoldal – nyitókép (mobilon 4:5-re, desktopon szélesre vágva jelenik meg)',
    defaultUrl: '/images/newhero.png',
    group: 'Főoldal – szekciók',
  },
  {
    key: 'home-hero-kep-2',
    label: 'Hero fotó – 2. dia (Pixie)',
    hint: 'Főoldal – nyitókép második diája (mobilon 4:4,5-re, desktopon szélesre vágva)',
    defaultUrl: '/images/newhero_butterfly.jpg',
    group: 'Főoldal – szekciók',
  },
  {
    key: 'home-kiemelt-kalandkopeny',
    label: 'Kiemelt újdonság sáv (Pixie pillangók)',
    hint: 'Főoldal – Újdonság: Nola Pixie pillangó függők (négyzetes, 1:1)',
    defaultUrl: '/images/home/kalandkopeny-kiemelt.jpg',
    group: 'Főoldal – szekciók',
  },
  {
    key: 'home-rolunk-intro',
    label: 'Tőlünk, Nektek szekció',
    hint: 'Főoldal – Rólunk bevezető fotó',
    defaultUrl: '/images/home/tolunk-uj.jpg',
    group: 'Főoldal – szekciók',
  },
  {
    key: 'artofcrafting-1',
    label: 'ART OF CRAFTING – 1. fotó (Szabás)',
    hint: 'Főoldal – A műhely titkai (fekvő, 4:3)',
    defaultUrl: '/images/home/artofcrafting-1.jpg',
    group: 'Főoldal – THE ART OF CRAFTING',
  },
  {
    key: 'artofcrafting-2',
    label: 'ART OF CRAFTING – 2. fotó (Kézi applikálás)',
    hint: 'Főoldal – A műhely titkai (fekvő, 4:3)',
    defaultUrl: '/images/home/artofcrafting-2.jpg',
    group: 'Főoldal – THE ART OF CRAFTING',
  },
  {
    key: 'artofcrafting-3',
    label: 'ART OF CRAFTING – 3. fotó (Varrás)',
    hint: 'Főoldal – A műhely titkai (fekvő, 4:3)',
    defaultUrl: '/images/home/artofcrafting-3.jpg',
    group: 'Főoldal – THE ART OF CRAFTING',
  },
];

const SLOT_BY_KEY = new Map(SITE_IMAGE_SLOTS.map((s) => [s.key, s]));

/**
 * A kért slotok effektív képei: admin-feltöltés, ha van, különben az
 * alapértelmezett. Egyetlen lekérdezés az összes slotra.
 */
export async function getSiteImages(keys: string[]): Promise<Record<string, string>> {
  const overrides = await prisma.siteImage.findMany({ where: { key: { in: keys } } });
  const byKey = new Map<string, string>(overrides.map((o) => [o.key, o.url]));
  const result: Record<string, string> = {};
  for (const key of keys) {
    result[key] = byKey.get(key) ?? SLOT_BY_KEY.get(key)?.defaultUrl ?? '';
  }
  return result;
}
