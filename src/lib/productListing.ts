import { prisma } from './prisma';

/**
 * Item shape used by listing UIs (ProductCard etc.). Covers both real Product
 * rows and ProductAlias "landing cards" that resolve to a canonical product.
 */
export type ListingItem = {
  id: string;
  name: string;
  slug: string;              // the URL slug users click
  price: number;             // price to display
  originalPrice: number | null; // compare-at price when on sale
  imageUrl: string;
  badge: string | null;
  category: string | null;
  series: string | null;
  sortOrder: number;
  isAlias: boolean;
};

/**
 * Umbrella "collection" filters used by the main nav: they expand to several
 * real product categories.
 */
export const CATEGORY_GROUPS: Record<string, string[]> = {
  // Terméktípus-alapú fő útvonalak. A poszter elsődleges kategóriája az
  // Emlékőrzők, de a Dekoráció gyűjtőoldalon is megjelenik.
  emlekorzok: ['pillow', 'poster'],
  textilek: ['szundikendo', 'takaro', 'cape', 'crown'],
  dekoracio: ['poster', 'decor'],
  // Örökölt (életkor-alapú) csoportok — a régi linkek 301-del átirányítanak,
  // ez csak biztonsági háló a kódból érkező hivatkozásoknak.
  kicsiknek: ['pillow', 'poster', 'szundikendo', 'takaro', 'decor'],
  nagyoknak: ['cape', 'crown'],
};

/**
 * Resolve an umbrella slug to its member category slugs: the hardcoded map
 * plus any category whose admin-set `parent` matches. New admin-created
 * categories under Emlékőrzők/Textilek/Dekoráció thus appear automatically.
 */
async function resolveCategoryGroup(slug: string): Promise<string[]> {
  const fixed = CATEGORY_GROUPS[slug] ?? [];
  const children = await prisma.category.findMany({
    where: { parent: slug },
    select: { slug: true },
  });
  const merged = Array.from(new Set(fixed.concat(children.map((c) => c.slug))));
  return merged.length > 0 ? merged : [slug];
}

/**
 * Categories whose pages show hidden products too. Main and preview share one
 * database, so the new collection is hidden (hiddenFromListing) to keep it off
 * the live site, while staying testable on its own category pages here.
 * Remove this exception at launch, when the products are un-hidden.
 */
const SHOW_HIDDEN_IN_CATEGORY = new Set(['cape', 'crown', 'bundle', 'szundikendo', 'takaro', 'decor']);

/** Fetch all products visible in listings + all active aliases, merged. */
export async function getListingItems(opts?: { category?: string }): Promise<ListingItem[]> {
  const categoryFilter = opts?.category
    ? await resolveCategoryGroup(opts.category)
    : undefined;

  const hiddenExemptCategories =
    categoryFilter?.filter((c) => SHOW_HIDDEN_IN_CATEGORY.has(c)) ?? [];

  const [products, aliases] = await Promise.all([
    prisma.product.findMany({
      where: {
        active: true,
        ...(categoryFilter ? { category: { in: categoryFilter } } : {}),
        OR: [
          { hiddenFromListing: false },
          { category: { in: hiddenExemptCategories } },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
    prisma.productAlias.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    }),
  ]);

  // Resolve each alias by looking up its canonical product (for price/category/badge).
  const canonicalSlugs = Array.from(new Set(aliases.map((a) => a.targetProductSlug)));
  const canonicalProducts = canonicalSlugs.length
    ? await prisma.product.findMany({ where: { slug: { in: canonicalSlugs } } })
    : [];
  const canonicalBySlug = new Map(canonicalProducts.map((p) => [p.slug, p]));

  const productItems: ListingItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.onSale && p.salePrice ? p.salePrice : p.price,
    originalPrice: p.onSale && p.salePrice ? p.price : null,
    imageUrl: p.imageUrl,
    badge: p.badge,
    category: p.category ?? null,
    series: p.series ?? null,
    sortOrder: p.sortOrder,
    isAlias: false,
  }));

  const aliasItems: ListingItem[] = aliases
    .map((a): ListingItem | null => {
      const canonical = canonicalBySlug.get(a.targetProductSlug);
      if (!canonical) return null; // orphan alias — skip
      if (categoryFilter && !categoryFilter.includes(canonical.category)) return null;
      return {
        id: `alias:${a.id}`,
        name: a.name,
        slug: a.slug,
        price: canonical.onSale && canonical.salePrice ? canonical.salePrice : canonical.price,
        originalPrice: canonical.onSale && canonical.salePrice ? canonical.price : null,
        imageUrl: a.imageUrl,
        badge: a.badge ?? canonical.badge,
        category: canonical.category ?? null,
        series: canonical.series ?? null,
        sortOrder: a.sortOrder,
        isAlias: true,
      };
    })
    .filter((x): x is ListingItem => x !== null);

  // Homepage/listing order: pillows → posters (aliases appear here) → capes →
  // crowns → giftcards. Within each bucket we keep the item's own sortOrder
  // (then createdAt via fetch order).
  const bucketRank = (cat: string | null) => {
    if (cat === 'pillow') return 0;
    if (cat === 'poster') return 1;
    if (cat === 'szundikendo') return 2;
    if (cat === 'takaro') return 3;
    if (cat === 'cape') return 4;
    if (cat === 'crown') return 5;
    if (cat === 'decor') return 6;
    if (cat === 'bundle') return 7;
    if (cat === 'giftcard') return 8;
    return 9;
  };

  return [...productItems, ...aliasItems].sort((a, b) => {
    const bucketDiff = bucketRank(a.category) - bucketRank(b.category);
    if (bucketDiff !== 0) return bucketDiff;
    return a.sortOrder - b.sortOrder;
  });
}
