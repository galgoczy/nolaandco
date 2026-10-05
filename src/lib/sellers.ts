/**
 * Eladó-profilok: a webáruházat jogilag üzemeltető (szerződő, számlázó és
 * adatkezelő) egyéni vállalkozó. Kifelé a bolt ugyanaz marad — a cím, a
 * telefonszám, a bankszámla és az átutalási adatok közösek.
 *
 * 2026. október 1. 0:00-tól (budapesti idő) Galgóczy Gergely EV az eladó,
 * Galgóczy Krisztina EV szünetelteti a vállalkozását. Az admin Beállítások
 * oldalán ez felülírható (pl. amikor Kriszti újra aktív lesz).
 */

export type SellerId = 'gergely' | 'kriszti';

export type Seller = {
  id: SellerId;
  /** Természetes személy neve. */
  personName: string;
  /** Az egyéni vállalkozás neve, ahogy a nyilvántartásban szerepel. */
  legalName: string;
  registrationNumber: string;
  taxNumber: string;
  /** A Számlázz.hu Számla Agent kulcsát tartalmazó környezeti változó neve. */
  agentKeyEnv: string;
  /**
   * Küldhető-e a külön „rendelésszám” mező a számlán. A #free csomag nem
   * engedi („Nincs jogosultságod … (rendelésszám)”) — ilyenkor a rendelésszám
   * csak a megjegyzésben szerepel.
   */
  invoiceOrderNumberField: boolean;
};

export const SELLERS: Record<SellerId, Seller> = {
  gergely: {
    id: 'gergely',
    personName: 'Galgóczy Gergely',
    legalName: 'Galgóczy Gergely EV',
    registrationNumber: '60197214',
    taxNumber: '76104020-1-41',
    agentKeyEnv: 'SZAMLAZZ_AGENT_KEY_GERGELY',
    invoiceOrderNumberField: false,
  },
  kriszti: {
    id: 'kriszti',
    personName: 'Galgóczy Krisztina',
    legalName: 'Galgóczy Krisztina EV',
    registrationNumber: '60843867',
    taxNumber: '91306353-1-41',
    agentKeyEnv: 'SZAMLAZZ_AGENT_KEY',
    invoiceOrderNumberField: true,
  },
};

/** 2026. október 1. 0:00 budapesti idő (CEST, UTC+2). */
export const SELLER_CUTOVER = new Date('2026-09-30T22:00:00Z');

/** Az időpont szerinti alapértelmezett eladó (admin felülírás nélkül). */
export function defaultSellerId(now: Date = new Date()): SellerId {
  return now >= SELLER_CUTOVER ? 'gergely' : 'kriszti';
}

export function isSellerId(v: unknown): v is SellerId {
  return v === 'gergely' || v === 'kriszti';
}

/** A rendelés eladója; a váltás előtti (null) rendelések Krisztiéi. */
export function sellerForOrder(sellerId: string | null | undefined): Seller {
  return SELLERS[isSellerId(sellerId) ? sellerId : 'kriszti'];
}

/**
 * A jogi szövegekben (ÁSZF, adatkezelési tájékoztató) használt helyőrzők
 * kitöltése az aktív eladó adataival.
 */
export function fillSellerPlaceholders(text: string, seller: Seller): string {
  return text
    .replace(/\{\{ELADO_NEV\}\}/g, seller.legalName)
    .replace(/\{\{ELADO_SZEMELY\}\}/g, seller.personName)
    .replace(/\{\{NYILVANTARTASI_SZAM\}\}/g, seller.registrationNumber)
    .replace(/\{\{ADOSZAM\}\}/g, seller.taxNumber);
}
