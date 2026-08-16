import { prisma } from './prisma';

/** A variant as submitted by the admin product form. */
export type VariantInput = {
  id?: string;
  name: string;
  colorHex: string | null;
  colorHex2: string | null;
  images: string[];
  priceDiff: number;
  stock: number | null;
  sortOrder: number;
  active: boolean;
};

/** Parse the untrusted `variants` field of an admin request body. */
export function parseVariants(raw: unknown): VariantInput[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  const out: VariantInput[] = [];
  raw.forEach((entry, idx) => {
    if (!entry || typeof entry !== 'object') return;
    const v = entry as Record<string, unknown>;
    const name = typeof v.name === 'string' ? v.name.trim() : '';
    if (!name) return; // névtelen variánst nem mentünk

    const hex = (value: unknown) => {
      const s = typeof value === 'string' ? value.trim() : '';
      return s ? s : null;
    };
    const int = (value: unknown, fallback: number) => {
      const n = typeof value === 'number' ? value : Number(value);
      return Number.isFinite(n) ? Math.trunc(n) : fallback;
    };

    out.push({
      id: typeof v.id === 'string' && v.id ? v.id : undefined,
      name,
      colorHex: hex(v.colorHex),
      colorHex2: hex(v.colorHex2),
      images: Array.isArray(v.images)
        ? v.images.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
        : [],
      priceDiff: int(v.priceDiff, 0),
      stock:
        v.stock === null || v.stock === undefined || v.stock === '' ? null : int(v.stock, 0),
      sortOrder: int(v.sortOrder, idx),
      active: v.active === undefined ? true : Boolean(v.active),
    });
  });

  return out;
}

/**
 * Make the product's variant set match `variants` exactly: variants missing from
 * the payload are deleted, known ids are updated in place (so their id — which
 * the storefront cart references — survives), and the rest are created.
 */
export async function syncProductVariants(productId: string, variants: VariantInput[]) {
  const existing = await prisma.productVariant.findMany({
    where: { productId },
    select: { id: true },
  });
  const existingIds = new Set(existing.map((v) => v.id));
  const keptIds = new Set(
    variants.map((v) => v.id).filter((id): id is string => !!id && existingIds.has(id)),
  );

  const removed = existing.map((v) => v.id).filter((id) => !keptIds.has(id));
  if (removed.length > 0) {
    await prisma.productVariant.deleteMany({ where: { id: { in: removed } } });
  }

  for (const v of variants) {
    const data = {
      name: v.name,
      colorHex: v.colorHex,
      colorHex2: v.colorHex2,
      images: v.images,
      priceDiff: v.priceDiff,
      stock: v.stock,
      sortOrder: v.sortOrder,
      active: v.active,
    };
    if (v.id && existingIds.has(v.id)) {
      await prisma.productVariant.update({ where: { id: v.id }, data });
    } else {
      await prisma.productVariant.create({ data: { ...data, productId } });
    }
  }
}
