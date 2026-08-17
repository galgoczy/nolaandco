import { prisma } from './prisma';
import { getCapeConfig, type CapeConfig, type DesignerField } from '@/app/termekek/[slug]/capeData';

/**
 * A csomagok választható értékeit a katalógusból tölti fel.
 *
 * A listák korábban kézzel voltak felsorolva, és elcsúsztak, amint az admin
 * átnevezett vagy törölt egy színt: a Puha kuckó csomag még cappuccino
 * takarót és szundikendőt kínált, a Mesés gyerekszoba pedig „Pillangó I–IV."-et,
 * miközben a pillangók már saját nevet kaptak. Innentől a mezők a `optionsFrom`
 * kategóriájának valódi termékeiből épülnek.
 *
 * Az elfogyott (0 készletű) darabok kimaradnak, hogy a csomagban se lehessen
 * olyan színt választani, ami nincs raktáron.
 */

/**
 * A terméknévből a megkülönböztető rész: „NOLA Cloud takaró – Bézs & Zsálya"
 * → „Bézs & Zsálya". Gondolatjel nélküli neveknél (pl. „ORIGIN Core") a teljes
 * név a felirat.
 */
function optionLabel(name: string): string {
  const parts = name.split(' – ');
  return parts.length > 1 ? parts[parts.length - 1].trim() : name.trim();
}

async function optionsForCategory(category: string): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: {
      category,
      active: true,
      // A null készlet azt jelenti, hogy nincs darabszám-nyilvántartás —
      // az ilyen termék mindig rendelhető.
      NOT: { stock: 0 },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { name: true },
  });
  return products.map((p) => optionLabel(p.name));
}

/**
 * A termékoldalhoz tartozó konfiguráció, katalógusból feltöltött listákkal.
 * Szerver oldalon hívandó (a capeData.ts maga kliensbarát marad).
 */
export async function resolveCapeConfig(slug: string): Promise<CapeConfig> {
  const config = getCapeConfig(slug);
  if (!config.fields || config.fields.length === 0) return config;

  const resolved: DesignerField[] = [];
  for (const field of config.fields) {
    if (!field.optionsFrom) {
      resolved.push(field);
      continue;
    }
    const options = await optionsForCategory(field.optionsFrom);
    // Üres kategóriánál marad a kódbeli lista, hogy az oldal ne legyen
    // választhatatlan — ez csak akkor fordulhat elő, ha minden darab elfogyott.
    resolved.push({ ...field, options: options.length > 0 ? options : field.options });
  }

  return { ...config, fields: resolved };
}
