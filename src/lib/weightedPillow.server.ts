import { prisma } from './prisma';
import { normalizeWeightedConfig, offerFor, type WeightedConfig, type WeightedOffer } from './weightedPillow';

export { normalizeWeightedConfig };

const KEY = 'weighted-pillow';

export async function getWeightedConfig(): Promise<WeightedConfig> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  let parsed: unknown = null;
  try {
    parsed = row ? JSON.parse(row.value) : null;
  } catch {
    parsed = null;
  }
  return normalizeWeightedConfig(parsed);
}

export async function setWeightedConfig(config: WeightedConfig): Promise<void> {
  const value = JSON.stringify(config);
  await prisma.setting.upsert({ where: { key: KEY }, update: { value }, create: { key: KEY, value } });
}

/** Kezdőbeállítás (csak ha még nincs): 4 000 g maximum, nem rendelhető. */
export async function ensureWeightedConfig(initialMaxGrams: number): Promise<boolean> {
  const row = await prisma.setting.findUnique({ where: { key: KEY } });
  if (row) return false;
  await setWeightedConfig({ maxGrams: initialMaxGrams, price: null, status: 'unavailable', info: '' });
  return true;
}

/** Több párna aktuális ajánlata egyszerre (kosár, pénztár, szerver). */
export async function getOffers(productIds: string[]): Promise<Record<string, WeightedOffer | null>> {
  const ids = Array.from(new Set(productIds.filter(Boolean)));
  if (ids.length === 0) return {};
  const [config, products] = await Promise.all([
    getWeightedConfig(),
    prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, category: true, weightedEnabled: true, weightedMaxGrams: true },
    }),
  ]);
  const out: Record<string, WeightedOffer | null> = {};
  for (const id of ids) out[id] = null;
  for (const p of products) out[p.id] = offerFor(config, p);
  return out;
}
